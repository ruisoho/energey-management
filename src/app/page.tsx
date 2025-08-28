"use client"

import { Navigation } from "@/components/navigation"
import { KPICard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Zap, 
  DollarSign, 
  Leaf, 
  TrendingUp,
  Calendar,
  AlertTriangle
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { formatCurrency, formatEnergy, formatCO2 } from "@/lib/utils"

// Mock data for demonstration
const mockKPIData = {
  currentUsage: 1247.5,
  monthlyCost: 2847.32,
  co2Emissions: 623.8,
  efficiency: 87.3
}

const mockTrendData = [
  { date: "Jan", usage: 1200, cost: 2400 },
  { date: "Feb", usage: 1100, cost: 2200 },
  { date: "Mar", usage: 1300, cost: 2600 },
  { date: "Apr", usage: 1250, cost: 2500 },
  { date: "May", usage: 1400, cost: 2800 },
  { date: "Jun", usage: 1247, cost: 2494 },
]

const mockMonthlyData = [
  { month: "Jan", usage: 1200 },
  { month: "Feb", usage: 1100 },
  { month: "Mar", usage: 1300 },
  { month: "Apr", usage: 1250 },
  { month: "May", usage: 1400 },
  { month: "Jun", usage: 1247 },
]

const chartColors = {
  primary: '#1E45A0',
  secondary: '#2A98AA',
  accent: '#987148',
  warning: '#987148',
  success: '#2A98AA',
};

const mockCategoryData = [
  { name: "HVAC", value: 45, color: "#1E45A0" },
  { name: "Lighting", value: 25, color: "#2A98AA" },
  { name: "Equipment", value: 20, color: "#987148" },
  { name: "Other", value: 10, color: "#987148" },
]

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-background">
      <Navigation />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Energy Dashboard</h1>
            <p className="text-muted-foreground flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {typeof window !== 'undefined' ? new Date().toLocaleDateString() : ''}</span>
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Current Usage"
              value={formatEnergy(mockKPIData.currentUsage)}
              change={{ value: 5.2, label: "vs last month" }}
              icon={Zap}
              trend="up"
            />
            <KPICard
              title="Monthly Cost"
              value={formatCurrency(mockKPIData.monthlyCost)}
              change={{ value: 2.1, label: "vs last month" }}
              icon={DollarSign}
              trend="up"
            />
            <KPICard
              title="CO₂ Emissions"
              value={formatCO2(mockKPIData.co2Emissions)}
              change={{ value: 1.8, label: "vs last month" }}
              icon={Leaf}
              trend="down"
            />
            <KPICard
              title="Efficiency Score"
              value={`${mockKPIData.efficiency}%`}
              change={{ value: 3.2, label: "vs baseline" }}
              icon={TrendingUp}
              trend="up"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Consumption Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Energy Consumption Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374E52" />
                    <XAxis dataKey="date" stroke="#BFD9EA" />
                    <YAxis stroke="#BFD9EA" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#132059', 
                        border: '1px solid #374E52',
                        borderRadius: '8px',
                        color: '#BFD9EA'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="usage" 
                      stroke={chartColors.primary} 
                      strokeWidth={3}
                      dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374E52" />
                    <XAxis dataKey="month" stroke="#BFD9EA" />
                    <YAxis stroke="#BFD9EA" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#132059', 
                        border: '1px solid #374E52',
                        borderRadius: '8px',
                        color: '#BFD9EA'
                      }} 
                    />
                    <Bar dataKey="usage" fill={chartColors.secondary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Usage by Category */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Usage by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockCategoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {mockCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#132059', 
                        border: '1px solid #374E52',
                        borderRadius: '8px',
                        color: '#BFD9EA'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span>Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 rounded-full bg-red-500 mt-2" />
                    <div>
                      <p className="text-sm font-medium">High Usage Detected</p>
                      <p className="text-xs text-muted-foreground">HVAC system consuming 23% above baseline</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2" />
                    <div>
                      <p className="text-sm font-medium">Maintenance Due</p>
                      <p className="text-xs text-muted-foreground">Equipment inspection scheduled for next week</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="text-sm font-medium">Efficiency Improved</p>
                      <p className="text-xs text-muted-foreground">Lighting system optimization completed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
