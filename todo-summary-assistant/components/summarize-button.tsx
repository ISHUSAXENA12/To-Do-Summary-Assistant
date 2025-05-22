"use client"

import { useState } from "react"
import { Bot, Send, Check, AlertCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"

export default function SummarizeButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [todoCount, setTodoCount] = useState(0)
  const [slackSuccess, setSlackSuccess] = useState(false)
  const { toast } = useToast()

  const handleSummarize = async () => {
    setIsLoading(true)
    setSummary(null)
    setSlackSuccess(false)

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to summarize todos")
      }

      if (data.message === "No pending todos to summarize") {
        toast({
          title: "No pending todos",
          description: "There are no pending todos to summarize.",
        })
        setIsLoading(false)
        return
      }

      setSummary(data.summary)
      setTodoCount(data.todoCount)
      setSlackSuccess(true)

      toast({
        title: "Success",
        description: "Summary sent to Slack successfully!",
      })
    } catch (error) {
      console.error("Error summarizing todos:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to summarize todos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="w-full shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
            <CardTitle className="text-xl flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-primary" />
              Summarize & Share
            </CardTitle>
            <CardDescription>Generate an AI summary of your pending todos and send it to Slack</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button
              onClick={handleSummarize}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 transition-colors"
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
                  Generating Summary...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Summarize & Send to Slack
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="w-full shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-3 bg-primary/5 rounded-t-lg">
              <CardTitle className="text-xl flex items-center">
                <Bot className="mr-2 h-5 w-5 text-primary" />
                AI Summary
              </CardTitle>
              <CardDescription>
                {todoCount} pending {todoCount === 1 ? "todo" : "todos"} summarized
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-line">{summary}</p>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-4 px-6">
              {slackSuccess ? (
                <Alert className="bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                  <Check className="h-4 w-4" />
                  <AlertDescription>Successfully sent to Slack</AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Failed to send to Slack</AlertDescription>
                </Alert>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
