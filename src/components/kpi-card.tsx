"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { motion } from "framer-motion"

interface KPICardProps {
  title: string
  value: string
  change?: {
    value: number
    label: string
  }
  icon: LucideIcon
  className?: string
  trend?: "up" | "down" | "neutral"
}

export function KPICard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  className,
  trend = "neutral"
}: KPICardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-emerald-600"
      case "down":
        return "text-red-500"
      default:
        return "text-slate-500"
    }
  }

  const getTrendBgColor = () => {
    switch (trend) {
      case "up":
        return "bg-emerald-50"
      case "down":
        return "bg-red-50"
      default:
        return "bg-slate-50"
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return TrendingUp
      case "down":
        return TrendingDown
      default:
        return Minus
    }
  }

  const TrendIcon = getTrendIcon()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className={cn(
        "relative overflow-hidden bg-white border-slate-200 card-shadow hover:card-shadow-lg transition-all duration-300 btn-modern", 
        className
      )}>
        {/* Background gradient accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-slate-600">
              {title}
            </CardTitle>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 card-shadow group-hover:scale-110 transition-transform duration-200">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="text-2xl font-bold text-slate-800 tracking-tight">{value}</div>
            
            {change && (
              <div className={cn(
                "inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium",
                getTrendBgColor()
              )}>
                <TrendIcon className={cn("h-3 w-3", getTrendColor())} />
                <span className={getTrendColor()}>
                  {Math.abs(change.value)}%
                </span>
                <span className="text-slate-500">{change.label}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}