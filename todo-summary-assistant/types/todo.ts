export interface Todo {
  id: string
  title: string
  description: string | null
  is_completed: boolean
  category: string | null
  due_date: string | null
  priority: "low" | "medium" | "high" | null
  created_at: string
  updated_at: string
}

export interface CreateTodoInput {
  title: string
  description?: string
  category?: string
  due_date?: string
  priority?: "low" | "medium" | "high"
}

export interface UpdateTodoInput {
  title?: string
  description?: string
  is_completed?: boolean
  category?: string
  due_date?: string
  priority?: "low" | "medium" | "high"
}
