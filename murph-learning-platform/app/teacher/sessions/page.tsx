import { Video, Clock, User, Play } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const activeSessions = [
  {
    id: 1,
    student: "Vikram Singh",
    topic: "React Hooks Deep Dive",
    duration: 18,
    earnings: 90,
  },
  {
    id: 2,
    student: "Ananya Roy",
    topic: "Python Data Structures",
    duration: 24,
    earnings: 120,
  },
]

const upcomingSessions = [
  {
    id: 1,
    student: "Prateek Mehta",
    topic: "JavaScript Closures",
    scheduledFor: "3:00 PM",
  },
  {
    id: 2,
    student: "Sneha Kapoor",
    topic: "CSS Grid Layout",
    scheduledFor: "5:30 PM",
  },
]

export default function TeacherSessionsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Sessions</h1>
        <p className="text-muted-foreground">Manage your active and upcoming sessions</p>
      </div>

      {/* Active Sessions */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Active Sessions
            </div>
          </CardTitle>
          <CardDescription className="text-muted-foreground">Currently ongoing sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{session.student}</p>
                  <p className="text-sm text-muted-foreground">{session.topic}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{session.duration} min</span>
                  </div>
                  <p className="text-sm font-medium text-primary">Rs. {session.earnings}</p>
                </div>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Video className="w-4 h-4 mr-2" />
                  Join
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Play className="w-5 h-5 text-primary" />
            Upcoming Sessions
          </CardTitle>
          <CardDescription className="text-muted-foreground">Scheduled for today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 rounded-xl bg-secondary/30 border border-border/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{session.student}</p>
                  <p className="text-sm text-muted-foreground">{session.topic}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{session.scheduledFor}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
