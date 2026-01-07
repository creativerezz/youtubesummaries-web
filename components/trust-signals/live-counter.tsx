"use client"

import { useEffect, useState } from "react"
import { Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface LiveCounterProps {
  className?: string
  initialCount?: number
}

export function LiveCounter({ className, initialCount = 1234 }: LiveCounterProps) {
  const [count, setCount] = useState(initialCount)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Animate the counter on mount
    let current = Math.floor(initialCount * 0.7)
    const increment = Math.floor((initialCount - current) / 20)

    const timer = setInterval(() => {
      current += increment
      if (current >= initialCount) {
        current = initialCount
        clearInterval(timer)
      }
      setCount(current)
    }, 50)

    // Periodic pulse animation
    const pulseInterval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 600)
    }, 3000)

    return () => {
      clearInterval(timer)
      clearInterval(pulseInterval)
    }
  }, [initialCount])

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-all duration-300",
        isAnimating && "shadow-md shadow-primary/20 border-primary/40",
        className
      )}
    >
      <div className="relative">
        <Activity
          className={cn(
            "h-4 w-4 text-primary transition-all duration-300",
            isAnimating && "scale-110"
          )}
        />
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-primary/20 blur-sm transition-opacity duration-300",
            isAnimating ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-base font-semibold tabular-nums text-foreground">
          {count.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground">
          videos summarized today
        </span>
      </div>
    </div>
  )
}
