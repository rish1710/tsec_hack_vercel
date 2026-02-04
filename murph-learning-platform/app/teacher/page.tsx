import { DollarSign, Users, Clock, Star, TrendingUp, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const stats = [
  {
    title: "Today's Earnings",
    value: "Rs. 2,450",
    change: "+12%",
    icon: DollarSign,
  },
  {
    title: "Active Sessions",
    value: "3",
    change: "Live now",
    icon: Users,
  },
  {
    title: "Avg. Session Duration",
    value: "32 min",
    change: "+5 min",
    icon: Clock,
  },
]

const reviews = [
  {
    id: 1,
    student: "Vikram S.",
    rating: 5,
    comment: "Excellent explanation of complex concepts. Made recursion easy to understand!",
    credibility: "high",
    sessions: 15,
    date: "2 hours ago",
  },
  {
    id: 2,
    student: "Ananya R.",
    rating: 5,
    comment: "Very patient and knowledgeable. Helped me debug my code step by step.",
    credibility: "high",
    sessions: 8,
    date: "5 hours ago",
  },
  {
    id: 3,
    student: "New User",
    rating: 3,
    comment: "Session was okay.",
    credibility: "low",
    sessions: 1,
    date: "1 day ago",
  },
  {
    id: 4,
    student: "Prateek M.",
    rating: 5,
    comment: "Best Python teacher on the platform. Clear explanations and practical examples.",
    credibility: "high",
    sessions: 22,
    date: "1 day ago",
  },
]

export default function TeacherDashboard() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back, Priya</h1>
        <p className="text-muted-foreground">{"Here's how your teaching is performing today."}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-sm text-primary mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Review Insights Section */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Star className="w-5 h-5 text-primary" />
            Review Insights
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Reviews are weighted by student engagement and session history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={cn(
                "p-4 rounded-xl border transition-all",
                review.credibility === "high"
                  ? "bg-secondary/30 border-border/50"
                  : "bg-secondary/10 border-border/30 opacity-60"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{review.student}</span>
                  {review.credibility === "high" ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      Verified Learner
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Low weight
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < review.rating ? "text-primary fill-current" : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-2">{review.comment}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{review.sessions} sessions completed</span>
                <span>{review.date}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
