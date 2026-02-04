import { DollarSign, TrendingUp, Calendar, Gift } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const earningsHistory = [
  { date: "Feb 4, 2026", sessions: 8, base: 1200, bonus: 180, total: 1380 },
  { date: "Feb 3, 2026", sessions: 6, base: 980, bonus: 120, total: 1100 },
  { date: "Feb 2, 2026", sessions: 10, base: 1500, bonus: 250, total: 1750 },
  { date: "Feb 1, 2026", sessions: 7, base: 1100, bonus: 150, total: 1250 },
]

export default function TeacherEarningsPage() {
  const totalEarnings = earningsHistory.reduce((acc, e) => acc + e.total, 0)
  const totalBonuses = earningsHistory.reduce((acc, e) => acc + e.bonus, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Earnings</h1>
        <p className="text-muted-foreground">Track your income and bonuses</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-3xl font-bold text-foreground mt-1">Rs. {totalEarnings.toLocaleString()}</p>
                <p className="text-sm text-primary mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +18% from last week
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quality Bonuses</p>
                <p className="text-3xl font-bold text-foreground mt-1">Rs. {totalBonuses}</p>
                <p className="text-sm text-muted-foreground mt-1">Based on engagement</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Gift className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-3xl font-bold text-foreground mt-1">31</p>
                <p className="text-sm text-muted-foreground mt-1">This week</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings History */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Earnings History</CardTitle>
          <CardDescription className="text-muted-foreground">Daily breakdown of your earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {earningsHistory.map((day, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-secondary/30 border border-border/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-foreground">{day.date}</span>
                  <span className="text-lg font-bold text-primary">Rs. {day.total.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Sessions</p>
                    <p className="font-medium text-foreground">{day.sessions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Base Earnings</p>
                    <p className="font-medium text-foreground">Rs. {day.base}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bonus</p>
                    <p className="font-medium text-primary">+Rs. {day.bonus}</p>
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
