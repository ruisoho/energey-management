'use client'

import { useState, useRef } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Download, FileText, Calendar, TrendingUp, TrendingDown, Zap, Euro, Leaf, AlertTriangle } from 'lucide-react'
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
    { name: 'HVAC', value: 45, color: '#1E45A0' },
    { name: 'Lighting', value: 25, color: '#2A98AA' },
    { name: 'Equipment', value: 20, color: '#987148' },
    { name: 'Other', value: 10, color: '#C75B5B' }
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
    <div className="min-h-screen bg-gray-950 text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Energy Reports</h1>
            <p className="text-gray-400">Comprehensive energy analysis and insights</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={exportCSV} variant="outline" className="border-gray-600 hover:bg-gray-800">
              <FileText className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              onClick={generatePDF} 
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {generating ? 'Generating...' : 'Export PDF'}
            </Button>
          </div>
        </div>

        {/* Report Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center flex-wrap">
              <div>
                <label className="block text-sm font-medium mb-1">Report Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
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
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Report Content */}
        <div ref={reportRef} className="bg-gray-950 p-6 rounded-lg">
          {/* Report Header */}
          <div className="text-center mb-8 border-b border-gray-800 pb-6">
            <h2 className="text-2xl font-bold mb-2">Energy Consumption Report</h2>
            <p className="text-gray-400">Period: {reportData.period}</p>
            <p className="text-gray-500 text-sm">Generated on {typeof window !== 'undefined' ? new Date().toLocaleDateString() : ''}</p>
          </div>

          {/* Executive Summary */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Executive Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Energy</p>
                      <p className="text-2xl font-bold">{formatEnergy(reportData.totalEnergy)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {energyChange > 0 ? (
                          <TrendingUp className="w-3 h-3 text-red-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-green-400" />
                        )}
                        <span className={`text-xs ${energyChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {energyChange > 0 ? '+' : ''}{energyChange.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <Zap className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Cost</p>
                      <p className="text-2xl font-bold">{formatCurrency(reportData.totalCost)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {costChange > 0 ? (
                          <TrendingUp className="w-3 h-3 text-red-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-green-400" />
                        )}
                        <span className={`text-xs ${costChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {costChange > 0 ? '+' : ''}{costChange.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <Euro className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">CO₂ Emissions</p>
                      <p className="text-2xl font-bold">{formatCO2(reportData.totalCO2)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {co2Change > 0 ? (
                          <TrendingUp className="w-3 h-3 text-red-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-green-400" />
                        )}
                        <span className={`text-xs ${co2Change > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {co2Change > 0 ? '+' : ''}{co2Change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <Leaf className="w-8 h-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Efficiency</p>
                      <p className="text-2xl font-bold">{(reportData.efficiency * 100).toFixed(1)}%</p>
                      <div className="flex items-center gap-1 mt-1">
                        {efficiencyChange > 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        )}
                        <span className={`text-xs ${efficiencyChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {efficiencyChange > 0 ? '+' : ''}{efficiencyChange.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Key Performance Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-400 mb-1">Average Daily Usage</p>
                  <p className="text-xl font-bold">{formatEnergy(reportData.avgDailyUsage)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-400 mb-1">Peak Usage</p>
                  <p className="text-xl font-bold">{formatEnergy(reportData.peakUsage)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-400 mb-1">Anomalies Detected</p>
                  <p className="text-xl font-bold flex items-center gap-2">
                    {reportData.anomalies}
                    {reportData.anomalies > 0 && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Energy Consumption</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374E52" />
                    <XAxis dataKey="month" stroke="#BFD9EA" />
                    <YAxis stroke="#BFD9EA" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#132059', border: '1px solid #374E52', color: '#BFD9EA' }}
                      formatter={(value: any) => [formatEnergy(value), 'Energy']}
                    />
                    <Line type="monotone" dataKey="energy" stroke="#1E45A0" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Usage by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Energy Usage by Category</CardTitle>
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
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#132059', border: '1px solid #374E52', color: '#BFD9EA' }}
                      formatter={(value: any) => [`${value}%`, 'Usage']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Monthly Breakdown</h3>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="text-left p-3">Month</th>
                        <th className="text-left p-3">Energy (kWh)</th>
                        <th className="text-left p-3">Cost (€)</th>
                        <th className="text-left p-3">CO₂ (kg)</th>
                        <th className="text-left p-3">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyData.map((month, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="p-3 font-medium">{month.month}</td>
                          <td className="p-3">{formatEnergy(month.energy)}</td>
                          <td className="p-3">{formatCurrency(month.cost)}</td>
                          <td className="p-3">{formatCO2(month.co2)}</td>
                          <td className="p-3">{(month.efficiency * 100).toFixed(1)}%</td>
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
            <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
            <Card>
              <CardContent className="p-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Consider implementing energy-efficient lighting systems to reduce overall consumption by 15-20%.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>HVAC optimization could lead to 10-15% energy savings during peak usage periods.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Schedule regular maintenance to maintain current efficiency levels and prevent degradation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Monitor anomalies closely as they indicate potential equipment issues or usage pattern changes.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Report Footer */}
          <div className="text-center text-xs text-gray-500 border-t border-gray-800 pt-4">
            <p>This report was generated automatically by the Building Energy Management System.</p>
            <p>For questions or support, contact your facility management team.</p>
          </div>
        </div>
      </div>
    </div>
  )
}