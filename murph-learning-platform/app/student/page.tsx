"use client"

import { useChat } from "@ai-sdk/react"
import Link from "next/link"
import { Send, Play, Clock, BookOpen, ArrowRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export default function StudentDashboard() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Hi there! I'm Murph, your learning assistant. What would you like to learn today? I can help you find teachers for subjects like mathematics, programming, languages, music, and more.",
      },
    ],
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Chat Interface */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            Ask Murph
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Tell me what you want to learn today, and I will find the perfect session for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] mb-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3",
                    message.role === "user" && "flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-full",
                      message.role === "assistant" ? "bg-primary/20" : "bg-secondary"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <BookOpen className="w-4 h-4 text-primary" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-foreground/80" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "space-y-1 max-w-[80%]",
                      message.role === "user" && "text-right"
                    )}
                  >
                    <p className="text-sm font-medium text-foreground">
                      {message.role === "assistant" ? "Murph" : "You"}
                    </p>
                    <div
                      className={cn(
                        "rounded-xl px-4 py-2",
                        message.role === "assistant"
                          ? "bg-card text-muted-foreground"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Murph</p>
                    <div className="rounded-xl px-4 py-2 bg-card">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="What do you want to learn today?"
              className="flex-1 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Dashboard Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Start Learning Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm group hover:border-primary/30 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Play className="w-5 h-5 text-primary" />
              Start Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                <p className="text-sm text-muted-foreground mb-3">
                  Browse our courses and start a session. Pay only for the minutes you use.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-primary">
                    <Clock className="w-4 h-4" />
                    <span>Pay per minute</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ArrowRight className="w-4 h-4" />
                    <span>Instant refunds</span>
                  </div>
                </div>
              </div>
              <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/student/courses" className="flex items-center justify-center gap-2">
                  Browse Courses
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Last Learning Summary Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm group hover:border-primary/30 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="w-5 h-5 text-primary" />
              Last Learning Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">React Fundamentals</span>
                  <span className="text-xs text-muted-foreground">Yesterday</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">with Arjun Patel</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="text-foreground">45 min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Cost</span>
                    <span className="text-foreground">Rs. 225</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Covered: Components, Props, State management basics, and JSX syntax.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
