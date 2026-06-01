"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Calculator,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Minus,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const DAMAGE_CLASSES = [
  { name: "Longitudinal", deductFactor: 8 },
  { name: "Transverse", deductFactor: 7 },
  { name: "Alligator", deductFactor: 15 },
  { name: "Repaired crack", deductFactor: 3 },
  { name: "Pothole", deductFactor: 20 },
  { name: "Patchy road", deductFactor: 10 },
  { name: "Rutting", deductFactor: 12 },
]

const PCI_CONDITIONS = [
  { range: [90, 100], label: "Excellent", color: "#22C55E", recommendation: "Routine maintenance only. Continue regular inspections and minor crack sealing as needed." },
  { range: [80, 90], label: "Good", color: "#84CC16", recommendation: "Preventive maintenance recommended. Apply surface treatments like fog seals or chip seals within 2-3 years." },
  { range: [60, 80], label: "Satisfactory", color: "#EAB308", recommendation: "Plan for renewal treatments. Consider thin overlays or micro-surfacing within the next budget cycle." },
  { range: [40, 60], label: "Fair", color: "#F97316", recommendation: "Minor rehabilitation required. Plan for localized repairs, patching, and possible overlay within 1-2 years." },
  { range: [20, 40], label: "Poor", color: "#EF4444", recommendation: "Major rehabilitation or overlay needed urgently. Structural repairs and thick overlays required. Prioritize in current budget." },
  { range: [0, 20], label: "Failed", color: "#DC2626", recommendation: "Complete reconstruction required. The pavement has failed structurally and cannot be rehabilitated economically." },
]

function getPCICondition(pci: number) {
  return PCI_CONDITIONS.find((c) => pci >= c.range[0] && pci <= c.range[1]) || PCI_CONDITIONS[5]
}

// PCI Gauge Component - Semi-circle speedometer style
function PCIGauge({ value }: { value: number }) {
  const condition = getPCICondition(value)
  const angle = (value / 100) * 180 - 90 // -90 to 90 degrees

  return (
    <div className="relative mx-auto h-48 w-80">
      <svg viewBox="0 0 200 120" className="h-full w-full">
        {/* Background arc segments */}
        {PCI_CONDITIONS.slice().reverse().map((cond, index) => {
          const startAngle = ((cond.range[0] / 100) * 180 - 90) * (Math.PI / 180)
          const endAngle = ((cond.range[1] / 100) * 180 - 90) * (Math.PI / 180)
          const radius = 80
          const cx = 100
          const cy = 100

          const x1 = cx + radius * Math.cos(startAngle)
          const y1 = cy + radius * Math.sin(startAngle)
          const x2 = cx + radius * Math.cos(endAngle)
          const y2 = cy + radius * Math.sin(endAngle)

          const largeArc = cond.range[1] - cond.range[0] > 50 ? 1 : 0

          return (
            <path
              key={index}
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none"
              stroke={cond.color}
              strokeWidth="16"
              strokeLinecap="butt"
              opacity={0.3}
            />
          )
        })}

        {/* Active arc */}
        <path
          d={`M ${100 + 80 * Math.cos(-90 * Math.PI / 180)} ${100 + 80 * Math.sin(-90 * Math.PI / 180)} A 80 80 0 ${value > 50 ? 1 : 0} 1 ${100 + 80 * Math.cos(angle * Math.PI / 180)} ${100 + 80 * Math.sin(angle * Math.PI / 180)}`}
          fill="none"
          stroke={condition.color}
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Center display */}
        <text
          x="100"
          y="85"
          textAnchor="middle"
          className="font-mono text-4xl font-bold"
          fill="currentColor"
        >
          {value}
        </text>
        <text
          x="100"
          y="105"
          textAnchor="middle"
          className="text-sm"
          fill="currentColor"
          opacity={0.6}
        >
          PCI Score
        </text>
      </svg>

      {/* Labels */}
      <div className="absolute bottom-0 left-0 text-xs text-muted-foreground">0</div>
      <div className="absolute bottom-0 right-0 text-xs text-muted-foreground">100</div>
    </div>
  )
}

export default function PCICalculatorPage() {
  const [mode, setMode] = useState<"manual" | "auto">("manual")
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(DAMAGE_CLASSES.map((c) => [c.name, 0]))
  )
  const [calculated, setCalculated] = useState(false)

  // Simulated auto-detection values
  const autoValues = useMemo(() => ({
    "Longitudinal": 3,
    "Transverse": 2,
    "Alligator": 1,
    "Repaired crack": 4,
    "Pothole": 2,
    "Patchy road": 1,
    "Rutting": 1,
  }), [])

  const currentValues = mode === "auto" ? autoValues : values

  // Calculate PCI
  const { totalDistress, totalDeduct, pci } = useMemo(() => {
    let totalDistress = 0
    let totalDeduct = 0

    Object.entries(currentValues).forEach(([name, count]) => {
      const cls = DAMAGE_CLASSES.find((c) => c.name === name)
      if (cls && count > 0) {
        totalDistress += count
        totalDeduct += count * cls.deductFactor
      }
    })

    // PCI formula: 100 - Total Deduct Value (capped at 0)
    const pci = Math.max(0, Math.min(100, 100 - totalDeduct))

    return { totalDistress, totalDeduct, pci }
  }, [currentValues])

  const condition = getPCICondition(pci)

  const handleReset = () => {
    setValues(Object.fromEntries(DAMAGE_CLASSES.map((c) => [c.name, 0])))
    setCalculated(false)
  }

  const handleCalculate = () => {
    setCalculated(true)
  }

  const handleValueChange = (name: string, delta: number) => {
    setValues((prev) => ({
      ...prev,
      [name]: Math.max(0, (prev[name] || 0) + delta),
    }))
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            PCI Calculator
          </h1>
          <p className="mt-2 text-muted-foreground">
            Calculate Pavement Condition Index based on detected distresses
          </p>
        </motion.div>

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="inline-flex rounded-xl border border-border bg-card p-1">
            <button
              onClick={() => {
                setMode("manual")
                setCalculated(false)
              }}
              className={cn(
                "rounded-lg px-6 py-2.5 text-sm font-medium transition-colors",
                mode === "manual"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Manual Input
            </button>
            <button
              onClick={() => {
                setMode("auto")
                setCalculated(false)
              }}
              className={cn(
                "rounded-lg px-6 py-2.5 text-sm font-medium transition-colors",
                mode === "auto"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Auto from Detection
            </button>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section - All 7 classes visible at once */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  {mode === "manual" ? "Enter Distress Counts" : "Detected Distresses"}
                </h2>
                {mode === "manual" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-muted-foreground"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                )}
              </div>

              {mode === "auto" && (
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-accent/10 p-4">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <p className="text-sm text-foreground">
                    Values loaded from last detection session
                  </p>
                </div>
              )}

              {/* All 7 classes in a vertical list */}
              <div className="space-y-3">
                {DAMAGE_CLASSES.map((cls) => (
                  <div
                    key={cls.name}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{cls.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Deduct factor: {cls.deductFactor}
                      </p>
                    </div>
                    {mode === "manual" ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleValueChange(cls.name, -1)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center font-mono text-lg font-semibold text-foreground">
                          {values[cls.name] || 0}
                        </span>
                        <button
                          onClick={() => handleValueChange(cls.name, 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono text-lg font-semibold text-foreground">
                        {autoValues[cls.name as keyof typeof autoValues]}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Calculate Button */}
              <div className="mt-6">
                <Button onClick={handleCalculate} className="w-full rounded-xl">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate PCI
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-6 font-serif text-lg font-semibold text-foreground">
                PCI Results
              </h2>

              {!calculated ? (
                <div className="flex min-h-[480px] flex-col items-center justify-center rounded-xl border border-dashed border-border">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <Calculator className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Enter values and click Calculate
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* PCI Gauge */}
                  <PCIGauge value={pci} />

                  {/* Condition Badge */}
                  <div className="flex justify-center">
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2"
                      style={{ backgroundColor: `${condition.color}20` }}
                    >
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: condition.color }}
                      />
                      <span
                        className="font-semibold"
                        style={{ color: condition.color }}
                      >
                        {condition.label}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border bg-muted/50 p-4 text-center">
                      <p className="text-sm text-muted-foreground">Total Distress</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-foreground">
                        {totalDistress}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/50 p-4 text-center">
                      <p className="text-sm text-muted-foreground">Deduct Value</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-foreground">
                        {totalDeduct}
                      </p>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">
                        Recommendation (IRC 82:2023)
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {condition.recommendation}
                    </p>
                  </div>

                  {/* Warning for low PCI */}
                  {pci < 40 && (
                    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium text-destructive">Critical Condition</p>
                        <p className="mt-1 text-sm text-destructive/80">
                          This road section requires immediate attention. Consider prioritizing
                          rehabilitation works in the current budget cycle.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
