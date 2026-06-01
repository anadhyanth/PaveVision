"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Trash2, Calendar, MapPin, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HistoryItem {
  id: string
  imageUrl: string
  pci: number
  location: string
  date: string
  detectedClasses: string[]
}

// Mock history data
const mockHistory: HistoryItem[] = [
  {
    id: "1",
    imageUrl: "/placeholder.svg?height=200&width=300",
    pci: 85,
    location: "NH-44, Km 234",
    date: "2024-01-15T10:30:00",
    detectedClasses: ["Longitudinal", "Transverse"],
  },
  {
    id: "2",
    imageUrl: "/placeholder.svg?height=200&width=300",
    pci: 32,
    location: "SH-12, Km 45",
    date: "2024-01-14T14:15:00",
    detectedClasses: ["Pothole", "Alligator", "Rutting"],
  },
  {
    id: "3",
    imageUrl: "/placeholder.svg?height=200&width=300",
    pci: 67,
    location: "NH-8, Km 112",
    date: "2024-01-13T09:45:00",
    detectedClasses: ["Patchy road", "Repaired crack"],
  },
  {
    id: "4",
    imageUrl: "/placeholder.svg?height=200&width=300",
    pci: 91,
    location: "MDR-5, Km 23",
    date: "2024-01-12T16:20:00",
    detectedClasses: ["Longitudinal"],
  },
  {
    id: "5",
    imageUrl: "/placeholder.svg?height=200&width=300",
    pci: 28,
    location: "NH-44, Km 567",
    date: "2024-01-11T11:00:00",
    detectedClasses: ["Pothole", "Pothole", "Alligator", "Transverse"],
  },
  {
    id: "6",
    imageUrl: "/placeholder.svg?height=200&width=300",
    pci: 74,
    location: "SH-7, Km 89",
    date: "2024-01-10T13:30:00",
    detectedClasses: ["Transverse", "Rutting"],
  },
  {
    id: "7",
    imageUrl: "/placeholder.svg?height=200&width=300",
    pci: 45,
    location: "NH-2, Km 345",
    date: "2024-01-09T08:15:00",
    detectedClasses: ["Alligator", "Patchy road", "Longitudinal"],
  },
  {
    id: "8",
    imageUrl: "/placeholder.svg?height=200&width=300",
    pci: 82,
    location: "MDR-12, Km 67",
    date: "2024-01-08T15:45:00",
    detectedClasses: ["Repaired crack", "Transverse"],
  },
]

type FilterType = "all" | "critical" | "good"

function getPCIColor(pci: number) {
  if (pci >= 80) return { bg: "bg-[#22C55E]", text: "text-[#22C55E]" }
  if (pci >= 60) return { bg: "bg-[#EAB308]", text: "text-[#EAB308]" }
  if (pci >= 40) return { bg: "bg-[#F97316]", text: "text-[#F97316]" }
  return { bg: "bg-[#EF4444]", text: "text-[#EF4444]" }
}

function getPCILabel(pci: number) {
  if (pci >= 90) return "Excellent"
  if (pci >= 80) return "Good"
  if (pci >= 60) return "Satisfactory"
  if (pci >= 40) return "Fair"
  if (pci >= 20) return "Poor"
  return "Failed"
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }
}

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [history, setHistory] = useState<HistoryItem[]>(mockHistory)
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Search filter
      const matchesSearch =
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.detectedClasses.some((cls) =>
          cls.toLowerCase().includes(searchQuery.toLowerCase())
        )

      // PCI filter
      const matchesFilter =
        filter === "all" ||
        (filter === "critical" && item.pci < 40) ||
        (filter === "good" && item.pci >= 70)

      return matchesSearch && matchesFilter
    })
  }, [history, searchQuery, filter])

  const handleDelete = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id))
    if (selectedItem?.id === id) {
      setSelectedItem(null)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Detection History
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse and manage your road assessment records
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by location or damage type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="inline-flex rounded-xl border border-border bg-card p-1">
              {(["all", "critical", "good"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f === "all" && "All"}
                  {f === "critical" && "Critical (<40)"}
                  {f === "good" && "Good (>70)"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 text-sm text-muted-foreground"
        >
          Showing {filteredHistory.length} of {history.length} records
        </motion.p>

        {/* History Grid */}
        {filteredHistory.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredHistory.map((item, index) => {
                const pciColors = getPCIColor(item.pci)
                const { date, time } = formatDate(item.date)

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="group overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    {/* Image Preview */}
                    <div className="relative aspect-video bg-muted">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-xl bg-muted-foreground/10 flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </div>

                      {/* PCI Badge */}
                      <div
                        className={cn(
                          "absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1",
                          pciColors.bg
                        )}
                      >
                        <span className="font-mono text-sm font-bold text-white">
                          {item.pci}
                        </span>
                        <span className="text-xs font-medium text-white/80">
                          {getPCILabel(item.pci)}
                        </span>
                      </div>

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-10 w-10 rounded-xl"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-10 w-10 rounded-xl"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{item.location}</span>
                      </div>

                      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {date} at {time}
                        </span>
                      </div>

                      {/* Detected Classes */}
                      <div className="flex flex-wrap gap-1.5">
                        {item.detectedClasses.slice(0, 3).map((cls, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                          >
                            {cls}
                          </span>
                        ))}
                        {item.detectedClasses.length > 3 && (
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            +{item.detectedClasses.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 font-medium text-foreground">No records found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-border p-4">
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    Assessment Details
                  </h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setSelectedItem(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Modal Content */}
                <div className="p-4">
                  {/* Image */}
                  <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-16 w-16 rounded-2xl bg-muted-foreground/10 flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="mt-1 font-medium text-foreground">
                        {selectedItem.location}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground">PCI Score</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={cn(
                            "h-3 w-3 rounded-full",
                            getPCIColor(selectedItem.pci).bg
                          )}
                        />
                        <span className="font-mono font-bold text-foreground">
                          {selectedItem.pci}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({getPCILabel(selectedItem.pci)})
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/50 p-4 sm:col-span-2">
                      <p className="text-sm text-muted-foreground">
                        Detected Damage Types
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedItem.detectedClasses.map((cls, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                          >
                            {cls}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(selectedItem.date).date} at{" "}
                      {formatDate(selectedItem.date).time}
                    </span>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 border-t border-border p-4">
                  <Button
                    variant="destructive"
                    className="flex-1 rounded-xl"
                    onClick={() => {
                      handleDelete(selectedItem.id)
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Record
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setSelectedItem(null)}
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
