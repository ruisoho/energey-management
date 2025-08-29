"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { KPICard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Activity, Zap, TrendingUp, DollarSign, Building, Thermometer, Calendar, Users, BarChart3 } from "lucide-react"
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

// Azia theme colors
const chartColors = {
  primary: '#1e40af',
  secondary: '#3b82f6', 
  accent: '#60a5fa',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  gradient: {
    primary: ['#1e40af', '#1e3a8a'],
    secondary: ['#3b82f6', '#2563eb'],
    accent: ['#60a5fa', '#3b82f6'],
    success: ['#10b981', '#059669']
  }
}

const mockCategoryData = [
  { name: "HVAC", value: 45, color: "#1e40af" },
  { name: "Lighting", value: 25, color: "#3b82f6" },
  { name: "Equipment", value: 20, color: "#60a5fa" },
  { name: "Other", value: 10, color: "#93c5fd" },
]

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState<string>('')
  
  useEffect(() => {
    // Set the current time after component mounts to avoid hydration mismatch
    setCurrentTime(new Date().toLocaleString())
  }, [])

  return (
    <div className="min-h-screen bg-azia-gray-50">
      <Navigation />
      <main className="ml-72 min-h-screen overflow-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-azia-primary-600 to-azia-secondary-600 px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-black tracking-tight">Hi, welcome back!</h1>
                <p className="text-azia-primary-100 text-lg">Your sales monitoring dashboard template.</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Last updated: {currentTime}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-8 -mt-4">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                icon={Activity}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Energy Consumption Trend */}
              <Card className="azia-card">
                <CardHeader className="border-b border-azia-gray-200 pb-4">
                  <CardTitle className="flex items-center gap-3 text-azia-gray-800">
                    <div className="p-2 bg-gradient-to-br from-azia-primary-500 to-azia-primary-600 rounded-xl">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    Energy Consumption Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={mockTrendData}>
                      <defs>
                        <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.4}/>
                          <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="usage" 
                        stroke={chartColors.primary}
                        strokeWidth={3}
                        fill="url(#energyGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Breakdown */}
              <Card className="azia-card">
                <CardHeader className="border-b border-azia-gray-200 pb-4">
                  <CardTitle className="flex items-center gap-3 text-azia-gray-800">
                    <div className="p-2 bg-gradient-to-br from-azia-secondary-500 to-azia-secondary-600 rounded-xl">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    Monthly Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={mockMonthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)'
                        }} 
                      />
                      <Bar dataKey="usage" fill={chartColors.secondary} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Usage by Category */}
              <Card className="lg:col-span-2 azia-card">
                <CardHeader className="border-b border-azia-gray-200 pb-4">
                  <CardTitle className="flex items-center gap-3 text-azia-gray-800">
                    <div className="p-2 bg-gradient-to-br from-azia-accent-500 to-azia-accent-600 rounded-xl">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    Usage by Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockCategoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#1e40af"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        stroke="white"
                        strokeWidth={2}
                      >
                        {mockCategoryData.map((entry, index) => {
                          const colors = [chartColors.primary, chartColors.secondary, chartColors.accent, chartColors.success]
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        })}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card className="azia-card">
                <CardHeader className="border-b border-azia-gray-200 pb-4">
                  <CardTitle className="flex items-center gap-3 text-azia-gray-800">
                    <div className="p-2 bg-gradient-to-br from-azia-warning-500 to-azia-warning-600 rounded-xl">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <span>System Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-azia-critical-50 rounded-xl border border-azia-critical-100 hover:bg-azia-critical-100/50 transition-colors">
                      <div className="h-2 w-2 rounded-full bg-azia-critical-500 mt-2" />
                      <div>
                        <p className="text-sm font-medium text-azia-critical-800">Critical System Failure</p>
                        <p className="text-xs text-azia-critical-600">HVAC system offline - immediate attention required</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-azia-error-50 rounded-xl border border-azia-error-100 hover:bg-azia-error-100/50 transition-colors">
                      <div className="h-2 w-2 rounded-full bg-azia-error-500 mt-2" />
                      <div>
                        <p className="text-sm font-medium text-azia-error-800">Equipment Error</p>
                        <p className="text-xs text-azia-error-600">Sensor malfunction detected in Zone A</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-azia-warning-50 rounded-xl border border-azia-warning-100 hover:bg-azia-warning-100/50 transition-colors">
                      <div className="h-2 w-2 rounded-full bg-azia-warning-500 mt-2" />
                      <div>
                        <p className="text-sm font-medium text-azia-warning-800">High Energy Usage</p>
                        <p className="text-xs text-azia-warning-600">Consumption 15% above normal levels</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-azia-maintenance-50 rounded-xl border border-azia-maintenance-100 hover:bg-azia-maintenance-100/50 transition-colors">
                      <div className="h-2 w-2 rounded-full bg-azia-maintenance-500 mt-2" />
                      <div>
                        <p className="text-sm font-medium text-azia-maintenance-800">Maintenance Reminder</p>
                        <p className="text-xs text-azia-maintenance-600">Filter replacement due in 3 days</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-azia-success-50 rounded-xl border border-azia-success-100 hover:bg-azia-success-100/50 transition-colors">
                      <div className="h-2 w-2 rounded-full bg-azia-success-500 mt-2" />
                      <div>
                        <p className="text-sm font-medium text-azia-success-800">System Optimized</p>
                        <p className="text-xs text-azia-success-600">Energy efficiency improved by 12%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
