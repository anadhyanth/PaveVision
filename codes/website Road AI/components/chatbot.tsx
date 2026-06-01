"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const predefinedResponses: Record<string, string> = {
  "What is PCI?":
    "PCI (Pavement Condition Index) is a numerical rating from 0 to 100 that indicates the overall condition of a pavement surface. A PCI of 100 represents a pavement in excellent condition, while 0 indicates a failed pavement. It's calculated based on the type, severity, and extent of distresses observed on the pavement surface.",
  "Explain damage types":
    "RoadAI detects 7 types of road damage:\n\n1. **Longitudinal Cracks** - Cracks parallel to the road direction\n2. **Transverse Cracks** - Cracks perpendicular to the road\n3. **Alligator Cracks** - Interconnected cracks forming a pattern\n4. **Repaired Cracks** - Previously patched areas\n5. **Potholes** - Bowl-shaped holes in the pavement\n6. **Patchy Roads** - Uneven surface patches\n7. **Rutting** - Depression in wheel paths",
  "What to do if PCI is low?":
    "If PCI is low (below 40), consider these actions based on IRC 82:2023 guidelines:\n\n• **PCI 20-40 (Poor)**: Major rehabilitation or overlay recommended\n• **PCI 0-20 (Failed)**: Complete reconstruction required\n\nImmediate steps:\n1. Document all distress types and locations\n2. Prioritize based on traffic volume and safety\n3. Consult with civil engineers for treatment options\n4. Plan budget for rehabilitation works",
}

const quickQuestions = [
  "What is PCI?",
  "Explain damage types",
  "What to do if PCI is low?",
]

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm the RoadAI assistant. I can help you understand PCI calculations, damage types, and maintenance recommendations. What would you like to know?",
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = (question: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
    }

    const response =
      predefinedResponses[question] ||
      "I apologize, but I can only answer predefined questions at the moment. Please select from the quick questions below or ask about PCI, damage types, or maintenance recommendations."

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInput("")
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-foreground">RoadAI Assistant</h3>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "flex-row-reverse" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "max-w-[260px] rounded-2xl px-4 py-2.5 text-sm",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Questions */}
            <div className="border-t border-border bg-card/50 px-4 py-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => handleSend(question)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-border p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (input.trim()) handleSend(input.trim())
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-xl"
                  disabled={!input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
