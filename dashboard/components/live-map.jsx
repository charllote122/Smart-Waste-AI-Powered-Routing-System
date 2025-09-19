"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Eye } from "lucide-react"

export function LiveMap() {
  const [selectedReport, setSelectedReport] = useState(null)
  const [filter, setFilter] = useState("all")

  const reports = [
    { id: 1, lat: 40.7128, lng: -74.006, priority: "high", type: "Overflowing Bin", status: "pending" },
    { id: 2, lat: 40.7589, lng: -73.9851, priority: "medium", type: "Illegal Dumping", status: "assigned" },
    { id: 3, lat: 40.7505, lng: -73.9934, priority: "low", type: "Missed Collection", status: "resolved" },
    { id: 4, lat: 40.7282, lng: -73.7949, priority: "high", type: "Hazardous Waste", status: "pending" },
    { id: 5, lat: 40.6892, lng: -74.0445, priority: "medium", type: "Broken Bin", status: "in-progress" },
  ]

  const filteredReports = filter === "all" ? reports : reports.filter((r) => r.priority === filter)

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-purple-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Live Map
            </CardTitle>
            <CardDescription>GPS-plotted reports with color-coded priorities</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All
            </Button>
            <Button variant={filter === "high" ? "default" : "outline"} size="sm" onClick={() => setFilter("high")}>
              High
            </Button>
            <Button variant={filter === "medium" ? "default" : "outline"} size="sm" onClick={() => setFilter("medium")}>
              Medium
            </Button>
            <Button variant={filter === "low" ? "default" : "outline"} size="sm" onClick={() => setFilter("low")}>
              Low
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 h-96">
          {/* Map Area */}
          <div className="flex-1 bg-muted rounded-lg relative overflow-hidden">
            {/* Simulated map background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
              <div className="absolute inset-0 opacity-20">
                {/* Grid pattern to simulate streets */}
                <svg className="w-full h-full">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#666" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            </div>

            {/* Report markers */}
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className={`absolute w-4 h-4 rounded-full ${getPriorityColor(report.priority)} cursor-pointer transform -translate-x-2 -translate-y-2 border-2 border-white shadow-lg hover:scale-125 transition-transform`}
                style={{
                  left: `${((report.lng + 74.1) / 0.3) * 100}%`,
                  top: `${((40.8 - report.lat) / 0.15) * 100}%`,
                }}
                onClick={() => setSelectedReport(report)}
              />
            ))}
          </div>

          {/* Report Details Panel */}
          <div className="w-80 space-y-4">
            <div className="text-sm font-medium">Report Details</div>
            {selectedReport ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Report #{selectedReport.id}</CardTitle>
                    <Badge
                      variant={
                        selectedReport.priority === "high"
                          ? "destructive"
                          : selectedReport.priority === "medium"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {selectedReport.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium">Type</div>
                    <div className="text-sm text-muted-foreground">{selectedReport.type}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Location</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedReport.lat.toFixed(4)}, {selectedReport.lng.toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Status</div>
                    <Badge variant="outline" className="text-xs">
                      {selectedReport.status}
                    </Badge>
                  </div>
                  <Button size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-muted-foreground py-8">Click on a marker to view report details</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
