"use client"

import { Check, CreditCard, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrustIndicatorsProps {
  className?: string
  vertical?: boolean
}

export function TrustIndicators({ className, vertical = false }: TrustIndicatorsProps) {
  const indicators = [
    {
      icon: Check,
      text: "100% Free to Start",
    },
    {
      icon: CreditCard,
      text: "No Credit Card Required",
    },
    {
      icon: X,
      text: "Cancel Anytime",
    },
  ]

  return (
    <div
      className={cn(
        "flex items-center gap-4 text-sm text-muted-foreground",
        vertical && "flex-col items-start gap-3",
        className
      )}
    >
      {indicators.map((indicator, index) => {
        const Icon = indicator.icon
        return (
          <div key={indicator.text} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-3 w-3 text-primary" />
              </div>
              <span className="font-medium">{indicator.text}</span>
            </div>
            {!vertical && index < indicators.length - 1 && (
              <div className="ml-4 h-4 w-px bg-border" />
            )}
          </div>
        )
      })}
    </div>
  )
}
