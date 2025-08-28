'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building, MapPin, Thermometer, Euro, Zap, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BuildingSettings {
  id?: number
  buildingName: string
  address: string
  latitude: number
  longitude: number
  floorArea: number
  buildingType: string
  constructionYear: number
  heatingSystem: string
  coolingSystem: string
  energyTariff: number
  co2Factor: number
  weatherStation: string
  timezone: string
  currency: string
  notifications: {
    anomalyAlerts: boolean
    monthlyReports: boolean
    maintenanceReminders: boolean
    costThresholds: boolean
  }
  thresholds: {
    highUsageAlert: number
    costAlert: number
    anomalyScore: number
  }
}

const defaultSettings: BuildingSettings = {
  buildingName: 'Main Office Building',
  address: 'Potsdamer Platz 1, 10785 Berlin, Germany',
  latitude: 52.5096,
  longitude: 13.3765,
  floorArea: 2500,
  buildingType: 'Office',
  constructionYear: 2010,
  heatingSystem: 'Gas Boiler',
  coolingSystem: 'Electric AC',
  energyTariff: 0.12,
  co2Factor: 0.4,
  weatherStation: '10637',
  timezone: 'Europe/Berlin',
  currency: 'EUR',
  notifications: {
    anomalyAlerts: true,
    monthlyReports: true,
    maintenanceReminders: true,
    costThresholds: true
  },
  thresholds: {
    highUsageAlert: 300,
    costAlert: 50,
    anomalyScore: 0.7
  }
}

const buildingTypes = [
  'Office', 'Retail', 'Warehouse', 'Manufacturing', 'Healthcare', 'Education', 'Hospitality', 'Residential', 'Mixed Use'
]

const heatingSystemTypes = [
  'Gas Boiler', 'Electric Heating', 'Heat Pump', 'District Heating', 'Oil Boiler', 'Biomass', 'Solar Thermal'
]

const coolingSystemTypes = [
  'Electric AC', 'Chiller', 'Evaporative Cooling', 'Natural Ventilation', 'Heat Pump', 'District Cooling'
]

const currencies = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' }
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<BuildingSettings>(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load settings on component mount
  useEffect(() => {
    // In a real app, this would fetch from API
    // For now, load from localStorage or use defaults
    const savedSettings = localStorage.getItem('buildingSettings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }, [])

  const validateSettings = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!settings.buildingName.trim()) {
      newErrors.buildingName = 'Building name is required'
    }

    if (!settings.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (settings.latitude < -90 || settings.latitude > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90'
    }

    if (settings.longitude < -180 || settings.longitude > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180'
    }

    if (settings.floorArea <= 0) {
      newErrors.floorArea = 'Floor area must be greater than 0'
    }

    if (settings.constructionYear < 1800 || settings.constructionYear > new Date().getFullYear()) {
      newErrors.constructionYear = 'Invalid construction year'
    }

    if (settings.energyTariff <= 0) {
      newErrors.energyTariff = 'Energy tariff must be greater than 0'
    }

    if (settings.co2Factor < 0) {
      newErrors.co2Factor = 'CO2 factor cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateSettings()) {
      return
    }

    setLoading(true)
    setSaved(false)

    try {
      // In a real app, this would save to API
      // For now, save to localStorage
      localStorage.setItem('buildingSettings', JSON.stringify(settings))
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    setErrors({})
    setSaved(false)
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  const updateNestedSetting = (parent: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof BuildingSettings] as any,
        [key]: value
      }
    }))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-gray-400">Configure your building and system preferences</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleReset} 
              variant="outline" 
              className="border-gray-600 hover:bg-gray-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : saved ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Building Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Building Information
              </CardTitle>
              <CardDescription>Basic details about your building</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Building Name</label>
                <input
                  type="text"
                  value={settings.buildingName}
                  onChange={(e) => updateSetting('buildingName', e.target.value)}
                  className={cn(
                    "w-full bg-gray-800 border rounded px-3 py-2",
                    errors.buildingName ? "border-red-500" : "border-gray-700"
                  )}
                  placeholder="Enter building name"
                />
                {errors.buildingName && (
                  <p className="text-red-400 text-xs mt-1">{errors.buildingName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  value={settings.address}
                  onChange={(e) => updateSetting('address', e.target.value)}
                  className={cn(
                    "w-full bg-gray-800 border rounded px-3 py-2 h-20 resize-none",
                    errors.address ? "border-red-500" : "border-gray-700"
                  )}
                  placeholder="Enter full address"
                />
                {errors.address && (
                  <p className="text-red-400 text-xs mt-1">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={settings.latitude}
                    onChange={(e) => updateSetting('latitude', parseFloat(e.target.value) || 0)}
                    className={cn(
                      "w-full bg-gray-800 border rounded px-3 py-2",
                      errors.latitude ? "border-red-500" : "border-gray-700"
                    )}
                  />
                  {errors.latitude && (
                    <p className="text-red-400 text-xs mt-1">{errors.latitude}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={settings.longitude}
                    onChange={(e) => updateSetting('longitude', parseFloat(e.target.value) || 0)}
                    className={cn(
                      "w-full bg-gray-800 border rounded px-3 py-2",
                      errors.longitude ? "border-red-500" : "border-gray-700"
                    )}
                  />
                  {errors.longitude && (
                    <p className="text-red-400 text-xs mt-1">{errors.longitude}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Floor Area (m²)</label>
                  <input
                    type="number"
                    value={settings.floorArea}
                    onChange={(e) => updateSetting('floorArea', parseInt(e.target.value) || 0)}
                    className={cn(
                      "w-full bg-gray-800 border rounded px-3 py-2",
                      errors.floorArea ? "border-red-500" : "border-gray-700"
                    )}
                  />
                  {errors.floorArea && (
                    <p className="text-red-400 text-xs mt-1">{errors.floorArea}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Construction Year</label>
                  <input
                    type="number"
                    value={settings.constructionYear}
                    onChange={(e) => updateSetting('constructionYear', parseInt(e.target.value) || 0)}
                    className={cn(
                      "w-full bg-gray-800 border rounded px-3 py-2",
                      errors.constructionYear ? "border-red-500" : "border-gray-700"
                    )}
                  />
                  {errors.constructionYear && (
                    <p className="text-red-400 text-xs mt-1">{errors.constructionYear}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Building Type</label>
                <select
                  value={settings.buildingType}
                  onChange={(e) => updateSetting('buildingType', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                >
                  {buildingTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Systems Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Systems Configuration
              </CardTitle>
              <CardDescription>HVAC systems and energy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Heating System</label>
                <select
                  value={settings.heatingSystem}
                  onChange={(e) => updateSetting('heatingSystem', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                >
                  {heatingSystemTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cooling System</label>
                <select
                  value={settings.coolingSystem}
                  onChange={(e) => updateSetting('coolingSystem', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                >
                  {coolingSystemTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Energy Tariff (€/kWh)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={settings.energyTariff}
                    onChange={(e) => updateSetting('energyTariff', parseFloat(e.target.value) || 0)}
                    className={cn(
                      "w-full bg-gray-800 border rounded px-3 py-2",
                      errors.energyTariff ? "border-red-500" : "border-gray-700"
                    )}
                  />
                  {errors.energyTariff && (
                    <p className="text-red-400 text-xs mt-1">{errors.energyTariff}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CO₂ Factor (kg/kWh)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={settings.co2Factor}
                    onChange={(e) => updateSetting('co2Factor', parseFloat(e.target.value) || 0)}
                    className={cn(
                      "w-full bg-gray-800 border rounded px-3 py-2",
                      errors.co2Factor ? "border-red-500" : "border-gray-700"
                    )}
                  />
                  {errors.co2Factor && (
                    <p className="text-red-400 text-xs mt-1">{errors.co2Factor}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Weather Station ID</label>
                <input
                  type="text"
                  value={settings.weatherStation}
                  onChange={(e) => updateSetting('weatherStation', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                  placeholder="Meteostat station ID"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                  >
                    <option value="Europe/Berlin">Europe/Berlin</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="America/Los_Angeles">America/Los_Angeles</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>Configure alert and notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications.anomalyAlerts}
                    onChange={(e) => updateNestedSetting('notifications', 'anomalyAlerts', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded"
                  />
                  <span>Anomaly Detection Alerts</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications.monthlyReports}
                    onChange={(e) => updateNestedSetting('notifications', 'monthlyReports', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded"
                  />
                  <span>Monthly Energy Reports</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications.maintenanceReminders}
                    onChange={(e) => updateNestedSetting('notifications', 'maintenanceReminders', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded"
                  />
                  <span>Maintenance Reminders</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications.costThresholds}
                    onChange={(e) => updateNestedSetting('notifications', 'costThresholds', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded"
                  />
                  <span>Cost Threshold Alerts</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Alert Thresholds */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5" />
                Alert Thresholds
              </CardTitle>
              <CardDescription>Set limits for automated alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">High Usage Alert (kWh/day)</label>
                <input
                  type="number"
                  value={settings.thresholds.highUsageAlert}
                  onChange={(e) => updateNestedSetting('thresholds', 'highUsageAlert', parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Daily Cost Alert (€)</label>
                <input
                  type="number"
                  value={settings.thresholds.costAlert}
                  onChange={(e) => updateNestedSetting('thresholds', 'costAlert', parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Anomaly Score Threshold</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={settings.thresholds.anomalyScore}
                  onChange={(e) => updateNestedSetting('thresholds', 'anomalyScore', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">Score between 0 and 1 (higher = more sensitive)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}