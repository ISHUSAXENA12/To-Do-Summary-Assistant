import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import type { UpdateTodoInput } from "@/types/todo"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables are not set")
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    const { data, error } = await supabaseAdmin.from("todos").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching todo:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch todo",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables are not set")
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    const body: UpdateTodoInput = await request.json()

    // Prepare updates object with all fields that need to be updated
    const updates: UpdateTodoInput & { updated_at: string } = {
      updated_at: new Date().toISOString(),
    }

    // Only include fields that are provided in the request
    if (body.title !== undefined) {
      updates.title = body.title.trim()
    }

    if (body.description !== undefined) {
      updates.description = body.description.trim() || null
    }

    if (body.category !== undefined) {
      updates.category = body.category.trim() || null
    }

    if (body.due_date !== undefined) {
      updates.due_date = body.due_date || null
    }

    if (body.priority !== undefined) {
      updates.priority = body.priority || null
    }

    // Explicitly handle is_completed to ensure it's properly updated
    if (body.is_completed !== undefined) {
      updates.is_completed = body.is_completed
    }

    // Update the todo in Supabase
    const { data, error } = await supabaseAdmin.from("todos").update(updates).eq("id", params.id).select().single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating todo:", error)
    return NextResponse.json(
      {
        error: "Failed to update todo",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables are not set")
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    const { error } = await supabaseAdmin.from("todos").delete().eq("id", params.id)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting todo:", error)
    return NextResponse.json(
      {
        error: "Failed to delete todo",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
