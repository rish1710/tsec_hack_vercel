"use client"

import { useState } from "react"
import { User, Palette, Bell, Moon, Sun, Monitor } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "preferences", label: "Preferences", icon: Bell },
]

interface SettingsPageProps {
  role: "student" | "teacher"
}

export function SettingsPage({ role }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState("profile")
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark")

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border/50 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Profile Information</CardTitle>
            <CardDescription className="text-muted-foreground">Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <Button variant="outline" className="border-border/50 text-foreground hover:bg-secondary/50 bg-transparent">
                Change Photo
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                <Input
                  id="firstName"
                  defaultValue={role === "teacher" ? "Priya" : "Vikram"}
                  className="bg-secondary/50 border-border/50 text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                <Input
                  id="lastName"
                  defaultValue={role === "teacher" ? "Sharma" : "Singh"}
                  className="bg-secondary/50 border-border/50 text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={role === "teacher" ? "priya@example.com" : "vikram@example.com"}
                className="bg-secondary/50 border-border/50 text-foreground"
              />
            </div>
            {role === "teacher" && (
              <div className="space-y-2">
                <Label htmlFor="rate" className="text-foreground">Rate per Minute (Rs.)</Label>
                <Input
                  id="rate"
                  type="number"
                  defaultValue="5"
                  className="bg-secondary/50 border-border/50 text-foreground"
                />
              </div>
            )}
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Appearance Tab */}
      {activeTab === "appearance" && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Appearance</CardTitle>
            <CardDescription className="text-muted-foreground">Customize how Murph looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-foreground">Theme</Label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
                    theme === "dark"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/50"
                  )}
                >
                  <Moon className="w-5 h-5" />
                  Dark
                </button>
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
                    theme === "light"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/50"
                  )}
                >
                  <Sun className="w-5 h-5" />
                  Light
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
                    theme === "system"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/50"
                  )}
                >
                  <Monitor className="w-5 h-5" />
                  System
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Preferences</CardTitle>
            <CardDescription className="text-muted-foreground">Manage your notification and session preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email updates about sessions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Session Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded before scheduled sessions</p>
              </div>
              <Switch defaultChecked />
            </div>
            {role === "student" && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground">Cost Alerts</Label>
                  <p className="text-sm text-muted-foreground">Alert when session cost reaches limit</p>
                </div>
                <Switch defaultChecked />
              </div>
            )}
            {role === "teacher" && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground">New Student Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when new students join</p>
                </div>
                <Switch defaultChecked />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
