import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ZapIcon,
  SparklesIcon,
  SearchIcon,
  LanguagesIcon,
  ClockIcon,
  DownloadIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Features",
  description: "Discover all the powerful features that make YouTube Summaries the perfect tool for extracting transcripts and AI summaries from YouTube videos.",
  openGraph: {
    title: "Features - YouTube Summaries",
    description: "Discover all the powerful features that make YouTube Summaries the perfect tool for extracting transcripts and AI summaries from YouTube videos.",
    url: "/features",
    siteName: "YouTube Summaries",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "YouTube Summaries Features",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Features - YouTube Summaries",
    description: "Discover all the powerful features that make YouTube Summaries the perfect tool for extracting video content.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/features",
  },
}

export default function Features() {
  const features = [
    {
      icon: ZapIcon,
      title: "Instant Transcripts",
      description:
        "Extract accurate transcripts from any YouTube video in seconds. No manual typing required - just paste the URL and get instant results.",
      badge: "Speed",
    },
    {
      icon: SparklesIcon,
      title: "AI-Powered Summaries",
      description:
        "Get intelligent summaries of video content using advanced AI. Save time by reading concise summaries instead of watching entire videos.",
      badge: "AI",
    },
    {
      icon: SearchIcon,
      title: "Searchable Content",
      description:
        "Search through video transcripts instantly. Find specific topics, quotes, or moments without scrubbing through the entire video.",
      badge: "Search",
    },
    {
      icon: LanguagesIcon,
      title: "Multiple Languages",
      description:
        "Support for videos in various languages. Extract transcripts and summaries from international content with ease.",
      badge: "Languages",
    },
    {
      icon: ClockIcon,
      title: "Timestamp Navigation",
      description:
        "Jump to specific moments in videos using clickable timestamps. Navigate video content efficiently with precise time markers.",
      badge: "Navigation",
    },
    {
      icon: DownloadIcon,
      title: "Export Options",
      description:
        "Download transcripts in multiple formats. Save, share, or integrate video content into your workflow with flexible export options.",
      badge: "Export",
    },
    {
      icon: MessageCircleIcon,
      title: "Chat with Videos",
      description:
        "Ask questions about video content and get instant answers. Interact with videos using AI-powered conversational interface.",
      badge: "Interactive",
    },
    {
      icon: ShieldCheckIcon,
      title: "Fast & Reliable",
      description:
        "High-accuracy transcription with quick processing times. Trust our proven technology for consistent, quality results every time.",
      badge: "Quality",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto flex flex-col items-center gap-4 px-4 py-16 text-center sm:gap-6 sm:py-20 md:py-24 lg:py-32">
          <Badge variant="secondary" className="mb-2 sm:mb-4">
            Features
          </Badge>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Everything you need to{" "}
            <span className="text-primary">
              unlock YouTube content
            </span>
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
            Powerful features designed to help you extract, analyze, and understand
            video content faster than ever before.
          </p>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto space-y-6 px-4 py-12 sm:space-y-8 sm:py-16 md:py-20 lg:py-24">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.title}
                  className="transition-all hover:shadow-lg hover:border-primary/20"
                >
                  <CardHeader>
                    <div className="mb-3 flex items-center justify-between sm:mb-4">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 sm:size-12">
                        <Icon className="size-5 text-primary sm:size-6" />
                      </div>
                      <Badge variant="outline" className="text-xs sm:text-sm">{feature.badge}</Badge>
                    </div>
                    <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24">
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl">
                Ready to experience these features?
              </CardTitle>
              <CardDescription className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg">
                Get started today and see how YouTube Summaries can transform your
                video content workflow.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild size="lg" className="group w-full sm:w-auto">
                <Link href="/">
                  Start My Free Trial
                  <ArrowRightIcon className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}
