"use client"

import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccuracyBadgeProps {
  className?: string
}

export function AccuracyBadge({ className }: AccuracyBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/10",
        className
      )}
    >
      <CheckCircle2 className="h-4 w-4 text-primary" />
      <span>
        <span className="font-semibold text-primary">99% accurate</span> transcripts with verifiable timestamps
      </span>
    </div>
  )
}
