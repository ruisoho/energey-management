import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatEnergy(kWh: number): string {
  if (kWh >= 1000) {
    return `${(kWh / 1000).toFixed(1)} MWh`
  }
  return `${kWh.toFixed(1)} kWh`
}

export function formatCO2(co2: number): string {
  if (co2 >= 1000) {
    return `${(co2 / 1000).toFixed(1)} tCO₂e`
  }
  return `${co2.toFixed(1)} kgCO₂e`
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function detectAnomalies(readings: number[], threshold: number = 20): boolean[] {
  if (readings.length < 2) return readings.map(() => false)
  
  const baseline = readings.reduce((sum, val) => sum + val, 0) / readings.length
  
  return readings.map(reading => {
    const deviation = Math.abs((reading - baseline) / baseline) * 100
    return deviation > threshold
  })
}

export function linearRegression(data: { x: number; y: number }[]): { slope: number; intercept: number } {
  const n = data.length
  const sumX = data.reduce((sum, point) => sum + point.x, 0)
  const sumY = data.reduce((sum, point) => sum + point.y, 0)
  const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0)
  const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0)
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  return { slope, intercept }
}