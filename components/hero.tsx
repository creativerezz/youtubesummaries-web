"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown, Search } from "lucide-react"
import Link from "next/link"

export function Hero() {
  const scrollToDemo = useCallback(() => {
    const demoElement = document.getElementById("demo")
    if (demoElement) {
      const header = document.querySelector("header")
      const headerHeight = header ? header.offsetHeight : 0
      const elementPosition = demoElement.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
  }, [])

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 isolate hidden contain-strict lg:block">
        <div className="absolute left-0 top-0 w-140 h-320 -translate-y-87.5 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsl(var(--primary)/.08)_0,transparent_50%)]" />
        <div className="absolute left-0 top-0 h-320 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsl(var(--primary)/.1)_0,transparent_100%)]" />
        <div className="absolute left-0 top-0 h-320 w-60 -translate-y-87.5 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsl(var(--primary)/.1)_0,transparent_100%)]" />
      </div>

      <div className="relative pt-24">
        <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,hsl(var(--muted))_100%)]" />

        <div className="mx-auto max-w-5xl px-6">
          <div className="sm:mx-auto lg:mr-auto lg:mt-0">
            <h1 className="mt-8 max-w-2xl text-balance text-5xl font-medium text-foreground md:text-6xl lg:mt-16">
              Turn 2-hour videos into <span className="text-primary">2-minute insights</span>
            </h1>

            <p className="mt-8 max-w-2xl text-pretty text-lg text-muted-foreground">
              Save 97% of your time with AI-powered transcripts and summaries. Start your free 14-day trial—no credit card required.
            </p>

            <div className="mt-12 flex items-center gap-2">
              <div className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border border-border p-0.5">
                <Button
                  onClick={scrollToDemo}
                  size="lg"
                  className="rounded-xl px-5 text-base"
                >
                  <span className="text-nowrap">Start My Free Trial</span>
                  <ArrowDown className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-10.5 rounded-xl px-5 text-base"
              >
                <Link href="/search">
                  <Search className="mr-2 h-4 w-4" />
                  <span className="text-nowrap">Find My Videos</span>
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>100% Free to Start</span>
              </div>
              <div className="hidden h-4 w-px bg-border sm:block" />
              <div className="hidden sm:block">AI-Powered Summaries</div>
              <div className="hidden h-4 w-px bg-border sm:block" />
              <div className="hidden sm:block">Instant Results</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
