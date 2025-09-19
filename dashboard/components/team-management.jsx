"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, MapPin, Clock, Phone } from "lucide-react"

export function TeamManagement() {
  const [selectedTeam, setSelectedTeam] = useState(null)

  const teams = [
    {
      id: "TEAM-A",
      name: "Alpha Squad",
      status: "active",
      currentTask: "Overflowing Bin - Main St",
      progress: 75,
      estimatedCompletion: "14:30",
      members: [
        { name: "John Smith", role: "Lead", phone: "+1-555-0101", status: "active" },
        { name: "Mike Johnson", role: "Driver", phone: "+1-555-0102", status: "active" },
        { name: "Sarah Wilson", role: "Collector", phone: "+1-555-0103", status: "active" },
      ],
      location: "Downtown District",
      efficiency: 92,
    },
    {
      id: "TEAM-B",
      name: "Beta Crew",
      status: "active",
      currentTask: "Illegal Dumping - Park Ave",
      progress: 45,
      estimatedCompletion: "15:45",
      members: [
        { name: "David Brown", role: "Lead", phone: "+1-555-0201", status: "active" },
        { name: "Lisa Davis", role: "Driver", phone: "+1-555-0202", status: "active" },
        { name: "Tom Miller", role: "Collector", phone: "+1-555-0203", status: "break" },
      ],
      location: "North Side",
      efficiency: 88,
    },
    {
      id: "TEAM-C",
      name: "Gamma Unit",
      status: "available",
      currentTask: "Standby",
      progress: 0,
      estimatedCompletion: "Ready",
      members: [
        { name: "Chris Lee", role: "Lead", phone: "+1-555-0301", status: "active" },
        { name: "Anna Garcia", role: "Driver", phone: "+1-555-0302", status: "active" },
        { name: "Mark Taylor", role: "Collector", phone: "+1-555-0303", status: "active" },
      ],
      location: "Central Hub",
      efficiency: 95,
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "available":
        return "bg-blue-500"
      case "break":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case "active":
        return "default"
      case "available":
        return "secondary"
      case "break":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Team Management
        </CardTitle>
        <CardDescription>Status updates and crew assignments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Teams List */}
          <div className="space-y-3">
            {teams.map((team) => (
              <Card
                key={team.id}
                className={`cursor-pointer transition-colors ${
                  selectedTeam?.id === team.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedTeam(team)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(team.status)}`} />
                      <div>
                        <div className="font-medium">{team.name}</div>
                        <div className="text-sm text-muted-foreground">{team.currentTask}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusVariant(team.status)}>{team.status}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">ETA: {team.estimatedCompletion}</div>
                    </div>
                  </div>

                  {team.progress > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{team.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${team.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Team Details */}
          {selectedTeam && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  {selectedTeam.name} Details
                  <Badge variant="outline">Efficiency: {selectedTeam.efficiency}%</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </div>
                    <div className="text-muted-foreground">{selectedTeam.location}</div>
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Current Task
                    </div>
                    <div className="text-muted-foreground">{selectedTeam.currentTask}</div>
                  </div>
                </div>

                <div>
                  <div className="font-medium mb-2">Team Members</div>
                  <div className="space-y-2">
                    {selectedTeam.members.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{member.name}</div>
                            <div className="text-xs text-muted-foreground">{member.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`} />
                          <Button size="sm" variant="ghost">
                            <Phone className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    Assign Task
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
