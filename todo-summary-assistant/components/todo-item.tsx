"use client"

import { useState } from "react"
import { Pencil, Trash2, X, Save, Calendar, Tag, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import type { Todo } from "@/types/todo"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface TodoItemProps {
  todo: Todo
  onUpdate: () => void
  onDelete: () => void
}

export default function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description || "")
  const [editCategory, setEditCategory] = useState(todo.category || "")
  const [editDueDate, setEditDueDate] = useState(todo.due_date || "")
  const [editPriority, setEditPriority] = useState(todo.priority || "")
  const { toast } = useToast()

  const handleToggleComplete = async () => {
    setIsLoading(true)
    try {
      const newStatus = !todo.is_completed

      // Show optimistic UI update
      toast({
        title: newStatus ? "Todo completed" : "Todo marked as pending",
        description: newStatus ? "Todo marked as completed" : "Todo returned to pending state",
      })

      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_completed: newStatus,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update todo status")
      }

      // Refresh the todo list to show the updated status
      onUpdate()
    } catch (error) {
      console.error("Error updating todo status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update todo status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription || null,
          category: editCategory || null,
          due_date: editDueDate || null,
          priority: editPriority as "low" | "medium" | "high" | null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update todo")
      }

      toast({
        title: "Success",
        description: "Todo updated successfully",
      })

      setIsEditing(false)
      onUpdate()
    } catch (error) {
      console.error("Error updating todo:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update todo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this todo?")) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete todo")
      }

      toast({
        title: "Success",
        description: "Todo deleted successfully",
      })

      onDelete()
    } catch (error) {
      console.error("Error deleting todo:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete todo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditTitle(todo.title)
    setEditDescription(todo.description || "")
    setEditCategory(todo.category || "")
    setEditDueDate(todo.due_date || "")
    setEditPriority(todo.priority || "")
    setIsEditing(false)
  }

  const getPriorityClass = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "priority-badge-high"
      case "medium":
        return "priority-badge-medium"
      case "low":
        return "priority-badge-low"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`w-full todo-item ${
          todo.is_completed ? "opacity-70 bg-muted/50" : "hover:bg-card/80 dark:hover:bg-card/90"
        }`}
      >
        <CardContent className="p-4 md:p-6">
          {isEditing ? (
            <div className="space-y-4 animate-fade-in">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={isLoading}
                className="text-base focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Todo title"
              />
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
                className="resize-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Description (optional)"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Tag className="h-4 w-4 text-primary" />
                    Category
                  </label>
                  <Input
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    disabled={isLoading}
                    placeholder="Category (optional)"
                    className="focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={editDueDate ? new Date(editDueDate).toISOString().split("T")[0] : ""}
                    onChange={(e) => setEditDueDate(e.target.value ? new Date(e.target.value).toISOString() : "")}
                    disabled={isLoading}
                    className="focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Flag className="h-4 w-4 text-primary" />
                    Priority
                  </label>
                  <Select value={editPriority} onValueChange={setEditPriority} disabled={isLoading}>
                    <SelectTrigger className="focus:ring-2 focus:ring-primary/50 transition-all">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelEdit}
                  disabled={isLoading}
                  className="hover:bg-secondary/80 transition-colors"
                >
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                  className="hover:bg-primary/90 transition-colors"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-1 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <Checkbox
                checked={todo.is_completed}
                onCheckedChange={handleToggleComplete}
                disabled={isLoading}
                className="mt-1 transition-all hover:scale-110"
              />
              <div className="flex-1 space-y-2">
                <div>
                  <h3
                    className={`font-medium text-base ${todo.is_completed ? "line-through text-muted-foreground" : ""}`}
                  >
                    {todo.title}
                  </h3>
                  {todo.description && (
                    <p className={`text-sm text-muted-foreground mt-1 ${todo.is_completed ? "line-through" : ""}`}>
                      {todo.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {todo.category && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 hover:bg-secondary/80 transition-colors"
                    >
                      <Tag className="h-3 w-3" />
                      {todo.category}
                    </Badge>
                  )}

                  {todo.due_date && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 hover:bg-secondary/80 transition-colors"
                    >
                      <Calendar className="h-3 w-3" />
                      {format(new Date(todo.due_date), "MMM d, yyyy")}
                    </Badge>
                  )}

                  {todo.priority && (
                    <Badge className={`flex items-center gap-1 ${getPriorityClass(todo.priority)}`}>
                      <Flag className="h-3 w-3" />
                      {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading || todo.is_completed}
                  className="h-8 w-8 rounded-full hover:bg-secondary/80 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/20 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
