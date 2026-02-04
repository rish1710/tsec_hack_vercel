import Link from "next/link"
import { GraduationCap, BookOpen, Users, Clock, DollarSign, Star, Award, Scale } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-16">
        {/* Logo and Tagline */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/20 shadow-lg shadow-primary/20">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-foreground">Murph</h1>
          </div>
          <p className="text-2xl font-medium text-primary mb-2">Learn by the minute</p>
          <p className="text-muted-foreground text-lg">Choose your role to get started</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* Student Card */}
          <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl text-card-foreground">Student</CardTitle>
              </div>
              <CardDescription className="text-base text-muted-foreground">
                Discover sessions, learn at your pace, and pay only for the time you use.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Users className="w-5 h-5 text-primary/70" />
                  <span>Conversational AI guidance</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <DollarSign className="w-5 h-5 text-primary/70" />
                  <span>Transparent per-minute pricing</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-5 h-5 text-primary/70" />
                  <span>Stop anytime</span>
                </li>
              </ul>
              <Button asChild className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25">
                <Link href="/student">Continue as Student</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Teacher Card */}
          <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl text-card-foreground">Teacher</CardTitle>
              </div>
              <CardDescription className="text-base text-muted-foreground">
                Teach flexibly, get paid instantly, and earn bonuses for quality.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <DollarSign className="w-5 h-5 text-primary/70" />
                  <span>Set your own price</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Star className="w-5 h-5 text-primary/70" />
                  <span>Engagement-based bonuses</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Scale className="w-5 h-5 text-primary/70" />
                  <span>Fair review weighting</span>
                </li>
              </ul>
              <Button asChild className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25">
                <Link href="/teacher">Continue as Teacher</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
