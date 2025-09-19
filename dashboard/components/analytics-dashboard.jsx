"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Clock, CheckCircle, Users } from "lucide-react"

export function AnalyticsDashboard() {
  const performanceData = [
    { month: "Jan", responseTime: 2.1, resolutionRate: 85 },
    { month: "Feb", responseTime: 2.3, resolutionRate: 87 },
    { month: "Mar", responseTime: 2.0, resolutionRate: 89 },
    { month: "Apr", responseTime: 2.2, resolutionRate: 86 },
    { month: "May", responseTime: 2.3, resolutionRate: 87 },
    { month: "Jun", responseTime: 2.1, resolutionRate: 90 },
  ]

  const wasteTypes = [
    { type: "General Waste", percentage: 45, color: "bg-blue-500" },
    { type: "Recyclables", percentage: 30, color: "bg-green-500" },
    { type: "Organic", percentage: 15, color: "bg-yellow-500" },
    { type: "Hazardous", percentage: 10, color: "bg-red-500" },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Analytics Dashboard
        </CardTitle>
        <CardDescription>Performance charts and response time tracking</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-600">87%</div>
                  <div className="text-xs text-muted-foreground">Resolution Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">2.3h</div>
                  <div className="text-xs text-muted-foreground">Avg Response</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">94.2%</div>
                  <div className="text-xs text-muted-foreground">AI Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-cyan-500" />
                <div>
                  <div className="text-2xl font-bold text-cyan-600">1,247</div>
                  <div className="text-xs text-muted-foreground">Active Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Response Time Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Response Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end justify-between gap-2">
              {performanceData.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-primary rounded-t"
                    style={{ height: `${(data.responseTime / 3) * 100}%` }}
                  />
                  <div className="text-xs mt-2 text-muted-foreground">{data.month}</div>
                  <div className="text-xs font-medium">{data.responseTime}h</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Waste Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Waste Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wasteTypes.map((waste, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${waste.color}`} />
                    <span className="text-sm">{waste.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div className={`h-2 rounded-full ${waste.color}`} style={{ width: `${waste.percentage}%` }} />
                    </div>
                    <span className="text-sm font-medium w-8">{waste.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Reports Processed Today</span>
              <Badge variant="secondary">47</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Teams Active</span>
              <Badge variant="default">12</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending High Priority</span>
              <Badge variant="destructive">3</Badge>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="text-sm font-medium mb-2">Next Steps</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Deploy additional crew to downtown area</li>
                <li>• Review AI model accuracy for hazardous waste</li>
                <li>• Schedule maintenance for collection vehicles</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
