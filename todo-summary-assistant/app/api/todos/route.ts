import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import type { CreateTodoInput } from "@/types/todo"

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables are not set")
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    // Fetch todos from Supabase
    const { data, error } = await supabaseAdmin.from("todos").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)

      // If the table doesn't exist, return a specific error
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        return NextResponse.json({ error: error.message, code: "TABLE_NOT_FOUND" }, { status: 404 })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return the todos as JSON
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching todos:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch todos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables are not set")
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    // Parse the request body
    const body: CreateTodoInput = await request.json()

    // Validate the request body
    if (!body.title || body.title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    console.log("Creating todo with data:", {
      title: body.title.trim(),
      description: body.description ? body.description.trim() : null,
      category: body.category ? body.category.trim() : null,
      due_date: body.due_date || null,
      priority: body.priority || null,
    })

    // Create the todo in Supabase with better error handling
    try {
      const { data, error } = await supabaseAdmin
        .from("todos")
        .insert({
          title: body.title.trim(),
          description: body.description ? body.description.trim() : null,
          category: body.category ? body.category.trim() : null,
          due_date: body.due_date || null,
          priority: body.priority || null,
          is_completed: false, // Always set new todos as not completed
        })
        .select()

      if (error) {
        console.error("Supabase insert error:", error)

        // If the table doesn't exist, return a specific error
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          return NextResponse.json({ error: error.message, code: "TABLE_NOT_FOUND" }, { status: 404 })
        }

        return NextResponse.json({ error: error.message || "Failed to create todo" }, { status: 500 })
      }

      if (!data || data.length === 0) {
        console.error("No data returned from insert")
        return NextResponse.json({ error: "No data returned from insert" }, { status: 500 })
      }

      // Return the created todo as JSON
      return NextResponse.json(data[0], { status: 201 })
    } catch (supabaseError) {
      console.error("Supabase operation error:", supabaseError)
      return NextResponse.json(
        {
          error: "Database operation failed",
          details: supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error creating todo:", error)
    return NextResponse.json(
      {
        error: "Failed to create todo",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
