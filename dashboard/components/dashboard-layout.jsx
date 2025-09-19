"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, BarChart3, Users, FileText, Bell, Menu, X, Home, Settings, LogOut } from "lucide-react"

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", icon: Home, current: true },
    { name: "Live Map", icon: MapPin, current: false },
    { name: "Reports", icon: FileText, current: false },
    { name: "Analytics", icon: BarChart3, current: false },
    { name: "Team", icon: Users, current: false },
    { name: "Alerts", icon: Bell, current: false },
    { name: "Settings", icon: Settings, current: false },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-primary">WMS Dashboard</h2>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <Button key={item.name} variant={item.current ? "default" : "ghost"} className="w-full justify-start">
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-card border-r border-border">
          <div className="flex items-center h-16 px-4 border-b border-border">
            <h2 className="text-lg font-semibold text-primary">WMS Dashboard</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <Button key={item.name} variant={item.current ? "default" : "ghost"} className="w-full justify-start">
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            <Button variant="ghost" className="w-full justify-start text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-card border-b border-border">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="lg:hidden mr-2" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold">Municipal Waste Management</h1>
            </div>

            {/* Key metrics */}
            <div className="hidden md:flex items-center space-x-4">
              <Card className="px-3 py-2">
                <div className="flex items-center space-x-2">
                  <div className="text-sm">
                    <div className="font-semibold text-green-600">87%</div>
                    <div className="text-xs text-muted-foreground">Resolution</div>
                  </div>
                </div>
              </Card>
              <Card className="px-3 py-2">
                <div className="flex items-center space-x-2">
                  <div className="text-sm">
                    <div className="font-semibold text-blue-600">2.3h</div>
                    <div className="text-xs text-muted-foreground">Avg Response</div>
                  </div>
                </div>
              </Card>
              <Card className="px-3 py-2">
                <div className="flex items-center space-x-2">
                  <div className="text-sm">
                    <div className="font-semibold text-purple-600">94.2%</div>
                    <div className="text-xs text-muted-foreground">AI Accuracy</div>
                  </div>
                </div>
              </Card>
              <Card className="px-3 py-2">
                <div className="flex items-center space-x-2">
                  <div className="text-sm">
                    <div className="font-semibold text-cyan-600">1,247</div>
                    <div className="text-xs text-muted-foreground">Active Users</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
