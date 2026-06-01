"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileText,
  Settings,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function dataURLtoFormData(dataURL: string) {
  const arr = dataURL.split(",")
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg"
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  const file = new File([u8arr], "image.jpg", { type: mime })

  const formData = new FormData()
  formData.append("image", file)

  return formData
}

interface Detection {
  class: string
  confidence: number
  bbox: { x: number; y: number; width: number; height: number }
}

interface DetectionResult {
  detections: Detection[]
  counts: Record<string, number>
}

interface SurveyConfig {
  roadType: string
  roadLength: number
  laneWidth: number
}

interface PCIReport {
  roadContext: {
    roadType: string
    lengthPerImage: number
    laneWidth: number
    totalImages: number
    totalSurveyLength: number
    totalSurveyArea: number
  }
  metrics: {
    totalCrackArea: number
    crackExtent: number
    totalPotholeArea: number
    potholeNumber: number
    avgRutDepth: number
    totalPatchArea: number
    patchExtent: number
  }
  individualPCI: {
    cracking: number
    potholes: number
    rutting: number
    patching: number
  }
  finalPCI: number
  condition: {
    label: string
    color: string
    action: string
  }
}

const DAMAGE_CLASSES = [
  { name: "Longitudinal", color: "#EF4444" },
  { name: "Transverse", color: "#F97316" },
  { name: "Alligator", color: "#EAB308" },
  { name: "Repaired crack", color: "#22C55E" },
  { name: "Pothole", color: "#3B82F6" },
  { name: "Patchy road", color: "#8B5CF6" },
  { name: "Rutting", color: "#EC4899" },
]

const ROAD_TYPES = [
  "Highway",
  "Major District Road (MDR)",
  "Rural Road",
  "Urban Road",
]

const PCI_CONDITIONS = [
  { min: 90, max: 100, label: "Excellent", color: "#22C55E", action: "Routine Maintenance" },
  { min: 80, max: 90, label: "Good", color: "#84CC16", action: "Preventive Maintenance" },
  { min: 60, max: 80, label: "Satisfactory", color: "#EAB308", action: "Renewal" },
  { min: 40, max: 60, label: "Fair", color: "#F97316", action: "Minor Rehabilitation" },
  { min: 20, max: 40, label: "Poor", color: "#EF4444", action: "Major Rehabilitation / Overlay" },
  { min: 0, max: 20, label: "Failed", color: "#DC2626", action: "Reconstruction" },
]

function getCondition(pci: number) {
  for (const condition of PCI_CONDITIONS) {
    if (pci >= condition.min && pci <= condition.max) {
      return condition
    }
  }
  return PCI_CONDITIONS[PCI_CONDITIONS.length - 1]
}

// Simulated detection function
function simulateDetection(): DetectionResult {
  const detections: Detection[] = []
  const counts: Record<string, number> = {}

  const numDetections = Math.floor(Math.random() * 8) + 3

  for (let i = 0; i < numDetections; i++) {
    const classIndex = Math.floor(Math.random() * DAMAGE_CLASSES.length)
    const className = DAMAGE_CLASSES[classIndex].name

    detections.push({
      class: className,
      confidence: Math.random() * 0.3 + 0.7,
      bbox: {
        x: Math.random() * 0.6 + 0.1,
        y: Math.random() * 0.6 + 0.1,
        width: Math.random() * 0.2 + 0.1,
        height: Math.random() * 0.2 + 0.1,
      },
    })  

    counts[className] = (counts[className] || 0) + 1
  }

  return { detections, counts }
}

// Simulated PCI calculation
function calculatePCIReport(
  result: DetectionResult,
  config: SurveyConfig
): PCIReport {
  const totalImages = 1
  const totalSurveyLength = config.roadLength * totalImages
  const totalSurveyArea = totalSurveyLength * config.laneWidth

  // Simulated metrics based on detection counts
  const crackCount = (result.counts["Longitudinal"] || 0) + 
                     (result.counts["Transverse"] || 0) + 
                     (result.counts["Alligator"] || 0)
  const potholeCount = result.counts["Pothole"] || 0
  const patchCount = (result.counts["Patchy road"] || 0) + (result.counts["Repaired crack"] || 0)
  const ruttingCount = result.counts["Rutting"] || 0

  const totalCrackArea = crackCount * (Math.random() * 0.5 + 0.2)
  const crackExtent = (totalCrackArea / totalSurveyArea) * 100
  const totalPotholeArea = potholeCount * (Math.random() * 0.3 + 0.1)
  const avgRutDepth = ruttingCount > 0 ? Math.random() * 15 + 5 : 0
  const totalPatchArea = patchCount * (Math.random() * 0.8 + 0.3)
  const patchExtent = (totalPatchArea / totalSurveyArea) * 100

  // Calculate individual PCI scores (IRC 82:2023 based)
  const pciCracking = Math.max(0, 100 - crackExtent * 8)
  const pciPotholes = Math.max(0, 100 - potholeCount * 12)
  const pciRutting = Math.max(0, 100 - avgRutDepth * 3)
  const pciPatching = Math.max(0, 100 - patchExtent * 5)

  // Weighted final PCI
  const finalPCI = (pciCracking * 0.35 + pciPotholes * 0.30 + pciRutting * 0.20 + pciPatching * 0.15)

  const condition = getCondition(finalPCI)

  return {
    roadContext: {
      roadType: config.roadType,
      lengthPerImage: config.roadLength,
      laneWidth: config.laneWidth,
      totalImages,
      totalSurveyLength,
      totalSurveyArea,
    },
    metrics: {
      totalCrackArea,
      crackExtent,
      totalPotholeArea,
      potholeNumber: potholeCount,
      avgRutDepth,
      totalPatchArea,
      patchExtent,
    },
    individualPCI: {
      cracking: pciCracking,
      potholes: pciPotholes,
      rutting: pciRutting,
      patching: pciPatching,
    },
    finalPCI,
    condition: {
      label: condition.label,
      color: condition.color,
      action: condition.action,
    },
  }
}

export default function DetectionPage() {
  const [image, setImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [surveyConfig, setSurveyConfig] = useState<SurveyConfig>({
    roadType: "Highway",
    roadLength: 5,
    laneWidth: 3.5,
  })
  const [pciReport, setPciReport] = useState<PCIReport | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setResult(null)
        setPciReport(null)
        setShowConfigModal(true)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setResult(null)
        setPciReport(null)
        setShowConfigModal(true)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  

 // 🔥 ONLY IMPORTANT PART SHOWN (your UI remains same)

  const handleDetect = async () => {
    if (!image) return

    setIsProcessing(true)

    try {
      const res = await fetch("http://127.0.0.1:8000/detect", {
        method: "POST",
        body: dataURLtoFormData(image),
      })

      const data = await res.json()
      console.log("Backend Response:", data)

      // 🚨 SAFETY CHECK
      if (!data || !Array.isArray(data.detections)) {
        console.error("Invalid backend response:", data)
        setResult({ detections: [], counts: {} })
        setIsProcessing(false)
        return
      }

      const normalizeClass = (cls: string) => {
        if (cls.includes("Longitudinal")) return "Longitudinal"
        if (cls.includes("Transverse")) return "Transverse"
        if (cls.includes("Alligator")) return "Alligator"
        if (cls.includes("Repaired")) return "Repaired crack"
        if (cls.includes("Pothole")) return "Pothole"
        if (cls.includes("Patching")) return "Patchy road"
        if (cls.includes("Rutting")) return "Rutting"
        return cls
      }

      const img = imageRef.current
      const imgWidth = img?.naturalWidth || 640
      const imgHeight = img?.naturalHeight || 640

      const detections = data.detections.map((d: any) => {
        const box = d.bbox[0]

        return {
          class: normalizeClass(d.class),
          confidence: d.confidence,
          bbox: {
            x: Math.max(0, box[0] / imgWidth),
            y: Math.max(0, box[1] / imgHeight),
            width: Math.max(0, (box[2] - box[0]) / imgWidth),
            height: Math.max(0, (box[3] - box[1]) / imgHeight),
          },
        }
      })

      const counts: Record<string, number> = {}
      detections.forEach((d: any) => {
        counts[d.class] = (counts[d.class] || 0) + 1
      })

      if (detections.length === 0) {
        console.log("No damage detected")
      }

      setResult({ detections, counts })

    } catch (err) {
      console.error("Detection error:", err)
    }

    setIsProcessing(false)
  }


// ✅ FIXED: OUTSIDE detect (THIS WAS YOUR MAIN BUG)
  const handlePCI = async () => {
    if (!result) return

    try {
      const res = await fetch("http://127.0.0.1:8000/calculate-pci", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          detections: result.detections,
          road_type: surveyConfig.roadType,
          road_length: surveyConfig.roadLength,
          lane_width: surveyConfig.laneWidth,
        }),
      })

      const data = await res.json()
      console.log("PCI RESULT:", data)

      setPciReport({
        finalPCI: data.PCI,
        roadContext: {
          roadType: data.road_type,
          lengthPerImage: surveyConfig.roadLength,
          laneWidth: surveyConfig.laneWidth,
          totalImages: 1,
          totalSurveyLength: surveyConfig.roadLength,
          totalSurveyArea:
            surveyConfig.roadLength * surveyConfig.laneWidth,
        },
        metrics: {
          totalCrackArea: 0,
          crackExtent: data.metrics.CE,
          totalPotholeArea: 0,
          potholeNumber: data.metrics.PN,
          avgRutDepth: data.metrics.RD,
          totalPatchArea: 0,
          patchExtent: data.metrics.PaE,
        },
        individualPCI: {
          cracking: 100 - data.metrics.CE,
          potholes: 100 - data.metrics.PN,
          rutting: 100 - data.metrics.RD,
          patching: 100 - data.metrics.PaE,
        },
        condition: {
          label: "Calculated",
          color: "#3B82F6",
          action: "From backend",
        },
      })

    } catch (err) {
      console.error("PCI Error:", err)
    }
  }
// const detections = data.detections.map((d: any) => ({
//   class: normalizeClass(d.class),  // ✅ FIXED
//   confidence: d.confidence,
//   bbox: {
//     x: d.bbox[0] / 640,
//     y: d.bbox[1] / 640,
//     width: (d.bbox[2] - d.bbox[0]) / 640,
//     height: (d.bbox[3] - d.bbox[1]) / 640,
//   },
// }))
//     const detections = data.detections.map((d: any) => {
//       const box = d.bbox[0]   // 🔥 THIS is the fix

//       return {
//         class: normalizeClass(d.class),
//         confidence: d.confidence,
//         bbox: {
//           x: box[0] / 640,
//           y: box[1] / 640,
//           width: (box[2] - box[0]) / 640,
//           height: (box[3] - box[1]) / 640,
//         },
//       }
//     })

//     // Generate counts (since backend doesn't send)
//     const counts: Record<string, number> = {}
//     detections.forEach((d: any) => {
//       counts[d.class] = (counts[d.class] || 0) + 1
//     })

//     setResult({ detections, counts })

//   } catch (err) {
//     console.error("Detection error:", err)
//   }

//   setIsProcessing(false)
// }

  // const handleGeneratePCIReport = async () => {
  //   if (!result) return

  //   setIsGeneratingReport(true)
  //   await new Promise((resolve) => setTimeout(resolve, 1500))

  //   const report = calculatePCIReport(result, surveyConfig)
  //   setPciReport(report)
  //   setIsGeneratingReport(false)
  // }

  const handleClear = () => {
    setImage(null)
    setResult(null)
    setPciReport(null)
  }

  // Draw bounding boxes on canvas
  useEffect(() => {
    if (!result || !canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = imageRef.current

    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    result.detections.forEach((detection) => {
      const classInfo = DAMAGE_CLASSES.find((c) => c.name === detection.class)
      const color = classInfo?.color || "#EF4444"

      const x = detection.bbox.x * canvas.width
      const y = detection.bbox.y * canvas.height
      const width = detection.bbox.width * canvas.width
      const height = detection.bbox.height * canvas.height

      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.strokeRect(x, y, width, height)

      ctx.fillStyle = color
      const label = `${detection.class} ${(detection.confidence * 100).toFixed(0)}%`
      const labelWidth = ctx.measureText(label).width + 12
      ctx.fillRect(x, y - 24, labelWidth, 24)

      ctx.fillStyle = "#FFFFFF"
      ctx.font = "bold 14px Inter, sans-serif"
      ctx.fillText(label, x + 6, y - 7)
    })
  }, [result])

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
            Road Damage Detection
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload a road image to detect and classify pavement distresses using AI
          </p>
        </motion.div>

        {/* Survey Configuration Modal */}
        <AnimatePresence>
          {showConfigModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-semibold text-foreground">
                      Survey Configuration
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Configure road parameters for PCI analysis
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Road Type
                    </label>
                    <select
                      value={surveyConfig.roadType}
                      onChange={(e) =>
                        setSurveyConfig({ ...surveyConfig, roadType: e.target.value })
                      }
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {ROAD_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Road Length per Image (meters)
                    </label>
                    <input
                      type="number"
                      value={surveyConfig.roadLength}
                      onChange={(e) =>
                        setSurveyConfig({
                          ...surveyConfig,
                          roadLength: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="e.g., 5"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Lane Width (meters)
                    </label>
                    <input
                      type="number"
                      value={surveyConfig.laneWidth}
                      onChange={(e) =>
                        setSurveyConfig({
                          ...surveyConfig,
                          laneWidth: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="e.g., 3.5"
                      step="0.1"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowConfigModal(false)
                      setImage(null)
                    }}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setShowConfigModal(false)}
                    className="flex-1 rounded-xl"
                  >
                    Continue
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold text-foreground">
                Upload Image
              </h2>

              {!image ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={cn(
                    "relative flex min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-lg font-medium text-foreground">
                      Drag & drop your image here
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      or click to browse files
                    </p>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Supports JPG, PNG, WebP (max 10MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      ref={(el) => {
                        imageRef.current = el
                      }}
                      src={image}
                      alt="Uploaded road"
                      className="h-auto w-full"
                      crossOrigin="anonymous"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 h-full w-full"
                    />
                  </div>

                  <button
                    onClick={handleClear}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Survey Config Badge */}
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    <Settings className="h-3 w-3" />
                    <span>{surveyConfig.roadType}</span>
                    <span className="text-border">|</span>
                    <span>{surveyConfig.roadLength}m length</span>
                    <span className="text-border">|</span>
                    <span>{surveyConfig.laneWidth}m width</span>
                    <button
                      onClick={() => setShowConfigModal(true)}
                      className="ml-auto text-primary hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Button
                      onClick={handleDetect}
                      disabled={isProcessing}
                      className="flex-1 rounded-xl"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Detect Damage
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClear}
                      className="rounded-xl"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold text-foreground">
                Detection Results
              </h2>

              <AnimatePresence mode="wait">
                {!image && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Upload an image to see detection results
                    </p>
                  </motion.div>
                )}

                {image && !result && !isProcessing && (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                      <AlertTriangle className="h-8 w-8 text-primary" />
                    </div>
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                      Click &quot;Detect Damage&quot; to analyze the image
                    </p>
                  </motion.div>
                )}

                {isProcessing && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border"
                  >
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Analyzing image...
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Running AI detection model
                    </p>
                  </motion.div>
                )}

                {result && !pciReport && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Summary */}
                    <div className="flex items-center gap-3 rounded-xl bg-accent/10 p-4">
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                      <div>
                        <p className="font-medium text-foreground">
                          Detection Complete
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Found {result.detections.length} damage instances
                        </p>
                      </div>
                    </div>

                    {/* Class Counts */}
                    <div>
                      <h3 className="mb-3 text-sm font-medium text-foreground">
                        Detected Classes
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {DAMAGE_CLASSES.map((cls) => {
                          const count = result.counts[cls.name] || 0
                          return (
                            <div
                              key={cls.name}
                              className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: cls.color }}
                                />
                                <span className="text-xs font-medium text-foreground">
                                  {cls.name}
                                </span>
                              </div>
                              <span className="font-mono text-xs font-semibold text-foreground">
                                {count}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Generate PCI Report Button */}
                    <Button
                      onClick={handlePCI}
                      disabled={isGeneratingReport}
                      className="w-full rounded-xl bg-primary py-6 text-base font-semibold"
                    >
                      {isGeneratingReport ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating Report...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-5 w-5" />
                          Generate PCI Report
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* PCI Report Section */}
        <AnimatePresence>
          {pciReport && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  PCI Analysis Report
                </h2>
                <Button variant="outline" className="rounded-xl">
                  <Download className="mr-2 h-4 w-4" />
                  Download PCI Report
                </Button>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Section 1: Road Context */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      Road Context
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground">Road Type</p>
                      <p className="mt-1 font-medium text-foreground">
                        {pciReport.roadContext.roadType}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground">Length/Image</p>
                      <p className="mt-1 font-mono font-medium text-foreground">
                        {pciReport.roadContext.lengthPerImage} m
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground">Lane Width</p>
                      <p className="mt-1 font-mono font-medium text-foreground">
                        {pciReport.roadContext.laneWidth} m
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground">Total Images</p>
                      <p className="mt-1 font-mono font-medium text-foreground">
                        {pciReport.roadContext.totalImages}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground">Survey Length</p>
                      <p className="mt-1 font-mono font-medium text-foreground">
                        {pciReport.roadContext.totalSurveyLength.toFixed(1)} m
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground">Survey Area</p>
                      <p className="mt-1 font-mono font-medium text-foreground">
                        {pciReport.roadContext.totalSurveyArea.toFixed(1)} m²
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Section 2: Metrics */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      Distress Metrics
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Total Crack Area</p>
                      <p className="mt-1 font-mono text-sm font-medium text-foreground">
                        {pciReport.metrics.totalCrackArea.toFixed(2)} m²
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Crack Extent (CE)</p>
                      <p className="mt-1 font-mono text-sm font-medium text-foreground">
                        {pciReport.metrics.crackExtent.toFixed(2)}%
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Total Pothole Area</p>
                      <p className="mt-1 font-mono text-sm font-medium text-foreground">
                        {pciReport.metrics.totalPotholeArea.toFixed(2)} m²
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Pothole Number (PN)</p>
                      <p className="mt-1 font-mono text-sm font-medium text-foreground">
                        {pciReport.metrics.potholeNumber}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Avg Rut Depth (RD)</p>
                      <p className="mt-1 font-mono text-sm font-medium text-foreground">
                        {pciReport.metrics.avgRutDepth.toFixed(1)} mm
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Total Patch Area</p>
                      <p className="mt-1 font-mono text-sm font-medium text-foreground">
                        {pciReport.metrics.totalPatchArea.toFixed(2)} m²
                      </p>
                    </div>
                    <div className="col-span-2 rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Patch Extent (PaE)</p>
                      <p className="mt-1 font-mono text-sm font-medium text-foreground">
                        {pciReport.metrics.patchExtent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Section 3: Individual PCI Scores */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      Individual PCI Scores
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "PCI (Cracking)", value: pciReport.individualPCI.cracking },
                      { label: "PCI (Potholes)", value: pciReport.individualPCI.potholes },
                      { label: "PCI (Rutting)", value: pciReport.individualPCI.rutting },
                      { label: "PCI (Patching)", value: pciReport.individualPCI.patching },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {item.label}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                          <span className="w-14 text-right font-mono text-sm font-semibold text-foreground">
                            {item.value.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Section 4 & 5: Final PCI + Condition */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-6"
                >
                  {/* Final PCI */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <h3 className="font-serif text-lg font-semibold text-foreground">
                        Final Result
                      </h3>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-xl bg-muted/50 py-8">
                      <p className="text-sm text-muted-foreground">
                        Final Weighted PCI
                      </p>
                      <p className="mt-2 font-mono text-5xl font-bold text-foreground">
                        {pciReport.finalPCI.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Condition Classification */}
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500" />
                      <h3 className="font-serif text-lg font-semibold text-foreground">
                        Condition Classification
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span
                          className="rounded-full px-4 py-2 text-sm font-semibold text-white"
                          style={{ backgroundColor: pciReport.condition.color }}
                        >
                          {pciReport.condition.label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Based on IRC 82:2023
                        </span>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-4">
                        <p className="text-xs text-muted-foreground">
                          Recommended Action
                        </p>
                        <p className="mt-1 font-medium text-foreground">
                          {pciReport.condition.action}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
