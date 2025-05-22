import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST() {
  try {
    // Check if Supabase environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables are not set")
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    // Create the todos table
    const { error } = await supabaseAdmin.rpc("create_todos_table")

    if (error) {
      console.error("Error creating todos table:", error)

      // If the function doesn't exist, create the table directly
      if (error.message.includes("function") && error.message.includes("does not exist")) {
        const createTableResult = await createTodosTableDirectly()
        return NextResponse.json(createTableResult)
      }

      return NextResponse.json({ error: "Failed to create todos table", details: error }, { status: 500 })
    }

    return NextResponse.json({ message: "Database initialized successfully" })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize database",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

async function createTodosTableDirectly() {
  try {
    // Create the todos table directly with SQL
    const { error } = await supabaseAdmin.rpc("create_todos_table_sql")

    if (error) {
      console.error("Error creating todos table directly:", error)

      // If the function doesn't exist, create the table with raw SQL
      if (error.message.includes("function") && error.message.includes("does not exist")) {
        const { error: sqlError } = await supabaseAdmin
          .from("_exec_sql")
          .select("*")
          .eq(
            "query",
            `
          CREATE TABLE IF NOT EXISTS public.todos (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            is_completed BOOLEAN DEFAULT FALSE,
            category TEXT,
            due_date TIMESTAMP WITH TIME ZONE,
            priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_todos_is_completed ON public.todos(is_completed);
          CREATE INDEX IF NOT EXISTS idx_todos_category ON public.todos(category);
          CREATE INDEX IF NOT EXISTS idx_todos_due_date ON public.todos(due_date);
          CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos(created_at);
        `,
          )

        if (sqlError) {
          console.error("Error executing raw SQL:", sqlError)
          return { error: "Failed to create todos table with raw SQL", details: sqlError }
        }

        return { message: "Database initialized successfully with raw SQL" }
      }

      return { error: "Failed to create todos table directly", details: error }
    }

    return { message: "Database initialized successfully with SQL function" }
  } catch (error) {
    console.error("Error in createTodosTableDirectly:", error)
    return {
      error: "Failed in createTodosTableDirectly",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}
