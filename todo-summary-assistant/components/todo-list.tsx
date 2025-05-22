"use client"

import { useEffect, useState } from "react"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import type { Todo } from "@/types/todo"
import TodoItem from "./todo-item"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AnimatePresence, motion } from "framer-motion"
import { Input } from "@/components/ui/input"

interface TodoListProps {
  refreshTrigger: number
  filter?: "all" | "pending" | "completed"
}

export default function TodoList({ refreshTrigger, filter = "all" }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const fetchTodos = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/todos")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API error response:", errorData)
        throw new Error(errorData.error || `Server responded with ${response.status}`)
      }

      const data = await response.json()

      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error("API returned non-array data:", data)
        setTodos([])
      } else {
        setTodos(data)
      }
    } catch (err) {
      console.error("Error fetching todos:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch todos"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [refreshTrigger])

  useEffect(() => {
    let result = todos

    // Apply filter
    if (filter === "pending") {
      result = result.filter((todo) => !todo.is_completed)
    } else if (filter === "completed") {
      result = result.filter((todo) => todo.is_completed)
    }

    // Apply search
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (todo) =>
          todo.title.toLowerCase().includes(query) ||
          (todo.description && todo.description.toLowerCase().includes(query)) ||
          (todo.category && todo.category.toLowerCase().includes(query)),
      )
    }

    setFilteredTodos(result)
  }, [todos, filter, searchQuery])

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex justify-center items-center py-10"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button
              onClick={fetchTodos}
              variant="outline"
              size="sm"
              className="self-start hover:bg-destructive/10 transition-colors"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {todos.length > 0 && (
        <div className="mb-4">
          <Input
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      )}

      <AnimatePresence>
        {filteredTodos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-10 text-muted-foreground bg-muted/30 rounded-lg"
          >
            <p>
              {searchQuery.trim() !== ""
                ? "No todos match your search."
                : filter === "all"
                  ? "No todos yet. Add one to get started!"
                  : filter === "pending"
                    ? "No pending todos. All caught up!"
                    : "No completed todos yet."}
            </p>
          </motion.div>
        ) : (
          filteredTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onUpdate={fetchTodos} onDelete={fetchTodos} />
          ))
        )}
      </AnimatePresence>
    </div>
  )
}
