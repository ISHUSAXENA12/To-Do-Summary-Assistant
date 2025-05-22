import { supabaseAdmin } from "./supabase"

export async function checkDatabaseSetup() {
  try {
    console.log("Checking database setup...")

    // Check if the todos table exists
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("*")
      .eq("table_name", "todos")

    if (tablesError) {
      console.error("Error checking tables:", tablesError)
      return false
    }

    if (!tables || tables.length === 0) {
      console.error("Todos table does not exist")
      return false
    }

    console.log("Database setup looks good")
    return true
  } catch (error) {
    console.error("Error checking database setup:", error)
    return false
  }
}
