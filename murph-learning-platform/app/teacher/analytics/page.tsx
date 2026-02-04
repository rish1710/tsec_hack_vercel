import { BarChart3, Users, Clock, Star, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const topicStats = [
  { topic: "Python Basics", sessions: 45, avgDuration: 35, rating: 4.9 },
  { topic: "React & JavaScript", sessions: 32, avgDuration: 40, rating: 4.8 },
  { topic: "Data Structures", sessions: 28, avgDuration: 45, rating: 4.7 },
  { topic: "Web Development", sessions: 22, avgDuration: 30, rating: 4.8 },
]

const weeklyData = [
  { day: "Mon", sessions: 5, earnings: 750 },
  { day: "Tue", sessions: 7, earnings: 1050 },
  { day: "Wed", sessions: 4, earnings: 600 },
  { day: "Thu", sessions: 8, earnings: 1200 },
  { day: "Fri", sessions: 6, earnings: 900 },
  { day: "Sat", sessions: 3, earnings: 450 },
  { day: "Sun", sessions: 2, earnings: 300 },
]

const maxEarnings = Math.max(...weeklyData.map((d) => d.earnings))

export default function TeacherAnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-muted-foreground">Insights into your teaching performance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Users className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">127</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Clock className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">4,520</p>
              <p className="text-sm text-muted-foreground">Minutes Taught</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Star className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">4.8</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">92%</p>
              <p className="text-sm text-muted-foreground">Retention Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="w-5 h-5 text-primary" />
            Weekly Performance
          </CardTitle>
          <CardDescription className="text-muted-foreground">Sessions and earnings this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-48">
            {weeklyData.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center">
                  <span className="text-xs text-primary font-medium mb-1">Rs. {day.earnings}</span>
                  <div
                    className="w-full bg-primary/80 rounded-t-lg transition-all"
                    style={{ height: `${(day.earnings / maxEarnings) * 140}px` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Topic Performance */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Topic Performance</CardTitle>
          <CardDescription className="text-muted-foreground">How your different topics are performing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topicStats.map((topic) => (
              <div
                key={topic.topic}
                className="p-4 rounded-xl bg-secondary/30 border border-border/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-foreground">{topic.topic}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-primary fill-current" />
                    <span className="text-sm font-medium text-foreground">{topic.rating}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Sessions</p>
                    <p className="font-medium text-foreground">{topic.sessions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg. Duration</p>
                    <p className="font-medium text-foreground">{topic.avgDuration} min</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
