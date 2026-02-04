"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Play, Clock, Calendar, ArrowRight, RefreshCcw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchUserSessions, type Session } from "@/lib/api"

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSessions() {
      setIsLoading(true)
      try {
        const data = await fetchUserSessions()
        setSessions(data || [])
      } catch (error) {
        console.log("[v0] Error loading sessions:", error)
        setSessions([])
      } finally {
        setIsLoading(false)
      }
    }
    loadSessions()
  }, [])

  const activeSessions = sessions.filter((s) => s.status === "active")
  const completedSessions = sessions.filter((s) => s.status === "completed")

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">My Sessions</h1>
        <p className="text-muted-foreground">View and manage your learning sessions</p>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="bg-secondary/30 border border-border/50">
          <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Active ({activeSessions.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Completed ({completedSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="border-border/50 bg-card/50 animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-20 bg-secondary/50 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeSessions.length === 0 ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6 text-center py-12">
                <div className="p-4 rounded-full bg-secondary/30 inline-flex mb-4">
                  <Play className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No Active Sessions</h3>
                <p className="text-muted-foreground mb-4">Start a new course to begin learning</p>
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/student/courses">
                    Browse Courses
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            activeSessions.map((session) => (
              <Card key={session.id} className="border-primary/30 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">{session.courseTitle}</CardTitle>
                      <CardDescription className="text-muted-foreground">with {session.teacher}</CardDescription>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2" />
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{session.durationMinutes} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Started {formatDate(session.startTime)}</span>
                      </div>
                    </div>
                    <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Link href="/student/live">
                        Rejoin
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border/50 bg-card/50 animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-20 bg-secondary/50 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : completedSessions.length === 0 ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6 text-center py-12">
                <div className="p-4 rounded-full bg-secondary/30 inline-flex mb-4">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No Completed Sessions</h3>
                <p className="text-muted-foreground">Your completed sessions will appear here</p>
              </CardContent>
            </Card>
          ) : (
            completedSessions.map((session) => (
              <Card key={session.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">{session.courseTitle}</CardTitle>
                      <CardDescription className="text-muted-foreground">with {session.teacher}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-secondary/50 text-muted-foreground">
                      Completed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium text-foreground">{session.durationMinutes} min</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Paid</p>
                      <p className="font-medium text-foreground">Rs. {session.totalCost}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium text-foreground">{formatDate(session.startTime)}</p>
                    </div>
                    {session.refundAmount && session.refundAmount > 0 && (
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <RefreshCcw className="w-3 h-3" />
                          Refunded
                        </p>
                        <p className="font-medium text-green-500">Rs. {session.refundAmount}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
