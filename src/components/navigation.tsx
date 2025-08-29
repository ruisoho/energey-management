"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  BarChart3, 
  Upload, 
  FileText, 
  Settings,
  Zap,
  ChevronRight
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Upload Data",
    href: "/upload",
    icon: Upload,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col azia-sidebar">
      {/* Header */}
      <div className="flex h-20 items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-azia-primary to-azia-secondary">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Energy Manager</h1>
            <p className="text-xs text-gray-600">Dashboard v2.0</p>
          </div>
        </div>
      </div>
      
      {/* Welcome Message */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-900">Hi, welcome back!</p>
        <p className="text-xs text-gray-600">Your energy analytics dashboard</p>
      </div>
      
      {/* Navigation Menu */}
      <div className="flex-1 px-4 py-6">
        <div className="mb-4">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Menu</h3>
        </div>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "azia-sidebar-item group flex items-center justify-between",
                    isActive && "active"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {isActive && (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="text-xs">
            <p className="font-semibold text-gray-900">Building Energy Manager</p>
            <p className="text-gray-600 mt-1">Version 2.0.0 • Azia UI</p>
          </div>
        </div>
      </div>
    </nav>
  )
}