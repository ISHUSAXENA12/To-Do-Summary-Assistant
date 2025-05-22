"use client"

import type React from "react"

import { useState } from "react"
import { PlusCircle, Calendar, Tag, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion } from "framer-motion"

export default function TodoForm({ onTodoAdded }: { onTodoAdded: () => void }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare the todo data
      const todoData = {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        due_date: dueDate || undefined,
        priority: priority || undefined,
      }

      // Send the data to the API
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todoData),
      })

      // Parse the response
      const responseData = await response.json().catch((err) => {
        console.error("Error parsing response:", err)
        return { error: "Failed to parse response" }
      })

      // Handle the response
      if (!response.ok) {
        console.error("API error response:", responseData)
        throw new Error(responseData.error || responseData.details || `Server responded with ${response.status}`)
      }

      // Reset the form
      setTitle("")
      setDescription("")
      setCategory("")
      setDueDate("")
      setPriority("")
      setIsExpanded(false)

      // Show success message
      toast({
        title: "Success",
        description: "Todo added successfully",
      })

      // Refresh the todo list
      onTodoAdded()
    } catch (error) {
      console.error("Error adding todo:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add todo",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="w-full todo-form shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
          <CardTitle className="text-xl flex items-center">
            <PlusCircle className="mr-2 h-5 w-5 text-primary" />
            Add New Todo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                className="text-base focus:ring-2 focus:ring-primary/50 transition-all"
                onFocus={() => setIsExpanded(true)}
              />
            </div>

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add details (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                    className="resize-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="details" className="border-none">
                    <AccordionTrigger className="text-sm py-2 hover:bg-secondary/50 rounded-md px-2 transition-colors">
                      Additional Details
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-1">
                            <Tag className="h-4 w-4 text-primary" />
                            Category
                          </label>
                          <Input
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            disabled={isSubmitting}
                            placeholder="e.g., Work, Personal"
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
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            disabled={isSubmitting}
                            className="focus:ring-2 focus:ring-primary/50 transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-1">
                            <Flag className="h-4 w-4 text-primary" />
                            Priority
                          </label>
                          <Select value={priority} onValueChange={setPriority} disabled={isSubmitting}>
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
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center">
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
                  Adding...
                </span>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Todo
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
