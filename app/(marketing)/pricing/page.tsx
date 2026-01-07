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
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  CheckIcon,
  ZapIcon,
  RocketIcon,
  CrownIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for YouTube Summaries. Start with a 14-day free trial, no credit card required. Choose the plan that fits your needs.",
  openGraph: {
    title: "Pricing - YouTube Summaries",
    description:
      "Simple, transparent pricing for YouTube Summaries. Start with a 14-day free trial, no credit card required.",
    url: "/pricing",
    siteName: "YouTube Summaries",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "YouTube Summaries Pricing",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing - YouTube Summaries",
    description:
      "Simple, transparent pricing for YouTube Summaries. Start with a 14-day free trial, no credit card required.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/pricing",
  },
}

export default function Pricing() {
  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      period: "month",
      description: "Perfect for trying out YouTube Summaries",
      icon: ZapIcon,
      features: [
        "5 summaries per month",
        "Basic transcript extraction",
        "Video search",
        "Community support",
        "Export transcripts",
      ],
      cta: "Start for Free",
      href: "/",
      popular: false,
      badge: null,
    },
    {
      name: "Starter",
      price: "$9",
      period: "month",
      description: "Best for regular users and content creators",
      icon: RocketIcon,
      features: [
        "30 summaries per month",
        "AI-powered summaries",
        "Advanced transcript features",
        "Video search",
        "Priority email support",
        "Export transcripts",
        "Multiple export formats",
      ],
      cta: "Start My Free Trial",
      href: "/",
      popular: true,
      badge: "Most Popular",
    },
    {
      name: "Pro",
      price: "$19",
      period: "month",
      description: "For power users and teams",
      icon: CrownIcon,
      features: [
        "Unlimited summaries",
        "AI-powered summaries",
        "Advanced transcript features",
        "Video search",
        "Priority support",
        "API access",
        "Export transcripts",
        "Multiple export formats",
        "Custom integrations",
        "Advanced analytics",
      ],
      cta: "Start My Free Trial",
      href: "/",
      popular: false,
      badge: null,
    },
  ]

  const faqs = [
    {
      question: "How does the 14-day free trial work?",
      answer:
        "All new users get 14 days of Pro access completely free. No credit card required to start. You can explore all features, including unlimited summaries and API access. After the trial, you can choose to continue with a paid plan or downgrade to the Free tier.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, absolutely. You can cancel your subscription at any time from your dashboard. There are no long-term contracts or cancellation fees. If you cancel, you'll continue to have access until the end of your billing period, then automatically move to the Free tier.",
    },
    {
      question: "What happens when I reach my monthly summary limit?",
      answer:
        "On the Free plan, you'll need to wait until the next month or upgrade to a paid plan. On the Starter plan, you can upgrade to Pro for unlimited summaries. Your limit resets on the same day each month as your subscription started.",
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer:
        "Yes, you can change your plan at any time. When upgrading, you'll get immediate access to the new features and be charged a prorated amount. When downgrading, the change takes effect at the end of your current billing cycle.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express) and debit cards. All payments are processed securely through Polar.sh, our payment partner.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied with YouTube Summaries for any reason, contact our support team within 30 days of your purchase for a full refund.",
    },
    {
      question: "What's included in API access?",
      answer:
        "Pro plan users get full API access to programmatically extract transcripts, generate summaries, and search videos. You'll receive API keys and comprehensive documentation. Rate limits apply based on fair usage policies.",
    },
    {
      question: "Is there a discount for annual subscriptions?",
      answer:
        "We currently offer monthly subscriptions. Annual billing with discounted pricing is coming soon. Sign up for our newsletter to be notified when annual plans become available.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto flex flex-col items-center gap-4 px-4 py-16 text-center sm:gap-6 sm:py-20 md:py-24 lg:py-32">
          <Badge variant="secondary" className="mb-2 sm:mb-4">
            Pricing
          </Badge>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Simple, transparent{" "}
            <span className="text-primary">pricing for everyone</span>
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
            Start with a 14-day free trial. No credit card required. Cancel
            anytime.
          </p>
        </section>

        {/* Pricing Tiers */}
        <section className="container mx-auto space-y-6 px-4 py-12 sm:space-y-8 sm:py-16 md:py-20 lg:py-24">
          <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
            {pricingTiers.map((tier) => {
              const Icon = tier.icon
              return (
                <Card
                  key={tier.name}
                  className={`relative flex flex-col transition-all hover:shadow-lg ${
                    tier.popular
                      ? "border-2 border-primary shadow-lg scale-105 md:scale-110"
                      : "hover:border-primary/20"
                  }`}
                >
                  {tier.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground shadow-md">
                        <SparklesIcon className="mr-1 size-3" />
                        {tier.badge}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="space-y-4 pb-8">
                    <div className="flex items-center justify-between">
                      <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="size-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{tier.name}</CardTitle>
                      <CardDescription className="mt-2 text-sm">
                        {tier.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight">
                        {tier.price}
                      </span>
                      <span className="text-muted-foreground">
                        /{tier.period}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-6">
                    <Button
                      asChild
                      size="lg"
                      variant={tier.popular ? "default" : "outline"}
                      className="group w-full"
                    >
                      <Link href={tier.href}>
                        {tier.cta}
                        <ArrowRightIcon className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                    <div className="flex-1 space-y-3">
                      <p className="text-sm font-medium">What&apos;s included:</p>
                      <ul className="space-y-2.5">
                        {tier.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-3 text-sm"
                          >
                            <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                            <span className="text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Trust Signals */}
          <div className="mx-auto mt-12 max-w-3xl space-y-4 text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckIcon className="size-4 text-primary" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="size-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="size-4 text-primary" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="size-4 text-primary" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto space-y-6 px-4 py-12 sm:space-y-8 sm:py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Have questions? We&apos;ve got answers.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24">
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl">
                Ready to get started?
              </CardTitle>
              <CardDescription className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg">
                Join thousands of users who are already saving time with YouTube
                Summaries. Start your 14-day free trial today.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="group w-full sm:w-auto">
                <Link href="/">
                  Start My Free Trial
                  <ArrowRightIcon className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}
