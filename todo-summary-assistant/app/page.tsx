"use client"

import { useState, useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import TodoForm from "@/components/todo-form"
import TodoList from "@/components/todo-list"
import SummarizeButton from "@/components/summarize-button"
import { ModeToggle } from "@/components/mode-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Circle, ListTodo } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const handleTodoAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
    toast({
      title: "Todo added",
      description: "Your todo has been added successfully",
    })
  }

  // Initial data load
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // Check if the database is initialized by fetching todos
        const response = await fetch("/api/todos")

        if (!response.ok) {
          console.error("Error checking database:", await response.text())
        }

        // Trigger data load
        setRefreshTrigger((prev) => prev + 1)
      } catch (error) {
        console.error("Error checking database:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkDatabase()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 dark:from-background dark:to-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex justify-between items-center border-b pb-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Todo Summary Assistant
              </h1>
              <p className="text-muted-foreground">Manage your tasks and get AI-powered summaries sent to Slack</p>
            </div>
            <ModeToggle />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Tabs
                defaultValue="all"
                className="w-full"
                value={activeTab}
                onValueChange={(value) => {
                  setActiveTab(value)
                  // Refresh the list when changing tabs
                  setRefreshTrigger((prev) => prev + 1)
                }}
              >
                <TabsList className="grid w-full grid-cols-3 p-1">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all"
                  >
                    <ListTodo className="mr-2 h-4 w-4" />
                    All Todos
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all"
                  >
                    <Circle className="mr-2 h-4 w-4" />
                    Pending
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Completed
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4 animate-fade-in">
                  <TodoForm onTodoAdded={handleTodoAdded} />
                  <div className="h-6"></div>
                  <TodoList refreshTrigger={refreshTrigger} filter="all" />
                </TabsContent>
                <TabsContent value="pending" className="mt-4 animate-fade-in">
                  <TodoForm onTodoAdded={handleTodoAdded} />
                  <div className="h-6"></div>
                  <TodoList refreshTrigger={refreshTrigger} filter="pending" />
                </TabsContent>
                <TabsContent value="completed" className="mt-4 animate-fade-in">
                  <TodoList refreshTrigger={refreshTrigger} filter="completed" />
                </TabsContent>
              </Tabs>
            </div>

            <div className="md:col-span-1">
              <SummarizeButton />
            </div>
          </div>
        </motion.div>
      </div>
      <Toaster />
    </main>
  )
}
