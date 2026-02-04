"use client"

import { useState, useEffect } from "react"
import { Clock, Calendar, DollarSign, RefreshCcw, TrendingUp, BookOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchUserSessions, type Session } from "@/lib/api"

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSessions() {
      setIsLoading(true)
      const data = await fetchUserSessions()
      setSessions(data)
      setIsLoading(false)
    }
    loadSessions()
  }, [])

  const completedSessions = sessions.filter((s) => s.status === "completed")
  const totalSpent = completedSessions.reduce((sum, s) => sum + s.totalCost, 0)
  const totalRefunded = completedSessions.reduce((sum, s) => sum + (s.refundAmount || 0), 0)
  const totalMinutes = completedSessions.reduce((sum, s) => sum + s.durationMinutes, 0)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Learning History</h1>
        <p className="text-muted-foreground">Track your learning progress and spending</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedSessions.length}</p>
                <p className="text-sm text-muted-foreground">Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalMinutes}</p>
                <p className="text-sm text-muted-foreground">Minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Rs. {totalSpent}</p>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <RefreshCcw className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">Rs. {totalRefunded}</p>
                <p className="text-sm text-muted-foreground">Refunded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session History */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5 text-primary" />
            Session History
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your complete learning timeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-secondary/30 animate-pulse">
                  <div className="h-16 bg-secondary/50 rounded" />
                </div>
              ))}
            </div>
          ) : completedSessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-secondary/30 inline-flex mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No Learning History</h3>
              <p className="text-muted-foreground">Complete a session to see it here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{session.courseTitle}</h3>
                      <p className="text-sm text-muted-foreground">with {session.teacher}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{formatDate(session.startTime)}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(session.startTime)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{session.durationMinutes} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">Rs. {session.totalCost}</span>
                    </div>
                    {session.refundAmount && session.refundAmount > 0 && (
                      <div className="flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4 text-green-500" />
                        <span className="text-green-500">Rs. {session.refundAmount} refunded</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
