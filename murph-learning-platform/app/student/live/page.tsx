"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock, DollarSign, User, BookOpen, Phone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SessionEndDialog } from "@/components/session-end-dialog"

interface ActiveSession {
  sessionId: string
  paymentIntentId: string
  authorizedAmount: number
  courseId: string
  courseTitle: string
  teacher: string
  pricePerMinute: number
  startTime: string
}

export default function LiveSessionPage() {
  const router = useRouter()
  const [seconds, setSeconds] = useState(0)
  const [session, setSession] = useState<ActiveSession | null>(null)
  const [endDialogOpen, setEndDialogOpen] = useState(false)

  useEffect(() => {
    // Load session data from sessionStorage
    const storedSession = sessionStorage.getItem("activeSession")
    if (storedSession) {
      const sessionData = JSON.parse(storedSession) as ActiveSession
      setSession(sessionData)
      
      // Calculate elapsed time since session start
      const startTime = new Date(sessionData.startTime).getTime()
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setSeconds(Math.max(0, elapsed))
    } else {
      // No active session, redirect to courses
      router.push("/student/courses")
    }
  }, [router])

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const currentMinutes = Math.floor(seconds / 60)
  const currentCost = session ? currentMinutes * session.pricePerMinute : 0

  const handleEndSession = () => {
    setEndDialogOpen(true)
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading session...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Session Status */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-4">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium">Session in Progress</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{session.courseTitle}</h1>
      </div>

      {/* Timer and Cost Display */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-xl bg-primary/10 mb-3">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <p className="text-4xl font-bold text-foreground font-mono tracking-wider">
                {formatTime(seconds)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Session Duration</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-xl bg-primary/10 mb-3">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <p className="text-4xl font-bold text-foreground font-mono tracking-wider">
                Rs. {currentCost}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                @ Rs. {session.pricePerMinute}/min
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Authorization Info */}
      <Card className="border-primary/30 bg-primary/5 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Authorized Amount</p>
              <p className="text-lg font-semibold text-foreground">Rs. {session.authorizedAmount}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-lg font-semibold text-primary">
                Rs. {Math.max(0, session.authorizedAmount - currentCost)}
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-secondary/50 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, (currentCost / session.authorizedAmount) * 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Teacher Info */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{session.teacher}</h3>
              <p className="text-muted-foreground">Course Instructor</p>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>500+ sessions completed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transparency Notice */}
      <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
        <p className="text-sm text-muted-foreground text-center">
          You are in control. End the session anytime and only pay for the minutes used.
          The remaining authorized amount will be refunded instantly.
        </p>
      </div>

      {/* End Session Button */}
      <Button 
        onClick={handleEndSession}
        size="lg"
        className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        <Phone className="w-5 h-5 mr-2 rotate-[135deg]" />
        End Session
      </Button>

      <SessionEndDialog
        open={endDialogOpen}
        onOpenChange={setEndDialogOpen}
        sessionId={session.sessionId}
        actualMinutes={currentMinutes}
        actualCost={currentCost}
        authorizedAmount={session.authorizedAmount}
        courseTitle={session.courseTitle}
      />
    </div>
  )
}
