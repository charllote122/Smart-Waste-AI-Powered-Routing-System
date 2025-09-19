"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, CheckCircle, Clock, X } from "lucide-react"

export function RealTimeAlerts() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "critical",
      title: "Hazardous Waste Detected",
      message: "AI detected hazardous materials at Industrial District. Immediate response required.",
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false,
      location: "Industrial District",
    },
    {
      id: 2,
      type: "high",
      title: "Multiple Overflowing Bins",
      message: "3 bins reported overflowing in Downtown area within 10 minutes.",
      timestamp: new Date(Date.now() - 15 * 60000),
      read: false,
      location: "Downtown",
    },
    {
      id: 3,
      type: "medium",
      title: "Team Alpha Completed Task",
      message: "Successfully resolved overflowing bin issue on Main Street.",
      timestamp: new Date(Date.now() - 30 * 60000),
      read: true,
      location: "Main Street",
    },
    {
      id: 4,
      type: "info",
      title: "New Citizen Report",
      message: "Broken bin reported on Oak Street. AI confidence: 89.3%",
      timestamp: new Date(Date.now() - 45 * 60000),
      read: true,
      location: "Oak Street",
    },
  ])

  const [newAlertCount, setNewAlertCount] = useState(2)

  // Simulate new alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance every 10 seconds
        const newAlert = {
          id: Date.now(),
          type: ["info", "medium", "high", "critical"][Math.floor(Math.random() * 4)],
          title: "New Report Received",
          message: "AI analysis completed for new waste report.",
          timestamp: new Date(),
          read: false,
          location: ["Downtown", "North Side", "Industrial District", "Park Avenue"][Math.floor(Math.random() * 4)],
        }
        setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]) // Keep only 10 alerts
        setNewAlertCount((prev) => prev + 1)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const getAlertIcon = (type) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getAlertVariant = (type) => {
    switch (type) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "info":
        return "default"
      default:
        return "outline"
    }
  }

  const markAsRead = (id) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)))
    setNewAlertCount((prev) => Math.max(0, prev - 1))
  }

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
    const alert = alerts.find((a) => a.id === id)
    if (alert && !alert.read) {
      setNewAlertCount((prev) => Math.max(0, prev - 1))
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Real-time Alerts
              {newAlertCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {newAlertCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Instant notifications for critical reports</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No alerts at this time</div>
          ) : (
            alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`transition-all ${!alert.read ? "ring-2 ring-primary/20 bg-primary/5" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium text-sm">{alert.title}</div>
                          <Badge variant={getAlertVariant(alert.type)} className="text-xs">
                            {alert.type}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">{alert.message}</div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{alert.location}</span>
                          <span>{formatTimeAgo(alert.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!alert.read && (
                        <Button size="sm" variant="ghost" onClick={() => markAsRead(alert.id)} className="h-6 w-6 p-0">
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => dismissAlert(alert.id)} className="h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {alerts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-transparent"
              onClick={() => {
                setAlerts((prev) => prev.map((alert) => ({ ...alert, read: true })))
                setNewAlertCount(0)
              }}
            >
              Mark All as Read
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
