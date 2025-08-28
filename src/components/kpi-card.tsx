"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
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
        return "text-green-400"
      case "down":
        return "text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return "↗"
      case "down":
        return "↘"
      default:
        return "→"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("hover:shadow-xl transition-shadow duration-300", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600/10">
            <Icon className="h-5 w-5 text-primary-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
          {change && (
            <div className="flex items-center space-x-1 text-xs">
              <span className={cn("font-medium", getTrendColor())}>
                {getTrendIcon()} {Math.abs(change.value)}%
              </span>
              <span className="text-muted-foreground">{change.label}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}