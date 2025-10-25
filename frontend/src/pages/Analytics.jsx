import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Camera, AlertTriangle, CheckCircle, Activity, RefreshCw } from 'lucide-react';
import apiService from '../services/api';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('week');
  
  const [dashboardData, setDashboardData] = useState({
    cameras: { total: 0, active: 0, inactive: 0 },
    reports: { total: 0, pending: 0, critical: 0 },
    statistics: { imganalyzed: 0, wastedected: 0, avgconfidence: 0, detectionrate: 0 }
  });

  const [reports, setReports] = useState([]);
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the api.js service to fetch all data
      const [dashboard, reportsData, camerasData] = await Promise.all([
        apiService.getDashboardSummary(),
        apiService.getReports(),
        apiService.getCameras()
      ]);

      setDashboardData(dashboard);
      setReports(reportsData.reports || []);
      setCameras(camerasData.cameras || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
  };

  // Process data for charts
  const getPriorityDistribution = () => {
    const distribution = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    reports.forEach(report => {
      if (distribution[report.priority] !== undefined) {
        distribution[report.priority]++;
      }
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const getStatusDistribution = () => {
    const distribution = { Pending: 0, 'In Progress': 0, Resolved: 0, Cancelled: 0 };
    reports.forEach(report => {
      if (distribution[report.status] !== undefined) {
        distribution[report.status]++;
      }
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const getReportsOverTime = () => {
    const today = new Date();
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayReports = reports.filter(report => {
        if (!report.reportedAt) return false;
        const reportDate = new Date(report.reportedAt).toISOString().split('T')[0];
        return reportDate === dateStr;
      });

      // Format date based on time range
      const dateLabel = timeRange === 'year' 
        ? date.toLocaleDateString('en-US', { month: 'short' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      data.push({
        date: dateLabel,
        reports: dayReports.length,
        critical: dayReports.filter(r => r.priority === 'Critical').length,
        high: dayReports.filter(r => r.priority === 'High').length
      });
    }

    // Group by month if year view
    if (timeRange === 'year') {
      const monthlyData = {};
      data.forEach(item => {
        if (!monthlyData[item.date]) {
          monthlyData[item.date] = { date: item.date, reports: 0, critical: 0, high: 0 };
        }
        monthlyData[item.date].reports += item.reports;
        monthlyData[item.date].critical += item.critical;
        monthlyData[item.date].high += item.high;
      });
      return Object.values(monthlyData);
    }

    return data;
  };

  const getConfidenceDistribution = () => {
    const ranges = { '0-25%': 0, '26-50%': 0, '51-75%': 0, '76-100%': 0 };
    reports.forEach(report => {
      const conf = report.ai_confidence || 0;
      if (conf <= 25) ranges['0-25%']++;
      else if (conf <= 50) ranges['26-50%']++;
      else if (conf <= 75) ranges['51-75%']++;
      else ranges['76-100%']++;
    });
    return Object.entries(ranges).map(([name, value]) => ({ name, value }));
  };

  const getCameraPerformance = () => {
    return cameras.map((camera) => {
      // Calculate reports per camera (you can enhance this with actual data)
      const cameraReports = reports.filter(r => 
        r.location && r.location.toLowerCase().includes(camera.location?.toLowerCase() || '')
      );
      
      return {
        name: camera.name,
        detections: cameraReports.length,
        uptime: camera.status === 1 ? 95 + Math.random() * 5 : Math.random() * 50,
        status: camera.status === 1 ? 'Active' : 'Inactive'
      };
    }).slice(0, 5);
  };

  const getLocationHotspots = () => {
    const locationCounts = {};
    reports.forEach(report => {
      const location = report.location || 'Unknown';
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });
    
    return Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const PRIORITY_COLORS = {
    Low: '#10b981',
    Medium: '#f59e0b',
    High: '#ef4444',
    Critical: '#991b1b'
  };

  const StatCard = ({ title, value, change, icon: Icon, trend, color }) => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {change}
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const priorityData = getPriorityDistribution();
  const statusData = getStatusDistribution();
  const timelineData = getReportsOverTime();
  const confidenceData = getConfidenceDistribution();
  const cameraPerformance = getCameraPerformance();
  const locationHotspots = getLocationHotspots();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive waste detection insights and metrics</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Time Range Filter */}
        <div className="mb-6 flex gap-2">
          {['week', 'month', 'year'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Images Analyzed"
            value={dashboardData.statistics.imganalyzed.toLocaleString()}
            change="+12%"
            trend="up"
            icon={Activity}
            color="bg-blue-600"
          />
          <StatCard
            title="Waste Detected"
            value={dashboardData.statistics.wastedected.toLocaleString()}
            change="+8%"
            trend="up"
            icon={AlertTriangle}
            color="bg-orange-600"
          />
          <StatCard
            title="Active Cameras"
            value={`${dashboardData.cameras.active}/${dashboardData.cameras.total}`}
            icon={Camera}
            color="bg-green-600"
          />
          <StatCard
            title="Detection Rate"
            value={`${dashboardData.statistics.detectionrate}%`}
            change="+5%"
            trend="up"
            icon={CheckCircle}
            color="bg-purple-600"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Reports Timeline */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Reports Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Area type="monotone" dataKey="reports" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Total Reports" />
                <Area type="monotone" dataKey="critical" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} name="Critical" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Priority Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Report Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* AI Confidence Distribution */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">AI Confidence Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Camera Performance & Location Hotspots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Camera Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cameraPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="detections" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Detections" />
                <Bar dataKey="uptime" fill="#10b981" radius={[8, 8, 0, 0]} name="Uptime %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Location Hotspots</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationHotspots} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="name" type="category" stroke="#6b7280" width={100} style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Average Confidence</h4>
            <p className="text-3xl font-bold text-gray-900">{dashboardData.statistics.avgconfidence/100}%</p>
            <p className="text-sm text-gray-600 mt-2">AI detection accuracy across all reports</p>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${dashboardData.statistics.avgconfidence}%` }}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Critical Reports</h4>
            <p className="text-3xl font-bold text-red-600">{dashboardData.reports.critical}</p>
            <p className="text-sm text-gray-600 mt-2">Requiring immediate attention</p>
            <div className="mt-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-700">High priority issues</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Pending Actions</h4>
            <p className="text-3xl font-bold text-orange-600">{dashboardData.reports.pending}</p>
            <p className="text-sm text-gray-600 mt-2">Awaiting resolution</p>
            <div className="mt-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-700">Action required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;