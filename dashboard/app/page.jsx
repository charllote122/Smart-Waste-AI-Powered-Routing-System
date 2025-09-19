import { DashboardLayout } from "@/components/dashboard-layout"
import { LiveMap } from "@/components/live-map"
import { ReportsTable } from "@/components/reports-table"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { TeamManagement } from "@/components/team-management"
import { RealTimeAlerts } from "@/components/real-time-alerts"
import { AuthGuard } from "@/components/auth-guard"

export default function WasteManagementDashboard() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Live Map Section */}
          <div className="lg:col-span-2">
            <LiveMap />
          </div>

          {/* Real-time Alerts */}
          <div className="lg:col-span-1">
            <RealTimeAlerts />
          </div>

          {/* Analytics Dashboard */}
          <div className="lg:col-span-2">
            <AnalyticsDashboard />
          </div>

          {/* Team Management */}
          <div className="lg:col-span-1">
            <TeamManagement />
          </div>

          {/* Reports Table */}
          <div className="lg:col-span-3">
            <ReportsTable />
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
