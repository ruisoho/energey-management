'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar } from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, Thermometer, Wind, Calendar, Download } from 'lucide-react'
import { cn, detectAnomalies, formatEnergy } from '@/lib/utils'

interface EnergyData {
  id: number
  timestamp: string
  kWh: number
  cost: number
  co2: number
  source: string
}

interface WeatherData {
  date: string
  avgTemp: number
  minTemp: number
  maxTemp: number
  precipitation: number
  windSpeed: number
  pressure: number
  heatingDegreeDays: number
  coolingDegreeDays: number
}

interface AnalyticsData {
  date: string
  kWh: number
  cost: number
  avgTemp: number
  heatingDegreeDays: number
  coolingDegreeDays: number
  normalizedUsage: number
  isAnomaly: boolean
  anomalyScore: number
}

export default function AnalyticsPage() {
  const [, setEnergyData] = useState<EnergyData[]>([])
  const [, setWeatherData] = useState<WeatherData[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })

  // Initialize date range on client side
  useEffect(() => {
    setDateRange({
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    })
  }, [])

  // Mock data for demonstration (replace with actual API calls)
  useEffect(() => {
    const generateMockData = () => {
      const mockEnergyData: EnergyData[] = []
      const mockWeatherData: WeatherData[] = []
      const mockAnalyticsData: AnalyticsData[] = []
      
      for (let i = 0; i < 90; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]
        
        // Generate seasonal temperature variation
        const dayOfYear = date.getDate() + date.getMonth() * 30
        const baseTemp = 15 + 10 * Math.sin((dayOfYear / 365) * 2 * Math.PI)
        const avgTemp = baseTemp + (Math.random() - 0.5) * 10
        
        const heatingDegreeDays = Math.max(0, 18 - avgTemp)
        const coolingDegreeDays = Math.max(0, avgTemp - 18)
        
        // Energy usage correlated with temperature
        const baseUsage = 150
        const heatingUsage = heatingDegreeDays * 8
        const coolingUsage = coolingDegreeDays * 6
        const randomVariation = (Math.random() - 0.5) * 30
        
        // Add some anomalies
        const isAnomalyDay = Math.random() < 0.05 // 5% chance
        const anomalyMultiplier = isAnomalyDay ? 1.5 + Math.random() : 1
        
        const kWh = (baseUsage + heatingUsage + coolingUsage + randomVariation) * anomalyMultiplier
        const cost = kWh * 0.12 // €0.12 per kWh
        
        mockEnergyData.push({
          id: i,
          timestamp: date.toISOString(),
          kWh: Math.round(kWh * 100) / 100,
          cost: Math.round(cost * 100) / 100,
          co2: Math.round(kWh * 0.4 * 100) / 100, // 0.4 kg CO2 per kWh
          source: 'Mock Data'
        })
        
        mockWeatherData.push({
          date: dateStr,
          avgTemp: Math.round(avgTemp * 10) / 10,
          minTemp: Math.round((avgTemp - 5) * 10) / 10,
          maxTemp: Math.round((avgTemp + 5) * 10) / 10,
          precipitation: Math.random() * 10,
          windSpeed: Math.random() * 20,
          pressure: 1013 + (Math.random() - 0.5) * 50,
          heatingDegreeDays: Math.round(heatingDegreeDays * 10) / 10,
          coolingDegreeDays: Math.round(coolingDegreeDays * 10) / 10
        })
        
        // Calculate weather-normalized usage
        const expectedUsage = baseUsage + heatingUsage + coolingUsage
        const normalizedUsage = (kWh / expectedUsage) * baseUsage
        
        mockAnalyticsData.push({
          date: dateStr,
          kWh: Math.round(kWh * 100) / 100,
          cost: Math.round(cost * 100) / 100,
          avgTemp: Math.round(avgTemp * 10) / 10,
          heatingDegreeDays: Math.round(heatingDegreeDays * 10) / 10,
          coolingDegreeDays: Math.round(coolingDegreeDays * 10) / 10,
          normalizedUsage: Math.round(normalizedUsage * 100) / 100,
          isAnomaly: isAnomalyDay,
          anomalyScore: isAnomalyDay ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3
        })
      }
      
      // Detect anomalies using the utility function
      const usageValues = mockAnalyticsData.map(d => d.kWh)
      const anomalies = detectAnomalies(usageValues)
      
      mockAnalyticsData.forEach((item, index) => {
        item.isAnomaly = anomalies[index]
        item.anomalyScore = anomalies[index] ? 0.8 + Math.random() * 0.2 : Math.random() * 0.3
      })
      
      setEnergyData(mockEnergyData.reverse())
      setWeatherData(mockWeatherData.reverse())
      setAnalyticsData(mockAnalyticsData.reverse())
      setLoading(false)
    }
    
    generateMockData()
  }, [dateRange])

  // Calculate correlation between temperature and energy usage
  const calculateCorrelation = () => {
    if (analyticsData.length < 2) return 0
    
    const temps = analyticsData.map(d => d.avgTemp)
    const usage = analyticsData.map(d => d.kWh)
    
    const n = temps.length
    const sumX = temps.reduce((a, b) => a + b, 0)
    const sumY = usage.reduce((a, b) => a + b, 0)
    const sumXY = temps.reduce((sum, temp, i) => sum + temp * usage[i], 0)
    const sumX2 = temps.reduce((sum, temp) => sum + temp * temp, 0)
    const sumY2 = usage.reduce((sum, u) => sum + u * u, 0)
    
    const correlation = (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
    return Math.round(correlation * 1000) / 1000
  }

  const correlation = calculateCorrelation()
  const anomalies = analyticsData.filter(d => d.isAnomaly)
  const avgNormalizedUsage = analyticsData.length > 0 
    ? analyticsData.reduce((sum, d) => sum + d.normalizedUsage, 0) / analyticsData.length 
    : 0

  const exportAnalytics = () => {
    const csvContent = [
      ['Date', 'Energy (kWh)', 'Cost (€)', 'Temperature (°C)', 'Normalized Usage', 'Anomaly', 'Anomaly Score'].join(','),
      ...analyticsData.map(d => [
        d.date,
        d.kWh,
        d.cost,
        d.avgTemp,
        d.normalizedUsage,
        d.isAnomaly ? 'Yes' : 'No',
        d.anomalyScore
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `energy-analytics-${dateRange.start}-to-${dateRange.end}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="ml-72 flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-azia-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600 font-medium">Loading analytics data...</div>
        </div>
      </div>
    </div>
  )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="ml-72 container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-azia-primary to-azia-secondary rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-black">Energy Analytics</h1>
            </div>
            <p className="text-gray-600 text-lg">Weather normalization and anomaly detection</p>
          </div>
          <Button 
            onClick={exportAnalytics} 
            className="azia-btn-primary px-6 py-3 rounded-xl font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Date Range Selector */}
        <Card className="bg-white border border-gray-200 shadow-sm mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-black">
              <div className="w-8 h-8 bg-gradient-to-r from-azia-primary to-azia-secondary rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              Date Range Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full bg-white border-2 border-gray-300 focus:border-azia-primary rounded-xl px-4 py-3 text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-azia-primary/20"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full bg-white border-2 border-gray-300 focus:border-azia-primary rounded-xl px-4 py-3 text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-azia-primary/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-gray-200 shadow-sm group">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-azia-warning to-azia-error rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Thermometer className="w-3 h-3 text-white" />
                </div>
                Temperature Correlation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">{Math.abs(correlation).toFixed(3)}</span>
                  {correlation > 0 ? 
                    <TrendingUp className="w-5 h-5 text-azia-success" /> : 
                    <TrendingDown className="w-5 h-5 text-azia-error" />
                  }
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                {correlation > 0 ? 'Positive' : 'Negative'} correlation
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm group">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-azia-warning to-azia-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <AlertTriangle className="w-3 h-3 text-white" />
                </div>
                Anomalies Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-gray-900">{anomalies.length}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-azia-warning">
                    {((anomalies.length / analyticsData.length) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                of total readings
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm group">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-azia-primary to-azia-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="w-3 h-3 text-white" />
                </div>
                Avg Normalized Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-gray-900">{formatEnergy(avgNormalizedUsage)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                Weather adjusted
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm group">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-azia-primary to-azia-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Calendar className="w-3 h-3 text-white" />
                </div>
                Analysis Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-gray-900">{analyticsData.length}</span>
                <div className="text-sm font-semibold text-azia-primary">days</div>
              </div>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                Total analyzed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Energy vs Temperature */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-black">
                <div className="w-8 h-8 bg-gradient-to-r from-azia-primary to-azia-secondary rounded-lg flex items-center justify-center">
                  <Thermometer className="w-4 h-4 text-white" />
                </div>
                Energy Usage vs Temperature
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Correlation between outdoor temperature and energy consumption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <ScatterChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="avgTemp" 
                    stroke="#6b7280"
                    fontSize={12}
                    label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#6b7280' } }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      color: '#1f2937'
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'kWh' ? formatEnergy(value) : value,
                      name === 'kWh' ? 'Energy Usage' : name
                    ]}
                  />
                  <Scatter 
                    dataKey="kWh" 
                    fill="#1e40af"
                    fillOpacity={0.8}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weather Normalized Usage */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-black">
                <div className="w-8 h-8 bg-gradient-to-r from-azia-accent to-azia-success rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                Weather Normalized Usage
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Energy usage adjusted for weather conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={analyticsData.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      color: '#1f2937'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number, name: string) => [
                      formatEnergy(value),
                      name === 'kWh' ? 'Actual Usage' : 'Normalized Usage'
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="kWh" 
                    stroke="#1e40af" 
                    name="Actual Usage"
                    strokeWidth={3}
                    dot={{ fill: '#1e40af', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#1e40af', strokeWidth: 2, fill: 'white' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="normalizedUsage" 
                    stroke="#3b82f6" 
                    name="Normalized Usage"
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Degree Days Analysis */}
        <Card className="bg-white border border-gray-200 shadow-sm mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-black">
              <div className="w-8 h-8 bg-gradient-to-r from-azia-warning to-azia-error rounded-lg flex items-center justify-center">
                <Wind className="w-4 h-4 text-white" />
              </div>
              Heating & Cooling Degree Days
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Temperature-based energy demand indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={analyticsData.slice(-30)} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    color: '#1f2937'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Legend />
                <Bar 
                  dataKey="heatingDegreeDays" 
                  fill="#f59e0b" 
                  name="Heating Degree Days" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="coolingDegreeDays" 
                  fill="#3b82f6" 
                  name="Cooling Degree Days" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Anomalies Table */}
        {anomalies.length > 0 && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-black">
                <div className="w-8 h-8 bg-gradient-to-r from-azia-error to-azia-warning rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                Detected Anomalies
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Unusual energy consumption patterns requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-900 text-sm">Date</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900 text-sm">Usage</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900 text-sm">Temperature</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900 text-sm">Anomaly Score</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900 text-sm">Deviation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anomalies.slice(0, 10).map((anomaly, index) => {
                      const deviation = ((anomaly.kWh - avgNormalizedUsage) / avgNormalizedUsage * 100)
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-azia-primary/5 transition-colors duration-200">
                          <td className="py-4 px-4 text-gray-900 font-medium">{new Date(anomaly.date).toLocaleDateString()}</td>
                          <td className="py-4 px-4 text-gray-900 font-medium">{formatEnergy(anomaly.kWh)}</td>
                          <td className="py-4 px-4 text-gray-600">{anomaly.avgTemp.toFixed(1)}°C</td>
                          <td className="py-4 px-4">
                            <span className={cn(
                              "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                              anomaly.anomalyScore > 0.7 ? "bg-azia-error/10 text-azia-error" : "bg-azia-warning/10 text-azia-warning"
                            )}>
                              {anomaly.anomalyScore.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={cn(
                              "font-bold text-sm",
                              deviation > 0 ? "text-azia-error" : "text-azia-success"
                            )}>
                              {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}