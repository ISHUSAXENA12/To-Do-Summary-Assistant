import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    if (!process.env.SLACK_WEBHOOK_URL) {
      return NextResponse.json({ error: "Slack webhook URL is not configured" }, { status: 500 })
    }

    // Fetch incomplete todos
    const { data: todos, error } = await supabaseAdmin
      .from("todos")
      .select("*")
      .eq("is_completed", false)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!todos || todos.length === 0) {
      return NextResponse.json({ message: "No pending todos to summarize" }, { status: 200 })
    }

    // Format todos for the AI
    const todoText = todos
      .map((todo, index) => {
        let text = `${index + 1}. ${todo.title}`
        if (todo.description) text += ` - ${todo.description}`
        if (todo.category) text += ` [Category: ${todo.category}]`
        if (todo.priority) text += ` [Priority: ${todo.priority}]`
        if (todo.due_date) text += ` [Due: ${new Date(todo.due_date).toLocaleDateString()}]`
        return text
      })
      .join("\n")

    // Generate summary with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes todo lists. Provide a concise summary of the pending tasks, grouping related items and highlighting priorities. Mention due dates and categories when relevant. Keep your response under 300 words.",
        },
        {
          role: "user",
          content: `Here are my pending todos:\n${todoText}\n\nPlease summarize these tasks in a clear and organized way.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const summary = completion.choices[0].message.content

    // Send to Slack
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL

    const slackResponse = await fetch(slackWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "📋 Todo Summary",
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Pending Tasks:* ${todos.length}`,
            },
          },
          {
            type: "divider",
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: summary || "No summary available",
            },
          },
        ],
      }),
    })

    if (!slackResponse.ok) {
      const slackError = await slackResponse.text()
      return NextResponse.json({ error: `Failed to send to Slack: ${slackError}` }, { status: 500 })
    }

    return NextResponse.json({
      message: "Summary sent to Slack successfully",
      summary,
      todoCount: todos.length,
    })
  } catch (error) {
    console.error("Error summarizing todos:", error)
    return NextResponse.json(
      {
        error: "Failed to summarize todos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
