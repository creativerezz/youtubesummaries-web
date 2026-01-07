import type { Metadata } from "next"
import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { CTA } from "@/components/cta"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SparklesIcon, ZapIcon, ShieldIcon, Loader2 } from "lucide-react"
import VideoAnalyzer from "@/components/youtube/video-analyzer"
import { FeaturedChannels } from "@/components/youtube/featured-channels"
import { LiveCounter } from "@/components/trust-signals"

function VideoAnalyzerFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-3xl bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: "YouTube Summaries - Get Transcripts & AI Summaries from YouTube Videos",
  description: "Extract accurate transcripts and AI-powered summaries from any YouTube video instantly. Free, fast, and easy to use. Perfect for research, learning, and content creation.",
  openGraph: {
    title: "YouTube Summaries - Get Transcripts & AI Summaries from YouTube Videos",
    description: "Extract accurate transcripts and AI-powered summaries from any YouTube video instantly. Free, fast, and easy to use.",
    url: "/",
    siteName: "YouTube Summaries",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "YouTube Summaries - Extract transcripts and summaries from YouTube videos",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Summaries - Get Transcripts & AI Summaries from YouTube Videos",
    description: "Extract accurate transcripts and AI-powered summaries from any YouTube video instantly.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
} 
export default function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://youtubesummaries.cc'
  
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "YouTube Summaries",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/icon-blue.png`,
        },
        sameAs: [
          // Add social media links when available
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "YouTube Summaries",
        description: "Extract transcripts and AI-powered summaries from any YouTube video",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${siteUrl}/#software`,
        name: "YouTube Summaries",
        applicationCategory: "WebApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description: "Extract accurate transcripts and AI-powered summaries from any YouTube video instantly",
        url: siteUrl,
        featureList: [
          "YouTube transcript extraction",
          "AI-powered video summaries",
          "Fast and accurate results",
          "Free to use",
        ],
      },
    ],
  }

  const features = [
    {
      icon: ZapIcon,
      title: "Lightning Fast",
      description:
        "Get transcripts and summaries instantly. No waiting, no delays - just fast, accurate results.",
    },
    {
      icon: ShieldIcon,
      title: "Accurate Transcripts",
      description:
        "Powered by YouTube's own captions for the most accurate transcriptions available.",
    },
    {
      icon: SparklesIcon,
      title: "Easy to Use",
      description:
        "Simply paste a YouTube URL and get your transcript. Clean, simple, and intuitive interface.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />
      <main className="flex-1">
        <Hero />

        {/* Live Activity Counter */}
        <section className="container mx-auto px-4 py-8 flex justify-center">
          <LiveCounter />
        </section>

        <div id="demo">
          <Suspense fallback={<VideoAnalyzerFallback />}>
            <VideoAnalyzer />
          </Suspense>
        </div>

        {/* Featured Channels Section */}
        <FeaturedChannels />

        {/* Features Section */}
        <section className="container mx-auto space-y-6 px-4 py-16 sm:space-y-8 sm:py-20 md:py-24 lg:py-32">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Everything you need
            </h2>
            <p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
              Powerful features to extract and analyze YouTube video content
            </p>
          </div>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-sky-500/10 dark:bg-sky-300/10">
                      <Icon className="size-6 text-sky-500 dark:text-sky-300" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </section>

        <CTA />
      </main>

      <Footer />
    </div>
  )
}
