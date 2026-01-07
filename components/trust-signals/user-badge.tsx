"use client"

import { Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface UserBadgeProps {
  className?: string
  userCount?: number
}

export function UserBadge({ className, userCount = 10000 }: UserBadgeProps) {
  const formattedCount = userCount >= 1000
    ? `${(userCount / 1000).toFixed(0)}k`
    : userCount.toString()

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 px-3 py-1.5 text-sm font-medium",
        className
      )}
    >
      <Users className="h-3.5 w-3.5" />
      <span>Join {formattedCount}+ users</span>
    </Badge>
  )
}
