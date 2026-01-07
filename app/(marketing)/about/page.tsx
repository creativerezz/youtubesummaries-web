import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Code2, Sparkles, Github, Twitter } from "lucide-react"

export const metadata: Metadata = {
  title: "About - YouTube Summaries",
  description: "A solo project built to scratch my own itch - quickly understand YouTube videos without watching the whole thing.",
  openGraph: {
    title: "About - YouTube Summaries",
    description: "A solo project built to scratch my own itch - quickly understand YouTube videos without watching the whole thing.",
    url: "/about",
    siteName: "YouTube Summaries",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About - YouTube Summaries",
    description: "A solo project built to scratch my own itch.",
  },
  alternates: {
    canonical: "/about",
  },
}

export default function About() {
  const techStack = [
    { name: "Next.js 16", description: "React framework with App Router" },
    { name: "Vercel AI SDK", description: "Streaming AI responses" },
    { name: "OpenRouter", description: "LLM gateway for Claude & GPT" },
    { name: "Tailwind CSS", description: "Utility-first styling" },
    { name: "shadcn/ui", description: "Beautiful components" },
    { name: "PostHog", description: "Analytics & LLM observability" },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto flex flex-col items-center gap-4 px-4 py-16 text-center sm:gap-6 sm:py-20 md:py-24 lg:py-32">
          <Badge variant="secondary" className="mb-2 sm:mb-4">
            Solo Project
          </Badge>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Built to scratch{" "}
            <span className="bg-linear-to-r from-sky-500 to-sky-300 bg-clip-text text-transparent dark:from-sky-300 dark:to-sky-500">
              my own itch
            </span>
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
            I watch a lot of YouTube. But sometimes I just want the key points 
            without sitting through the whole video. So I built this.
          </p>
        </section>

        {/* Story Section */}
        <section className="container mx-auto space-y-6 px-4 py-12 sm:space-y-8 sm:py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Why I Built This
            </h2>
            <div className="space-y-3 text-base text-muted-foreground sm:space-y-4 sm:text-lg">
              <p>
                I&apos;m a developer who consumes a ton of educational content on YouTube—
                coding tutorials, tech talks, podcast clips. But I kept running into 
                the same problem: a 45-minute video might have 5 minutes of content 
                I actually need.
              </p>
              <p>
                Existing tools were either too clunky, too expensive, or didn&apos;t give 
                me the features I wanted. I wanted transcripts with timestamps, 
                AI summaries that actually captured the key points, and the ability 
                to chat with the video content.
              </p>
              <p>
                So I built YouTube Summaries over a few weekends. It&apos;s simple, fast, 
                and does exactly what I need. If it&apos;s useful to you too, that&apos;s awesome.
              </p>
            </div>
          </div>
        </section>

        {/* Features I Care About */}
        <section className="container mx-auto space-y-6 px-4 py-12 sm:space-y-8 sm:py-16 md:py-20 lg:py-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              What Makes It Different
            </h2>
            <p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
              Features I actually use every day
            </p>
          </div>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-sky-500/10 dark:bg-sky-300/10">
                  <Zap className="size-6 text-sky-500 dark:text-sky-300" />
                </div>
                <CardTitle>Fast</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Paste a URL, get a summary in seconds. No sign-up required for basic use.
                </p>
              </CardHeader>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-sky-500/10 dark:bg-sky-300/10">
                  <Sparkles className="size-6 text-sky-500 dark:text-sky-300" />
                </div>
                <CardTitle>AI That Works</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Powered by Claude and GPT via OpenRouter. Summaries that actually capture the content.
                </p>
              </CardHeader>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-sky-500/10 dark:bg-sky-300/10">
                  <Code2 className="size-6 text-sky-500 dark:text-sky-300" />
                </div>
                <CardTitle>Developer Friendly</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Copy transcripts to clipboard, export to ChatGPT, or use the API directly.
                </p>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24">
          <Card className="border-2 bg-linear-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/20 dark:to-sky-900/10">
            <CardHeader>
              <CardTitle className="text-center text-2xl sm:text-3xl">
                Built With
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3">
                {techStack.map((tech) => (
                  <div key={tech.name} className="text-center">
                    <div className="font-semibold text-foreground">
                      {tech.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tech.description}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Connect */}
        <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-xl text-center space-y-6">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Say Hi
            </h2>
            <p className="text-muted-foreground">
              Got feedback, feature requests, or just want to connect? I&apos;d love to hear from you.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="https://twitter.com/creativerezz" target="_blank">
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="https://github.com/creativerezz" target="_blank">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

