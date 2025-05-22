import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    // Check if Supabase environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables are not set")
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    // Check if the todos table exists
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("*")
      .eq("table_schema", "public")
      .eq("table_name", "todos")

    if (tablesError) {
      console.error("Error checking tables:", tablesError)
      return NextResponse.json({ error: "Failed to check database tables", details: tablesError }, { status: 500 })
    }

    if (!tables || tables.length === 0) {
      // Table doesn't exist, create it
      const { error: createError } = await supabaseAdmin.rpc("create_todos_table")

      if (createError) {
        console.error("Error creating todos table:", createError)
        return NextResponse.json({ error: "Failed to create todos table", details: createError }, { status: 500 })
      }

      return NextResponse.json({ message: "Todos table created successfully" })
    }

    // Check the table structure
    const { data: columns, error: columnsError } = await supabaseAdmin
      .from("information_schema.columns")
      .select("*")
      .eq("table_schema", "public")
      .eq("table_name", "todos")

    if (columnsError) {
      console.error("Error checking columns:", columnsError)
      return NextResponse.json({ error: "Failed to check database columns", details: columnsError }, { status: 500 })
    }

    // Return the database status
    return NextResponse.json({
      status: "ok",
      tableExists: true,
      columns: columns.map((col) => col.column_name),
    })
  } catch (error) {
    console.error("Error checking database setup:", error)
    return NextResponse.json(
      {
        error: "Failed to check database setup",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
