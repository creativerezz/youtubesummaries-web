"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwipeableTabsContextValue {
  value: string
  onValueChange: (value: string) => void
  tabs: string[]
}

const SwipeableTabsContext = React.createContext<SwipeableTabsContextValue | undefined>(undefined)

function useSwipeableTabs() {
  const context = React.useContext(SwipeableTabsContext)
  if (!context) {
    throw new Error("useSwipeableTabs must be used within SwipeableTabs")
  }
  return context
}

interface SwipeableTabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function SwipeableTabs({
  defaultValue,
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  children,
  className
}: SwipeableTabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [tabs, setTabs] = React.useState<string[]>([])

  // Support both controlled and uncontrolled modes
  const value = controlledValue ?? internalValue
  const onValueChange = controlledOnValueChange ?? setInternalValue

  React.useEffect(() => {
    const tabElements = React.Children.toArray(children)
      .flatMap((child) => {
        if (React.isValidElement(child) && child.type === SwipeableTabsList) {
          return React.Children.toArray((child as React.ReactElement<{ children: React.ReactNode }>).props.children)
        }
        return []
      })
      .filter((child) => React.isValidElement(child) && child.type === SwipeableTabsTrigger)
      .map((child) => {
        if (React.isValidElement(child)) {
          return (child as React.ReactElement<{ value: string }>).props.value
        }
        return null
      })
      .filter((v): v is string => v !== null)

    setTabs(tabElements)
  }, [children])

  return (
    <SwipeableTabsContext.Provider value={{ value, onValueChange, tabs }}>
      <div className={cn("w-full", className)}>{children}</div>
    </SwipeableTabsContext.Provider>
  )
}

function SwipeableTabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-fit items-center justify-center rounded-lg bg-muted/50 sm:bg-muted p-0.5 sm:p-1 md:p-1.5 text-muted-foreground w-full overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  )
}

function SwipeableTabsTrigger({
  value,
  children,
  className,
  title,
}: { value: string; children: React.ReactNode; className?: string; title?: string }) {
  const { value: selectedValue, onValueChange } = useSwipeableTabs()
  const isSelected = selectedValue === value

  return (
    <button
      type="button"
      data-slot="tabs-trigger"
      data-state={isSelected ? "active" : "inactive"}
      onClick={() => onValueChange(value)}
      title={title}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md sm:rounded-lg transition-all outline-none focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 flex-1 w-full min-w-0",
        "font-medium active:scale-[0.97] touch-manipulation",
        isSelected 
          ? "bg-background text-foreground shadow-sm z-10" 
          : "text-muted-foreground hover:bg-background/50 hover:text-foreground active:bg-background/70",
        className,
      )}
    >
      <span className="inline-flex items-center justify-center min-w-0 w-full">
        {children}
      </span>
    </button>
  )
}

function SwipeableTabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { value: selectedValue, onValueChange, tabs } = useSwipeableTabs()
  const [touchStart, setTouchStart] = React.useState<number | null>(null)
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    const currentIndex = tabs.indexOf(selectedValue)

    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      onValueChange(tabs[currentIndex + 1])
    } else if (isRightSwipe && currentIndex > 0) {
      onValueChange(tabs[currentIndex - 1])
    }
  }

  if (selectedValue !== value) return null

  return (
    <div
      data-slot="tabs-content"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={cn("mt-1 sm:mt-1.5 md:mt-2 outline-none focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:ring-offset-1", className)}
    >
      {children}
    </div>
  )
}

SwipeableTabs.List = SwipeableTabsList
SwipeableTabs.Trigger = SwipeableTabsTrigger
SwipeableTabs.Content = SwipeableTabsContent

export { useSwipeableTabs }
