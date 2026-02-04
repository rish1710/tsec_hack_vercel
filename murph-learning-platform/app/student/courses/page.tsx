"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Star, Clock, Users, Filter, Play } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PaymentDialog, type PaymentData } from "@/components/payment-dialog"
import { fetchCourses, startSession, type Course } from "@/lib/api"

const categories = ["All", "Programming", "Web Development", "Computer Science", "Design", "Data Science"]

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  useEffect(() => {
    async function loadCourses() {
      setIsLoading(true)
      try {
        const data = await fetchCourses()
        setCourses(data || [])
        setFilteredCourses(data || [])
      } catch (error) {
        console.log("[v0] Error loading courses:", error)
        setCourses([])
        setFilteredCourses([])
      } finally {
        setIsLoading(false)
      }
    }
    loadCourses()
  }, [])

  useEffect(() => {
    let filtered = courses

    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.topics.some((topic) => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((course) => course.category === selectedCategory)
    }

    setFilteredCourses(filtered)
  }, [searchQuery, selectedCategory, courses])

  const handleStartCourse = (course: Course) => {
    setSelectedCourse(course)
    setPaymentDialogOpen(true)
  }

  const handlePaymentSuccess = async (paymentData: PaymentData) => {
    if (!selectedCourse) return

    try {
      const sessionData = await startSession({
        courseId: selectedCourse.id,
        estimatedMinutes: paymentData.estimatedMinutes,
        paymentMethodId: paymentData.paymentMethodId,
      })

      // Store session data in sessionStorage for the live page
      sessionStorage.setItem(
        "activeSession",
        JSON.stringify({
          sessionId: sessionData.sessionId,
          paymentIntentId: sessionData.paymentIntentId,
          authorizedAmount: paymentData.authorizedAmount,
          courseId: selectedCourse.id,
          courseTitle: selectedCourse.title,
          teacher: selectedCourse.teacher,
          pricePerMinute: selectedCourse.pricePerMinute,
          startTime: sessionData.startTime,
        })
      )

      setPaymentDialogOpen(false)
      router.push("/student/live")
    } catch (error) {
      console.error("Error starting session:", error)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Browse Courses</h1>
        <p className="text-muted-foreground">Find the perfect course and start learning today</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search courses, teachers, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 bg-secondary/50 border-border/50 text-foreground">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {categories.map((category) => (
              <SelectItem key={category} value={category} className="text-foreground">
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm animate-pulse">
              <CardHeader>
                <div className="h-6 bg-secondary/50 rounded w-3/4" />
                <div className="h-4 bg-secondary/50 rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-secondary/50 rounded mb-4" />
                <div className="h-10 bg-secondary/50 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No courses found matching your criteria</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all group"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">with {course.teacher}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-secondary/50 text-muted-foreground">
                    {course.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>

                <div className="flex flex-wrap gap-2">
                  {course.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                    >
                      {topic}
                    </span>
                  ))}
                  {course.topics.length > 3 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground">
                      +{course.topics.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-primary">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{course.totalSessions}+</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Rs. {course.pricePerMinute}/min</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleStartCourse(course)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Course
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        course={selectedCourse}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
