'use client'

import { useState, useRef } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Download, FileText, Calendar, TrendingUp, TrendingDown, Zap, Euro, Leaf, AlertTriangle, BarChart3 } from 'lucide-react'
import { formatEnergy, formatCurrency, formatCO2, calculatePercentageChange } from '@/lib/utils'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ReportData {
  period: string
  totalEnergy: number
  totalCost: number
  totalCO2: number
  avgDailyUsage: number
  peakUsage: number
  efficiency: number
  anomalies: number
  weatherNormalizedUsage: number
}

interface MonthlyData {
  month: string
  energy: number
  cost: number
  co2: number
  efficiency: number
}

interface CategoryData {
  name: string
  value: number
  color: string
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [generating, setGenerating] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  // Mock data for demonstration
  const reportData: ReportData = {
    period: 'Last 30 Days',
    totalEnergy: 4250.5,
    totalCost: 510.06,
    totalCO2: 1700.2,
    avgDailyUsage: 141.7,
    peakUsage: 285.3,
    efficiency: 0.85,
    anomalies: 3,
    weatherNormalizedUsage: 4180.2
  }

  const monthlyData: MonthlyData[] = [
    { month: 'Jan', energy: 4100, cost: 492, co2: 1640, efficiency: 0.82 },
    { month: 'Feb', energy: 3800, cost: 456, co2: 1520, efficiency: 0.84 },
    { month: 'Mar', energy: 3600, cost: 432, co2: 1440, efficiency: 0.86 },
    { month: 'Apr', energy: 3200, cost: 384, co2: 1280, efficiency: 0.88 },
    { month: 'May', energy: 2800, cost: 336, co2: 1120, efficiency: 0.90 },
    { month: 'Jun', energy: 3400, cost: 408, co2: 1360, efficiency: 0.87 },
    { month: 'Jul', energy: 4200, cost: 504, co2: 1680, efficiency: 0.83 },
    { month: 'Aug', energy: 4500, cost: 540, co2: 1800, efficiency: 0.81 },
    { month: 'Sep', energy: 3900, cost: 468, co2: 1560, efficiency: 0.85 },
    { month: 'Oct', energy: 3700, cost: 444, co2: 1480, efficiency: 0.86 },
    { month: 'Nov', energy: 4000, cost: 480, co2: 1600, efficiency: 0.84 },
    { month: 'Dec', energy: 4250, cost: 510, co2: 1700, efficiency: 0.85 }
  ]

  const categoryData: CategoryData[] = [
    { name: 'HVAC', value: 45, color: '#1e40af' },
    { name: 'Lighting', value: 25, color: '#3b82f6' },
    { name: 'Equipment', value: 20, color: '#60a5fa' },
    { name: 'Other', value: 10, color: '#93c5fd' }
  ]

  const previousPeriodData = {
    totalEnergy: 3980.2,
    totalCost: 477.62,
    totalCO2: 1592.1,
    efficiency: 0.82
  }

  const energyChange = calculatePercentageChange(reportData.totalEnergy, previousPeriodData.totalEnergy)
  const costChange = calculatePercentageChange(reportData.totalCost, previousPeriodData.totalCost)
  const co2Change = calculatePercentageChange(reportData.totalCO2, previousPeriodData.totalCO2)
  const efficiencyChange = calculatePercentageChange(reportData.efficiency, previousPeriodData.efficiency)

  const generatePDF = async () => {
    if (!reportRef.current) return

    setGenerating(true)
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#111827'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 10
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      
      const fileName = `energy-report-${dateRange.start}-to-${dateRange.end}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setGenerating(false)
    }
  }

  const exportCSV = () => {
    const csvContent = [
      ['Metric', 'Value', 'Unit', 'Change from Previous Period'].join(','),
      ['Total Energy', reportData.totalEnergy, 'kWh', `${energyChange > 0 ? '+' : ''}${energyChange.toFixed(1)}%`].join(','),
      ['Total Cost', reportData.totalCost, 'EUR', `${costChange > 0 ? '+' : ''}${costChange.toFixed(1)}%`].join(','),
      ['Total CO2', reportData.totalCO2, 'kg', `${co2Change > 0 ? '+' : ''}${co2Change.toFixed(1)}%`].join(','),
      ['Efficiency', reportData.efficiency, 'ratio', `${efficiencyChange > 0 ? '+' : ''}${efficiencyChange.toFixed(1)}%`].join(','),
      ['Average Daily Usage', reportData.avgDailyUsage, 'kWh', ''].join(','),
      ['Peak Usage', reportData.peakUsage, 'kWh', ''].join(','),
      ['Anomalies Detected', reportData.anomalies, 'count', ''].join(','),
      ['Weather Normalized Usage', reportData.weatherNormalizedUsage, 'kWh', ''].join(','),
      '',
      ['Monthly Breakdown'].join(','),
      ['Month', 'Energy (kWh)', 'Cost (EUR)', 'CO2 (kg)', 'Efficiency'].join(','),
      ...monthlyData.map(d => [d.month, d.energy, d.cost, d.co2, d.efficiency].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `energy-report-data-${dateRange.start}-to-${dateRange.end}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="ml-72 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-black">Energy Reports</h1>
            <p className="text-gray-600">Comprehensive energy analysis and insights</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={exportCSV} variant="outline" className="border-gray-300 hover:bg-gray-50 text-gray-700">
              <FileText className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              onClick={generatePDF} 
              disabled={generating}
              className="azia-btn-primary"
            >
              <Download className="w-4 h-4 mr-2" />
              {generating ? 'Generating...' : 'Export PDF'}
            </Button>
          </div>
        </div>

        {/* Report Controls */}
        <Card className="bg-white border border-gray-200 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Calendar className="w-5 h-5" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center flex-wrap">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Report Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:border-azia-primary focus:ring-1 focus:ring-azia-primary"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              
              {selectedPeriod === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:border-azia-primary focus:ring-1 focus:ring-azia-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:border-azia-primary focus:ring-1 focus:ring-azia-primary"
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Report Content */}
        <div ref={reportRef} className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg">
          {/* Report Header */}
          <div className="text-center mb-8 border-b border-gray-200 pb-6">
            <h2 className="text-2xl font-bold mb-2 text-black">Energy Consumption Report</h2>
            <p className="text-gray-600">Period: {reportData.period}</p>
            <p className="text-gray-500 text-sm">Generated on {typeof window !== 'undefined' ? new Date().toLocaleDateString() : ''}</p>
          </div>

          {/* Executive Summary */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-azia-primary to-azia-secondary rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black">Executive Summary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Total Energy</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{formatEnergy(reportData.totalEnergy)}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {energyChange > 0 ? (
                          <TrendingUp className="w-4 h-4 text-azia-error" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-azia-success" />
                        )}
                        <span className={`text-sm font-medium ${energyChange > 0 ? 'text-azia-error' : 'text-azia-success'}`}>
                          {energyChange > 0 ? '+' : ''}{energyChange.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-azia-primary to-azia-secondary rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Cost</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(reportData.totalCost)}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {costChange > 0 ? (
                          <TrendingUp className="w-4 h-4 text-azia-error" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-azia-success" />
                        )}
                        <span className={`text-sm font-medium ${costChange > 0 ? 'text-azia-error' : 'text-azia-success'}`}>
                          {costChange > 0 ? '+' : ''}{costChange.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-azia-success to-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Euro className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">CO₂ Emissions</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{formatCO2(reportData.totalCO2)}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {co2Change > 0 ? (
                          <TrendingUp className="w-4 h-4 text-azia-error" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-azia-success" />
                        )}
                        <span className={`text-sm font-medium ${co2Change > 0 ? 'text-azia-error' : 'text-azia-success'}`}>
                          {co2Change > 0 ? '+' : ''}{co2Change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-azia-warning to-orange-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Leaf className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Efficiency</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{(reportData.efficiency * 100).toFixed(1)}%</p>
                      <div className="flex items-center gap-1 mt-2">
                        {efficiencyChange > 0 ? (
                          <TrendingUp className="w-4 h-4 text-azia-success" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-azia-error" />
                        )}
                        <span className={`text-sm font-medium ${efficiencyChange > 0 ? 'text-azia-success' : 'text-azia-error'}`}>
                          {efficiencyChange > 0 ? '+' : ''}{efficiencyChange.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-azia-primary to-azia-secondary rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-azia-primary to-azia-secondary rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black">Key Performance Indicators</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Average Daily Usage</h4>
                    <div className="w-8 h-8 bg-gradient-to-br from-azia-primary to-azia-secondary rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatEnergy(reportData.avgDailyUsage)}</p>
                  <p className="text-sm text-gray-600">Per day average</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Peak Usage</h4>
                    <div className="w-8 h-8 bg-gradient-to-br from-azia-warning to-orange-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatEnergy(reportData.peakUsage)}</p>
                  <p className="text-sm text-gray-600">Maximum demand</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Anomalies Detected</h4>
                    <div className="w-8 h-8 bg-gradient-to-br from-azia-error to-red-500 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{reportData.anomalies}</p>
                  <p className="text-sm text-gray-600">This period</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Monthly Trend */}
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-azia-primary to-azia-secondary rounded-lg">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-black">Monthly Energy Consumption</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
                        color: '#1f2937' 
                      }}
                      formatter={(value: any) => [formatEnergy(value), 'Energy']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="energy" 
                      stroke="#1e40af" 
                      strokeWidth={3}
                      dot={{ fill: '#1e40af', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#1e40af', strokeWidth: 2, fill: 'white' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Usage by Category */}
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-azia-primary to-azia-secondary rounded-lg">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-black">Energy Usage by Category</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#1e40af"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
                        color: '#1f2937' 
                      }}
                      formatter={(value: any) => [`${value}%`, 'Usage']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-azia-primary to-azia-secondary rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black">Monthly Breakdown</h3>
            </div>
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">Month</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Energy (kWh)</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Cost (€)</th>
                        <th className="text-left p-4 font-semibold text-gray-900">CO₂ (kg)</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyData.map((month, index) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                          <td className="p-4 font-medium text-gray-900">{month.month}</td>
                          <td className="p-4 text-gray-600">{formatEnergy(month.energy)}</td>
                          <td className="p-4 text-gray-600">{formatCurrency(month.cost)}</td>
                          <td className="p-4 text-gray-600">{formatCO2(month.co2)}</td>
                          <td className="p-4 text-gray-600">{(month.efficiency * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-azia-warning to-orange-500 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black">Recommendations</h3>
            </div>
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <ul className="space-y-4">
                  <li className="flex items-start gap-4 p-4 bg-azia-primary/10 rounded-lg border-l-4 border-azia-primary">
                    <div className="w-3 h-3 bg-azia-primary rounded-full mt-1 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Consider implementing energy-efficient lighting systems to reduce overall consumption by 15-20%.</span>
                  </li>
                  <li className="flex items-start gap-4 p-4 bg-azia-success/10 rounded-lg border-l-4 border-azia-success">
                    <div className="w-3 h-3 bg-azia-success rounded-full mt-1 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">HVAC optimization could lead to 10-15% energy savings during peak usage periods.</span>
                  </li>
                  <li className="flex items-start gap-4 p-4 bg-azia-warning/10 rounded-lg border-l-4 border-azia-warning">
                    <div className="w-3 h-3 bg-azia-warning rounded-full mt-1 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Schedule regular maintenance to maintain current efficiency levels and prevent degradation.</span>
                  </li>
                  <li className="flex items-start gap-4 p-4 bg-azia-secondary/10 rounded-lg border-l-4 border-azia-secondary">
                    <div className="w-3 h-3 bg-azia-secondary rounded-full mt-1 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">Monitor anomalies closely as they indicate potential equipment issues or usage pattern changes.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Report Footer */}
          <div className="text-center py-6 border-t border-gray-200 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">This report was generated automatically by the Building Energy Management System.</p>
            <p className="text-sm text-gray-500">For questions or support, contact your facility management team.</p>
          </div>
        </div>
      </div>
    </div>
  )
}