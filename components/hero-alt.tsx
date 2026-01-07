"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon, PlayIcon, StarIcon, UsersIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function HeroAlt() {
  const [isHovered, setIsHovered] = useState(false)

  const scrollToDemo = () => {
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
  }

  const stats = [
    { icon: UsersIcon, value: "10K+", label: "Active Users" },
    { icon: StarIcon, value: "4.9/5", label: "User Rating" },
    { icon: PlayIcon, value: "1M+", label: "Videos Processed" }
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-sky-950/20 dark:via-background dark:to-blue-950/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230348F9' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      <div className="relative container mx-auto px-4 py-20 sm:py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          {/* Top Badge */}
          <Badge variant="outline" className="mb-6 border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
            ✨ Powered by Advanced AI Technology
          </Badge>

          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Transform YouTube Videos into
            <span className="block bg-gradient-to-r from-sky-600 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-blue-400 dark:to-purple-400">
              Actionable Insights
            </span>
          </h1>

          {/* Description */}
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl lg:text-xl xl:text-2xl max-w-3xl mx-auto leading-relaxed">
            Instantly extract transcripts, generate AI-powered summaries, and unlock the full potential of YouTube content. Perfect for researchers, students, and content creators.
          </p>

          {/* Stats Row */}
          <div className="mb-10 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className="flex items-center justify-center size-12 rounded-full bg-sky-100 dark:bg-sky-900/30">
                    <Icon className="size-6 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 justify-center">
            <Button 
              onClick={scrollToDemo} 
              size="lg" 
              className="group relative overflow-hidden bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Analyzing Now
                <ArrowRightIcon className={`size-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-2 border-sky-200 bg-white/80 backdrop-blur-sm hover:bg-sky-50 hover:border-sky-300 dark:border-sky-800 dark:bg-sky-950/50 dark:hover:bg-sky-900/50 px-8 py-6 text-lg font-semibold transition-all duration-300"
            >
              <Link href="/about" className="flex items-center gap-2">
                <PlayIcon className="size-5" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-col items-center space-y-4">
            <p className="text-sm text-muted-foreground">Trusted by leading institutions and creators worldwide</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-60">
              <div className="text-xs font-medium text-muted-foreground">Harvard University</div>
              <div className="text-xs font-medium text-muted-foreground">MIT</div>
              <div className="text-xs font-medium text-muted-foreground">Stanford</div>
              <div className="text-xs font-medium text-muted-foreground">Google</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
