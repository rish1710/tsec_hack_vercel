"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GraduationCap, MessageSquare, BookOpen, Video, History, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/student", label: "Chat", icon: MessageSquare },
  { href: "/student/courses", label: "Courses", icon: BookOpen },
  { href: "/student/sessions", label: "Sessions", icon: Video },
  { href: "/student/history", label: "History", icon: History },
  { href: "/student/settings", label: "Settings", icon: Settings },
]

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <header className="relative border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">Murph</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== "/student" && pathname.startsWith(item.href))
              const isExactMatch = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    (item.href === "/student" ? isExactMatch : isActive)
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/50 bg-card/80 backdrop-blur-md z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/student" && pathname.startsWith(item.href))
            const isExactMatch = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium transition-all",
                  (item.href === "/student" ? isExactMatch : isActive)
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
