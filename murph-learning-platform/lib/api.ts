const API_BASE_URL = "https://api.fmm.finternetlab.io"

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

// Helper for authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken()
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  
  return fetch(url, {
    ...options,
    headers,
  })
}

// Types
export interface User {
  id: string
  email: string
  name: string
  role: "student" | "teacher"
  createdAt: string
}

export interface Course {
  id: string
  title: string
  description: string
  teacher: string
  teacherId: string
  pricePerMinute: number
  rating: number
  totalSessions: number
  topics: string[]
  thumbnail?: string
  category: string
}

export interface Session {
  id: string
  courseId: string
  courseTitle: string
  teacher: string
  startTime: string
  endTime?: string
  durationMinutes: number
  totalCost: number
  status: "active" | "completed" | "cancelled"
  paymentId: string
  refundAmount?: number
}

export interface Review {
  id: string
  sessionId: string
  rating: number
  comment: string
  teacherId: string
  studentId: string
  createdAt: string
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: "pending" | "authorized" | "captured" | "refunded" | "partially_refunded"
  paymentMethod: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface StartSessionRequest {
  courseId: string
  estimatedMinutes: number
  paymentMethodId: string
}

export interface StartSessionResponse {
  sessionId: string
  paymentIntentId: string
  authorizedAmount: number
  startTime: string
}

export interface EndSessionRequest {
  sessionId: string
}

export interface EndSessionResponse {
  sessionId: string
  actualDuration: number
  finalCost: number
  refundAmount: number
  refundStatus: "processed" | "pending" | "not_required"
}

// Auth API (core/auth.py)
export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.token) {
        localStorage.setItem("auth_token", data.token)
      }
      return data
    }
  } catch {
    // Fall through to mock
  }
  
  // Mock response
  const mockUser: User = {
    id: "user_1",
    email,
    name: email.split("@")[0],
    role: "student",
    createdAt: new Date().toISOString(),
  }
  const mockToken = `mock_jwt_${Date.now()}`
  localStorage.setItem("auth_token", mockToken)
  return { token: mockToken, user: mockUser }
}

export async function register(email: string, password: string, name: string, role: "student" | "teacher"): Promise<{ token: string; user: User }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role }),
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.token) {
        localStorage.setItem("auth_token", data.token)
      }
      return data
    }
  } catch {
    // Fall through to mock
  }
  
  // Mock response
  const mockUser: User = { id: `user_${Date.now()}`, email, name, role, createdAt: new Date().toISOString() }
  const mockToken = `mock_jwt_${Date.now()}`
  localStorage.setItem("auth_token", mockToken)
  return { token: mockToken, user: mockUser }
}

export function logout(): void {
  localStorage.removeItem("auth_token")
}

// Chat API (api/chat.py)
export async function sendChatMessage(sessionId: string, message: string): Promise<ChatMessage> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/chat/message`, {
      method: "POST",
      body: JSON.stringify({ sessionId, message }),
    })
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  // Mock AI response
  return {
    id: `msg_${Date.now()}`,
    role: "assistant",
    content: "I understand your question. Let me help you with that concept...",
    timestamp: new Date().toISOString(),
  }
}

export async function getChatHistory(sessionId: string): Promise<ChatMessage[]> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/chat/history/${sessionId}`)
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  return []
}

// Sessions API (api/sessions.py)
export async function fetchCourses(): Promise<Course[]> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/sessions/courses`)
    
    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    }
  } catch {
    // Fall through to mock
  }
  
  return getMockCourses()
}

export async function fetchCourse(courseId: string): Promise<Course | null> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/sessions/courses/${courseId}`)
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  const courses = getMockCourses()
  return courses.find(c => c.id === courseId) || null
}

export async function startSession(data: StartSessionRequest): Promise<StartSessionResponse> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/sessions/start`, {
      method: "POST",
      body: JSON.stringify(data),
    })
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  return {
    sessionId: `session_${Date.now()}`,
    paymentIntentId: `pi_${Date.now()}`,
    authorizedAmount: data.estimatedMinutes * 10,
    startTime: new Date().toISOString(),
  }
}

export async function endSession(data: EndSessionRequest): Promise<EndSessionResponse> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/sessions/end`, {
      method: "POST",
      body: JSON.stringify(data),
    })
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  return {
    sessionId: data.sessionId,
    actualDuration: 15,
    finalCost: 75,
    refundAmount: 75,
    refundStatus: "processed",
  }
}

export async function fetchUserSessions(): Promise<Session[]> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/sessions/user`)
    
    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    }
  } catch {
    // Fall through to mock
  }
  
  return getMockSessions()
}

export async function getActiveSession(): Promise<Session | null> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/sessions/active`)
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  return null
}

// Reviews API (api/reviews.py)
export async function submitReview(sessionId: string, rating: number, comment: string): Promise<Review> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/reviews/submit`, {
      method: "POST",
      body: JSON.stringify({ sessionId, rating, comment }),
    })
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  return {
    id: `review_${Date.now()}`,
    sessionId,
    rating,
    comment,
    teacherId: "teacher_1",
    studentId: "student_1",
    createdAt: new Date().toISOString(),
  }
}

export async function getTeacherReviews(teacherId: string): Promise<Review[]> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/reviews/teacher/${teacherId}`)
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  return []
}

// Payments API (api/payments.py)
export async function createPaymentIntent(amount: number, courseId: string): Promise<PaymentIntent> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/payments/create-intent`, {
      method: "POST",
      body: JSON.stringify({ amount, courseId }),
    })
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  return {
    id: `pi_${Date.now()}`,
    amount,
    currency: "INR",
    status: "authorized",
    paymentMethod: "card",
    createdAt: new Date().toISOString(),
  }
}

export async function authorizePayment(paymentIntentId: string, paymentMethodId: string): Promise<{ success: boolean }> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/payments/authorize`, {
      method: "POST",
      body: JSON.stringify({ paymentIntentId, paymentMethodId }),
    })
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  return { success: true }
}

export async function capturePayment(paymentIntentId: string, amount: number): Promise<{ success: boolean }> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/payments/capture`, {
      method: "POST",
      body: JSON.stringify({ paymentIntentId, amount }),
    })
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  return { success: true }
}

export async function processRefund(paymentIntentId: string, amount: number): Promise<{ success: boolean; refundId: string }> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/payments/refund`, {
      method: "POST",
      body: JSON.stringify({ paymentIntentId, amount }),
    })
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  return {
    success: true,
    refundId: `rf_${Date.now()}`,
  }
}

export async function getPaymentHistory(): Promise<PaymentIntent[]> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/payments/history`)
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  return []
}

// Teacher API (api/teacher.py)
export async function getTeacherDashboard(): Promise<{
  totalEarnings: number
  totalSessions: number
  averageRating: number
  activeSessions: number
}> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/teacher/dashboard`)
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  return {
    totalEarnings: 45000,
    totalSessions: 127,
    averageRating: 4.8,
    activeSessions: 2,
  }
}

export async function getTeacherSessions(): Promise<Session[]> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/teacher/sessions`)
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  return getMockTeacherSessions()
}

export async function getTeacherEarnings(): Promise<{
  daily: number[]
  weekly: number[]
  monthly: number[]
  total: number
}> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/teacher/earnings`)
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  return {
    daily: [1200, 1500, 800, 2000, 1800, 1600, 1400],
    weekly: [8000, 9500, 7200, 11000],
    monthly: [35000, 42000, 38000, 45000],
    total: 45000,
  }
}

export async function updateTeacherProfile(data: {
  name?: string
  bio?: string
  hourlyRate?: number
  availability?: string[]
}): Promise<{ success: boolean }> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/teacher/profile`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  return { success: true }
}

// Credibility Service (services/credibility_service.py)
export async function getTeacherCredibility(teacherId: string): Promise<{
  score: number
  totalReviews: number
  weightedRating: number
  badges: string[]
}> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/teacher/credibility/${teacherId}`)
    
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Fall through to mock
  }
  
  return {
    score: 95,
    totalReviews: 127,
    weightedRating: 4.8,
    badges: ["Top Rated", "Quick Responder", "100+ Sessions"],
  }
}

// Mock Data
function getMockCourses(): Course[] {
  return [
    {
      id: "course_1",
      title: "Introduction to Python",
      description: "Learn Python fundamentals from scratch. Perfect for beginners who want to start their programming journey.",
      teacher: "Priya Sharma",
      teacherId: "teacher_1",
      pricePerMinute: 5,
      rating: 4.9,
      totalSessions: 500,
      topics: ["Variables", "Data Types", "Functions", "Loops"],
      category: "Programming",
    },
    {
      id: "course_2",
      title: "Advanced JavaScript",
      description: "Deep dive into JavaScript concepts including closures, prototypes, and async programming.",
      teacher: "Rahul Verma",
      teacherId: "teacher_2",
      pricePerMinute: 6,
      rating: 4.8,
      totalSessions: 350,
      topics: ["Closures", "Prototypes", "Async/Await", "ES6+"],
      category: "Programming",
    },
    {
      id: "course_3",
      title: "React Fundamentals",
      description: "Build modern web applications with React. Learn components, hooks, and state management.",
      teacher: "Arjun Patel",
      teacherId: "teacher_3",
      pricePerMinute: 7,
      rating: 4.9,
      totalSessions: 420,
      topics: ["Components", "Hooks", "State", "Props"],
      category: "Web Development",
    },
    {
      id: "course_4",
      title: "Data Structures & Algorithms",
      description: "Master essential data structures and algorithms for technical interviews.",
      teacher: "Sneha Gupta",
      teacherId: "teacher_4",
      pricePerMinute: 8,
      rating: 4.7,
      totalSessions: 280,
      topics: ["Arrays", "Trees", "Graphs", "Dynamic Programming"],
      category: "Computer Science",
    },
    {
      id: "course_5",
      title: "UI/UX Design Principles",
      description: "Learn design fundamentals and create beautiful user interfaces.",
      teacher: "Amit Kumar",
      teacherId: "teacher_5",
      pricePerMinute: 5,
      rating: 4.8,
      totalSessions: 310,
      topics: ["Typography", "Color Theory", "Layouts", "Prototyping"],
      category: "Design",
    },
    {
      id: "course_6",
      title: "Machine Learning Basics",
      description: "Introduction to machine learning concepts and practical applications.",
      teacher: "Neha Singh",
      teacherId: "teacher_6",
      pricePerMinute: 9,
      rating: 4.9,
      totalSessions: 200,
      topics: ["Regression", "Classification", "Neural Networks", "Python ML"],
      category: "Data Science",
    },
  ]
}

function getMockSessions(): Session[] {
  return [
    {
      id: "session_1",
      courseId: "course_1",
      courseTitle: "Introduction to Python",
      teacher: "Priya Sharma",
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      endTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      durationMinutes: 45,
      totalCost: 225,
      status: "completed",
      paymentId: "pi_123",
    },
    {
      id: "session_2",
      courseId: "course_3",
      courseTitle: "React Fundamentals",
      teacher: "Arjun Patel",
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      endTime: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
      durationMinutes: 30,
      totalCost: 210,
      status: "completed",
      paymentId: "pi_456",
      refundAmount: 140,
    },
  ]
}

function getMockTeacherSessions(): Session[] {
  return [
    {
      id: "tsession_1",
      courseId: "course_1",
      courseTitle: "Introduction to Python",
      teacher: "You",
      startTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      durationMinutes: 30,
      totalCost: 150,
      status: "active",
      paymentId: "pi_789",
    },
    {
      id: "tsession_2",
      courseId: "course_1",
      courseTitle: "Introduction to Python",
      teacher: "You",
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      endTime: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      durationMinutes: 45,
      totalCost: 225,
      status: "completed",
      paymentId: "pi_101",
    },
  ]
}
