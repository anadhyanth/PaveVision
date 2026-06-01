"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  RefreshCw,
  Image as ImageIcon,
  Gauge,
  AlertTriangle,
  TrendingUp,
  Loader2,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Mock data
const classDistributionData = [
  { name: "Longitudinal", count: 24, color: "#EF4444" },
  { name: "Transverse", count: 18, color: "#F97316" },
  { name: "Alligator", count: 12, color: "#EAB308" },
  { name: "Repaired", count: 31, color: "#22C55E" },
  { name: "Pothole", count: 8, color: "#3B82F6" },
  { name: "Patchy", count: 15, color: "#8B5CF6" },
  { name: "Rutting", count: 11, color: "#EC4899" },
]

const severityData = [
  { name: "Low", value: 45, color: "#22C55E" },
  { name: "Medium", value: 35, color: "#EAB308" },
  { name: "High", value: 20, color: "#EF4444" },
]

const pciTrendData = [
  { month: "Jan", pci: 72 },
  { month: "Feb", pci: 68 },
  { month: "Mar", pci: 65 },
  { month: "Apr", pci: 71 },
  { month: "May", pci: 75 },
  { month: "Jun", pci: 73 },
  { month: "Jul", pci: 78 },
  { month: "Aug", pci: 82 },
  { month: "Sep", pci: 79 },
  { month: "Oct", pci: 76 },
  { month: "Nov", pci: 74 },
  { month: "Dec", pci: 77 },
]

// Generate heatmap data (10x10 grid)
const heatmapData = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  value: Math.random(),
}))

function getHeatmapColor(value: number) {
  if (value > 0.8) return "#22C55E"
  if (value > 0.6) return "#84CC16"
  if (value > 0.4) return "#EAB308"
  if (value > 0.2) return "#F97316"
  return "#EF4444"
}

const kpiCards = [
  {
    title: "Total Images",
    value: "1,247",
    change: "+12%",
    icon: ImageIcon,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Avg PCI Score",
    value: "68.4",
    change: "+5.2",
    icon: Gauge,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "Most Common",
    value: "Repaired",
    subtext: "31 instances",
    icon: TrendingUp,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    title: "Critical Roads",
    value: "23",
    change: "-8%",
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
]

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsRefreshing(false)
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
              Analytics Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Overview of road condition assessments and trends
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-xl"
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh Data
          </Button>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {kpiCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    card.bgColor
                  )}
                >
                  <card.icon className={cn("h-6 w-6", card.color)} />
                </div>
                {card.change && (
                  <span
                    className={cn(
                      "text-xs font-medium",
                      card.change.startsWith("+")
                        ? "text-accent"
                        : "text-destructive"
                    )}
                  >
                    {card.change}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="mt-1 font-mono text-2xl font-bold text-foreground">
                  {card.value}
                </p>
                {card.subtext && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {card.subtext}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bar Chart - Class Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="mb-6 font-serif text-lg font-semibold text-foreground">
              Class Distribution
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classDistributionData} layout="vertical">
                  <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ color: "var(--foreground)" }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {classDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart - Severity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="mb-6 font-serif text-lg font-semibold text-foreground">
              Severity Distribution
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "var(--foreground)" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Line Chart - PCI Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="mb-6 font-serif text-lg font-semibold text-foreground">
              PCI Trend (12 Months)
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pciTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                    }}
                    labelStyle={{ color: "var(--foreground)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pci"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--primary)", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Heatmap - Road Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="mb-6 font-serif text-lg font-semibold text-foreground">
              Road Condition Heatmap
            </h2>
            <div className="aspect-square w-full max-w-[300px] mx-auto">
              <div className="grid grid-cols-10 gap-1">
                {heatmapData.map((cell) => (
                  <div
                    key={cell.id}
                    className="aspect-square rounded transition-transform hover:scale-110"
                    style={{ backgroundColor: getHeatmapColor(cell.value) }}
                    title={`PCI: ${(cell.value * 100).toFixed(0)}`}
                  />
                ))}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-[#EF4444]" />
                <span className="text-xs text-muted-foreground">Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-[#EAB308]" />
                <span className="text-xs text-muted-foreground">Fair</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-[#22C55E]" />
                <span className="text-xs text-muted-foreground">Good</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
