"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Camera,
  BarChart3,
  FileText,
  Gauge,
  Brain,
  Lightbulb,
  Upload,
  Search,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Camera,
    title: "Real-time Detection",
    description: "Instant road damage detection using state-of-the-art deep learning models",
  },
  {
    icon: Brain,
    title: "7 Distress Classes",
    description: "Comprehensive classification of road damage types as per IRC standards",
  },
  {
    icon: Gauge,
    title: "PCI Scoring",
    description: "Automated Pavement Condition Index calculation following IRC 82:2023",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Visual insights and trends for road condition monitoring",
  },
  {
    icon: FileText,
    title: "PDF Reports",
    description: "Generate detailed assessment reports for documentation and planning",
  },
  {
    icon: Lightbulb,
    title: "Smart Recommendations",
    description: "AI-powered maintenance suggestions based on detected conditions",
  },
]

const workflowSteps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload",
    description: "Upload road images via drag & drop or file selection",
  },
  {
    icon: Search,
    step: "02",
    title: "Analyse",
    description: "AI processes images to detect and classify road damage",
  },
  {
    icon: ClipboardCheck,
    step: "03",
    title: "Report",
    description: "Get PCI scores, recommendations, and exportable reports",
  },
]

const pciScale = [
  { range: "90-100", condition: "Excellent", action: "Routine Maintenance", color: "bg-[#22C55E]" },
  { range: "80-90", condition: "Good", action: "Preventive Maintenance", color: "bg-[#84CC16]" },
  { range: "60-80", condition: "Satisfactory", action: "Renewal", color: "bg-[#EAB308]" },
  { range: "40-60", condition: "Fair", action: "Minor Rehabilitation", color: "bg-[#F97316]" },
  { range: "20-40", condition: "Poor", action: "Major Rehabilitation / Overlay", color: "bg-[#EF4444]" },
  { range: "0-20", condition: "Failed", action: "Reconstruction", color: "bg-[#DC2626]" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - 2 Column Layout */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/50 to-background px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Side - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                AI-Powered Road Assessment
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                <span className="text-balance">AI-Based Road Damage Detection</span>
                <br />
                <span className="text-primary">&amp; PCI System</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground text-pretty lg:text-lg">
                End-to-end automated pipeline for pavement condition assessment using deep learning.
                Detect damage, calculate PCI scores, and get maintenance recommendations instantly.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-xl px-8 text-base">
                  <Link href="/detection">
                    Try Detection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 rounded-xl px-8 text-base">
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </div>
            </motion.div>

            {/* Right Side - PCI Condition Scale Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 font-serif text-lg font-semibold text-foreground">
                  PCI Condition Scale (IRC 82:2023)
                </h2>
                <div className="space-y-2">
                  {pciScale.map((row) => (
                    <div
                      key={row.range}
                      className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2"
                    >
                      <span className={`h-3 w-3 flex-shrink-0 rounded-full ${row.color}`} />
                      <span className="w-16 flex-shrink-0 font-mono text-sm font-medium text-foreground">
                        {row.range}
                      </span>
                      <span className="w-24 flex-shrink-0 text-sm font-medium text-foreground">
                        {row.condition}
                      </span>
                      <span className="text-sm text-muted-foreground">{row.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
              Comprehensive Road Assessment
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Everything you need for automated pavement condition monitoring and analysis
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:shadow-sm"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="border-y border-border bg-muted/30 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Three simple steps to assess road conditions
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-16 grid gap-8 md:grid-cols-3"
          >
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.title}
                variants={itemVariants}
                className="relative text-center"
              >
                {index < workflowSteps.length - 1 && (
                  <div className="absolute left-[calc(50%+60px)] top-12 hidden h-0.5 w-[calc(100%-120px)] bg-border md:block" />
                )}
                <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-card">
                  <step.icon className="h-10 w-10 text-primary" />
                  <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-mono text-sm font-bold text-primary-foreground">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/30 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
              Ready to Assess Your Roads?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start detecting road damage and calculating PCI scores with our AI-powered system
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-xl px-8 text-base">
                <Link href="/detection">
                  Start Detection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-xl px-8 text-base">
                <Link href="/pci-calculator">Calculate PCI</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm text-muted-foreground">
            RoadAI - AI-Based Road Damage Detection &amp; PCI System
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            University Thesis Project | Deep Learning for Civil Engineering
          </p>
        </div>
      </footer>
    </div>
  )
}
