"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon, X, Home, Search, Sparkles, Moon, Sun, DollarSign } from "lucide-react"
import { useTheme } from "next-themes"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthButton } from "@/components/auth-button"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
}

interface HeaderProps {
  items?: Array<{
    title: string
    href: string
  }>
}

export function Header({ items = [] }: HeaderProps) {
  const defaultItems: NavItem[] = [
    { title: "Home", href: "/", icon: Home },
    { title: "Search", href: "/search", icon: Search },
    { title: "Features", href: "/features", icon: Sparkles },
    { title: "Pricing", href: "/pricing", icon: DollarSign },
  ]

  const navigationItems = items.length > 0
    ? items.map(item => ({ ...item, icon: Home }))
    : defaultItems

  const [mounted, setMounted] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Close menu on route change
  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center shrink-0 hover:opacity-80 transition-opacity"
          aria-label="YouTube Summaries Home"
        >
          <Logo />
        </Link>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2" aria-label="Main navigation">
          <ul className="flex items-center gap-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Auth Button - Desktop */}
          <div className="hidden sm:block">
            <AuthButton />
          </div>

          {/* Theme Toggle - Desktop */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          {mounted ? (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Toggle navigation menu"
                >
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full sm:w-[340px] p-0 flex flex-col"
                hideCloseButton
              >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b">
                  <Logo />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(false)}
                    className="rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-auto py-6 px-4" aria-label="Mobile navigation">
                  <div className="space-y-1">
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent active:scale-[0.98]"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.title}
                        </Link>
                      )
                    })}
                  </div>
                </nav>

                {/* Bottom Section */}
                <div className="border-t p-6 space-y-4 bg-muted/30">
                  {/* Theme Switcher */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Appearance</span>
                    <div className="flex items-center gap-0.5 bg-background/80 backdrop-blur-sm border rounded-full p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7 rounded-full transition-all",
                          theme === "light" && "bg-primary text-primary-foreground shadow-sm"
                        )}
                        onClick={() => setTheme("light")}
                      >
                        <Sun className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7 rounded-full transition-all",
                          theme === "dark" && "bg-primary text-primary-foreground shadow-sm"
                        )}
                        onClick={() => setTheme("dark")}
                      >
                        <Moon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Auth Button */}
                  <div className="w-full [&>button]:w-full [&>button]:h-11 [&>div]:w-full [&>div>button]:w-full [&>div>button]:h-11">
                    <AuthButton />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Toggle navigation menu"
              disabled
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
