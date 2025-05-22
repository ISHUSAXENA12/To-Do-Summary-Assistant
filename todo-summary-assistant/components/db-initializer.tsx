"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Database, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface DbInitializerProps {
  onInitialized: () => void
}

export default function DbInitializer({ onInitialized }: DbInitializerProps) {
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const initializeDatabase = async () => {
    setIsInitializing(true)
    setError(null)

    try {
      const response = await fetch("/api/db-init", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize database")
      }

      toast({
        title: "Success",
        description: "Database initialized successfully",
      })

      onInitialized()
    } catch (error) {
      console.error("Error initializing database:", error)
      setError(error instanceof Error ? error.message : "Failed to initialize database")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initialize database",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  useEffect(() => {
    initializeDatabase()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Setup
          </CardTitle>
          <CardDescription>Setting up the database for Todo Summary Assistant</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-center text-muted-foreground">
                {isInitializing ? "Initializing database..." : "Checking database status..."}
              </p>
            </div>
          )}
        </CardContent>
        {error && (
          <CardFooter>
            <Button onClick={initializeDatabase} disabled={isInitializing} className="w-full">
              {isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                "Retry Initialization"
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
