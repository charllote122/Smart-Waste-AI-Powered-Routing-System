"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Search, Eye, CheckCircle, Clock, AlertTriangle } from "lucide-react"

export function ReportsTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReport, setSelectedReport] = useState(null)

  const reports = [
    {
      id: "RPT-001",
      type: "Overflowing Bin",
      location: "Main St & 5th Ave",
      priority: "high",
      status: "pending",
      aiConfidence: 94.2,
      reportedAt: "2024-01-15 09:30",
      photo: "/placeholder-i1uba.png",
    },
    {
      id: "RPT-002",
      type: "Illegal Dumping",
      location: "Park Avenue",
      priority: "medium",
      status: "assigned",
      aiConfidence: 87.5,
      reportedAt: "2024-01-15 08:45",
      photo: "/placeholder-5qqf1.png",
    },
    {
      id: "RPT-003",
      type: "Missed Collection",
      location: "Oak Street",
      priority: "low",
      status: "resolved",
      aiConfidence: 91.8,
      reportedAt: "2024-01-14 16:20",
      photo: "/placeholder-ipvd3.png",
    },
    {
      id: "RPT-004",
      type: "Hazardous Waste",
      location: "Industrial District",
      priority: "high",
      status: "in-progress",
      aiConfidence: 96.7,
      reportedAt: "2024-01-15 11:15",
      photo: "/placeholder-mvvas.png",
    },
    {
      id: "RPT-005",
      type: "Broken Bin",
      location: "Elm Street",
      priority: "medium",
      status: "pending",
      aiConfidence: 89.3,
      reportedAt: "2024-01-15 07:30",
      photo: "/placeholder-zm601.png",
    },
  ]

  const filteredReports = reports.filter(
    (report) =>
      report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "assigned":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "default"
      default:
        return "outline"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Reports Management
            </CardTitle>
            <CardDescription>Detailed view with AI analysis data</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          {/* Reports Table */}
          <div className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AI Confidence</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id} className={selectedReport?.id === report.id ? "bg-muted" : ""}>
                    <TableCell className="font-medium">{report.id}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{report.location}</TableCell>
                    <TableCell>
                      <Badge variant={getPriorityVariant(report.priority)}>{report.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        <span className="capitalize">{report.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${report.aiConfidence}%` }} />
                        </div>
                        <span className="text-sm">{report.aiConfidence}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{report.reportedAt}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => setSelectedReport(report)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* AI Analysis Panel */}
          {selectedReport && (
            <div className="w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">AI Analysis - {selectedReport.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={selectedReport.photo || "/placeholder.svg"}
                      alt="Report photo"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium">Waste Type Identified</div>
                      <div className="text-sm text-muted-foreground">{selectedReport.type}</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium">AI Confidence Score</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${selectedReport.aiConfidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{selectedReport.aiConfidence}%</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium">Volume Estimation</div>
                      <div className="text-sm text-muted-foreground">~15 cubic feet</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium">Urgency Assessment</div>
                      <Badge variant={getPriorityVariant(selectedReport.priority)}>
                        {selectedReport.priority} priority
                      </Badge>
                    </div>

                    <div>
                      <div className="text-sm font-medium">Recommended Action</div>
                      <div className="text-sm text-muted-foreground">
                        Deploy standard collection crew within 2 hours. Requires bin replacement.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Assign Team
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      Update Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
