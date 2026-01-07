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
import { Mail, MessageSquare, ExternalLink } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with YouTube Summaries. We're here to help you extract transcripts and summaries from YouTube videos.",
  openGraph: {
    title: "Contact Us - YouTube Summaries",
    description: "Get in touch with YouTube Summaries. We're here to help you extract transcripts and summaries from YouTube videos.",
    url: "/contact",
    siteName: "YouTube Summaries",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Contact YouTube Summaries",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us - YouTube Summaries",
    description: "Get in touch with YouTube Summaries. We're here to help you extract transcripts and summaries from YouTube videos.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/contact",
  },
}

export default function Contact() {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description: "Send us an email and we'll get back to you within 24 hours.",
      action: "support@youtubesummaries.cc",
      href: "mailto:support@youtubesummaries.cc",
    },
    {
      icon: ExternalLink,
      title: "GitHub",
      description: "Found a bug or have a feature request? Open an issue on GitHub.",
      action: "View on GitHub",
      href: "https://github.com/youtubesummaries",
      customIcon: (
        <svg viewBox="0 0 24 24" className="size-6 text-sky-500 dark:text-sky-300" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
    },
    {
      icon: ExternalLink,
      title: "X (Twitter)",
      description: "Follow us for updates and quick support.",
      action: "@youtubesummaries",
      href: "https://x.com/youtubesummaries",
      customIcon: (
        <svg viewBox="0 0 24 24" className="size-6 text-sky-500 dark:text-sky-300" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto flex flex-col items-center gap-4 px-4 py-16 text-center sm:gap-6 sm:py-20 md:py-24 lg:py-32">
          <Badge variant="secondary" className="mb-2 sm:mb-4">
            Contact Us
          </Badge>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            We&apos;d love to{" "}
            <span className="bg-gradient-to-r from-sky-500 to-sky-300 bg-clip-text text-transparent dark:from-sky-300 dark:to-sky-500">
              hear from you
            </span>
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
            Have a question, feedback, or need help? Reach out to us through any
            of the channels below and we&apos;ll get back to you as soon as possible.
          </p>
        </section>

        {/* Contact Methods */}
        <section className="container mx-auto space-y-6 px-4 py-12 sm:space-y-8 sm:py-16 md:py-20 lg:py-24">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {contactMethods.map((method) => {
              const Icon = method.icon
              return (
                <Card key={method.title} className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-sky-500/10 dark:bg-sky-300/10">
                      {"customIcon" in method && method.customIcon ? (
                        method.customIcon
                      ) : (
                        <Icon className="size-6 text-sky-500 dark:text-sky-300" />
                      )}
                    </div>
                    <CardTitle>{method.title}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={method.href}
                      className="text-sky-500 hover:text-sky-600 dark:text-sky-300 dark:hover:text-sky-200 font-medium"
                      target={method.href.startsWith("http") ? "_blank" : undefined}
                      rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      {method.action}
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24">
          <Card className="border-2 bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/20 dark:to-sky-900/10">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-sky-500/10 dark:bg-sky-300/10">
                <MessageSquare className="size-6 text-sky-500 dark:text-sky-300" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl">
                Frequently Asked Questions
              </CardTitle>
              <CardDescription className="text-base">
                Quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="font-semibold mb-2">How do I extract a transcript?</h3>
                <p className="text-muted-foreground text-sm">
                  Simply paste a YouTube URL into the input field on our homepage and click
                  &quot;Get Transcript&quot;. The transcript will be extracted automatically.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is YouTube Summaries free to use?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes! Basic transcript extraction is free. We also offer premium features
                  for power users who need higher limits and additional capabilities.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What if a video doesn&apos;t have captions?</h3>
                <p className="text-muted-foreground text-sm">
                  We rely on YouTube&apos;s captions for transcript extraction. If a video
                  doesn&apos;t have captions (auto-generated or manual), we won&apos;t be able
                  to extract a transcript.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}

