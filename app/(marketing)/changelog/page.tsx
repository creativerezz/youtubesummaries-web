/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle2, 
  Sparkles, 
  Bug, 
  Zap, 
  Rocket,
  Calendar,
  Code,
  Shield,
  BarChart3,
  Image as ImageIcon,
  FileText,
  CreditCard,
  LayoutDashboard,
  Globe,
  Settings,
  MessageSquare,
  Download,
  Share2,
  Bell,
  Users,
  TrendingUp,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Changelog & Roadmap - YouTube Summaries",
  description: "Track what's new, what's fixed, and what's coming next for YouTube Summaries.",
  openGraph: {
    title: "Changelog & Roadmap - YouTube Summaries",
    description: "Track what's new, what's fixed, and what's coming next for YouTube Summaries.",
    url: "/changelog",
    siteName: "YouTube Summaries",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Changelog & Roadmap - YouTube Summaries",
    description: "Track what's new, what's fixed, and what's coming next.",
  },
  alternates: {
    canonical: "/changelog",
  },
}

// Changelog data parsed from CHANGELOG.md
const changelogData = {
  unreleased: {
    version: "Unreleased",
    date: null,
    sections: {
      features: [
        { scope: "payments", text: "Integrate Polar.sh subscription checkout and payment processing" },
        { scope: "payments", text: "Add success page for post-checkout redirect with checkout ID display" },
        { scope: "payments", text: "Create automated product creation script for Polar.sh sandbox and production" },
        { scope: "payments", text: "Add comprehensive Polar.sh setup documentation (POLAR_SETUP.md, POLAR_PRODUCTION_SETUP.md)" },
        { scope: "dashboard", text: "Add graceful error handling for Supabase when credentials are not configured" },
        { scope: "dashboard", text: "Implement dashboard page component to fix 404 routing issue" },
        { text: "Revamp About page and header for improved user experience" },
        { scope: "api", text: "Implement API versioning structure" },
        { scope: "dashboard", text: "Implement parallel routes for improved performance" },
        { scope: "errors", text: "Add error boundaries and custom error pages" },
        { scope: "loading", text: "Add loading states for async routes" },
        { scope: "seo", text: "Add dynamic metadata and Open Graph images" },
        { scope: "security", text: "Add security headers to protect against common attacks" },
        { scope: "seo", text: "Update robots.txt and sitemap for better search indexing" },
        { scope: "api", text: "Add standardized error handling library" },
        { scope: "analytics", text: "Add Vercel Speed Insights for performance monitoring" },
        { scope: "dependencies", text: "Add @vercel/speed-insights package to bun.lock" },
      ],
      bugFixes: [
        { text: "Resolve issues with mobile navigation and header layout" },
        { scope: "accessibility", text: "Fix Radix UI Sheet component accessibility warning by adding SheetTitle" },
        { scope: "build", text: "Remove invalid `turbo` experimental option from Next.js config (Next.js 16 compatibility)" },
        { scope: "typescript", text: "Exclude scripts directory from TypeScript compilation to prevent build errors" },
      ],
      performance: [
        { scope: "images", text: "Optimize channel page images with Next.js Image component" },
      ],
      miscellaneous: [
        { scope: "docs", text: "Generate changelog with git-cliff" },
        { text: "Remove deprecated files and update documentation" },
      ],
    },
  },
  "0.1.0": {
    version: "0.1.0",
    date: "2025-12-18",
    sections: {
      features: [
        { text: "Migrate to Supabase auth and integrate YouTube transcript storage API" },
        { text: "Add YouTube Transcript Storage Worker with API and D1 integration" },
        { text: "Restructure marketing and API routes into dedicated groups and update OpenAI client for PostHog AI integration." },
        { text: "Introduce LLM documentation, restructure CSV data files, and configure worker environment variables." },
        { scope: "channels", text: "Add featured channel thumbnails" },
        { scope: "auth", text: "Integrate Clerk for authentication and refactor middleware" },
        { text: "Enhance ClerkProvider and middleware for improved routing" },
      ],
      bugFixes: [
        { text: "Update YouTube demo component by removing unused DropdownMenuTrigger and marking worker subproject as dirty" },
        { text: "Remove invalid defaults option from PostHog config" },
        { text: "Exclude youtube-transcript-worker from TypeScript check" },
        { scope: "middleware", text: "Add type annotations to Clerk middleware callback" },
        { text: "Update API URLs to use the new endpoint" },
      ],
      refactoring: [
        { scope: "auth", text: "Streamline authentication handling and remove deprecated files" },
      ],
      miscellaneous: [
        { text: "Remove worker subproject and update .gitignore to exclude it" },
        { text: "Add worker subproject to .gitignore" },
        { text: "Remove redundant component copies, add Cursor ignore file, and relocate appstore image." },
        { text: "Remove deprecated files and update .gitignore for better management" },
      ],
    },
  },
}

// Roadmap data
const roadmapData = {
  q1_2025: {
    quarter: "Q1 2025",
    items: [
      {
        title: "Advanced AI Features",
        description: "Enhanced summarization with custom prompts, multiple summary formats, and topic extraction",
        icon: Sparkles,
        status: "planned",
        category: "features",
      },
      {
        title: "Video Playback Integration",
        description: "Embed video player with synchronized transcript highlighting and jump-to-timestamp functionality",
        icon: MessageSquare,
        status: "planned",
        category: "features",
      },
      {
        title: "Export & Sharing",
        description: "Export summaries as PDF, Markdown, or share directly to social media",
        icon: Share2,
        status: "planned",
        category: "features",
      },
      {
        title: "Mobile App",
        description: "Native iOS and Android apps for on-the-go video summarization",
        icon: Download,
        status: "research",
        category: "platform",
      },
    ],
  },
  q2_2025: {
    quarter: "Q2 2025",
    items: [
      {
        title: "Team Collaboration",
        description: "Share summaries with team members, add comments, and collaborate on video analysis",
        icon: Users,
        status: "planned",
        category: "features",
      },
      {
        title: "API Rate Limits & Usage Dashboard",
        description: "Detailed usage analytics, rate limit management, and API key management",
        icon: BarChart3,
        status: "planned",
        category: "features",
      },
      {
        title: "Browser Extension",
        description: "Summarize videos directly from YouTube with a browser extension",
        icon: Globe,
        status: "research",
        category: "platform",
      },
      {
        title: "Webhook Support",
        description: "Receive notifications when summaries are ready via webhooks",
        icon: Bell,
        status: "planned",
        category: "features",
      },
    ],
  },
  future: {
    quarter: "Future",
    items: [
      {
        title: "Multi-language Support",
        description: "Summaries and transcripts in multiple languages with automatic translation",
        icon: Globe,
        status: "research",
        category: "features",
      },
      {
        title: "Batch Processing",
        description: "Process multiple videos at once and get a combined summary",
        icon: Zap,
        status: "research",
        category: "features",
      },
      {
        title: "Custom AI Models",
        description: "Choose from different AI models or bring your own API keys",
        icon: Settings,
        status: "research",
        category: "features",
      },
      {
        title: "Analytics & Insights",
        description: "Track your video consumption patterns and get personalized recommendations",
        icon: TrendingUp,
        status: "research",
        category: "features",
      },
    ],
  },
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "planned":
      return "bg-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:text-blue-400"
    case "in-progress":
      return "bg-yellow-500/10 text-yellow-500 dark:bg-yellow-400/10 dark:text-yellow-400"
    case "research":
      return "bg-purple-500/10 text-purple-500 dark:bg-purple-400/10 dark:text-purple-400"
    default:
      return "bg-gray-500/10 text-gray-500 dark:bg-gray-400/10 dark:text-gray-400"
  }
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "features":
      return Sparkles
    case "platform":
      return Rocket
    default:
      return Code
  }
}

export default function ChangelogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto flex flex-col items-center gap-4 px-4 py-16 text-center sm:gap-6 sm:py-20 md:py-24 lg:py-32">
          <Badge variant="secondary" className="mb-2 sm:mb-4">
            Product Updates
          </Badge>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            What&apos;s New &{" "}
            <span className="bg-linear-to-r from-sky-500 to-sky-300 bg-clip-text text-transparent dark:from-sky-300 dark:to-sky-500">
              What&apos;s Next
            </span>
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
            Track our progress, see what we&apos;ve shipped, and get a glimpse of what&apos;s coming next.
          </p>
        </section>

        {/* Tabs for Changelog and Roadmap */}
        <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24">
          <Tabs defaultValue="changelog" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="changelog">Changelog</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            </TabsList>

            {/* Changelog Tab */}
            <TabsContent value="changelog" className="mt-8 space-y-12">
              {/* Unreleased Version */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-lg px-4 py-1">
                    {changelogData.unreleased.version}
                  </Badge>
                  {changelogData.unreleased.date && (
                    <span className="text-sm text-muted-foreground">
                      {changelogData.unreleased.date}
                    </span>
                  )}
                </div>

                {/* Features */}
                {changelogData.unreleased.sections.features && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-sky-500" />
                        <CardTitle>Features</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {changelogData.unreleased.sections.features.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-sm">
                              {item.scope && (
                                <Badge variant="secondary" className="mr-2 text-xs">
                                  {item.scope}
                                </Badge>
                              )}
                              {item.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Bug Fixes */}
                {changelogData.unreleased.sections.bugFixes && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Bug className="h-5 w-5 text-red-500" />
                        <CardTitle>Bug Fixes</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {changelogData.unreleased.sections.bugFixes.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-sm">
                              {item.scope && (
                                <Badge variant="secondary" className="mr-2 text-xs">
                                  {item.scope}
                                </Badge>
                              )}
                              {item.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Performance */}
                {changelogData.unreleased.sections.performance && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <CardTitle>Performance</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {changelogData.unreleased.sections.performance.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-sm">
                              {item.scope && (
                                <Badge variant="secondary" className="mr-2 text-xs">
                                  {item.scope}
                                </Badge>
                              )}
                              {item.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Miscellaneous */}
                {changelogData.unreleased.sections.miscellaneous && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <CardTitle>Miscellaneous</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {changelogData.unreleased.sections.miscellaneous.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-sm">
                              {item.scope && (
                                <Badge variant="secondary" className="mr-2 text-xs">
                                  {item.scope}
                                </Badge>
                              )}
                              {item.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Version 0.1.0 */}
              <div className="space-y-6 pt-8 border-t">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-lg px-4 py-1">
                    v{changelogData["0.1.0"].version}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {changelogData["0.1.0"].date}
                  </span>
                </div>

                {/* Features */}
                {changelogData["0.1.0"].sections.features && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-sky-500" />
                        <CardTitle>Features</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {changelogData["0.1.0"].sections.features.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-sm">
                              {item.scope && (
                                <Badge variant="secondary" className="mr-2 text-xs">
                                  {item.scope}
                                </Badge>
                              )}
                              {item.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Bug Fixes */}
                {changelogData["0.1.0"].sections.bugFixes && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Bug className="h-5 w-5 text-red-500" />
                        <CardTitle>Bug Fixes</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {changelogData["0.1.0"].sections.bugFixes.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-sm">
                              {item.scope && (
                                <Badge variant="secondary" className="mr-2 text-xs">
                                  {item.scope}
                                </Badge>
                              )}
                              {item.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Refactoring */}
                {changelogData["0.1.0"].sections.refactoring && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-blue-500" />
                        <CardTitle>Refactoring</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {changelogData["0.1.0"].sections.refactoring.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-sm">
                              {item.scope && (
                                <Badge variant="secondary" className="mr-2 text-xs">
                                  {item.scope}
                                </Badge>
                              )}
                              {item.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Miscellaneous */}
                {changelogData["0.1.0"].sections.miscellaneous && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <CardTitle>Miscellaneous</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {changelogData["0.1.0"].sections.miscellaneous.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-sm">{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Roadmap Tab */}
            <TabsContent value="roadmap" className="mt-8 space-y-12">
              {/* Q1 2025 */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-sky-500" />
                  <h2 className="text-2xl font-bold">{roadmapData.q1_2025.quarter}</h2>
                </div>
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  {roadmapData.q1_2025.items.map((item, idx) => {
                    const Icon = item.icon
                    const CategoryIcon = getCategoryIcon(item.category)
                    return (
                      <Card key={idx} className="transition-shadow hover:shadow-lg">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex size-12 items-center justify-center rounded-lg bg-sky-500/10 dark:bg-sky-300/10">
                              <Icon className="size-6 text-sky-500 dark:text-sky-300" />
                            </div>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <div className="mt-4 flex items-center gap-2">
                            <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground capitalize">
                              {item.category}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Q2 2025 */}
              <div className="space-y-6 pt-8 border-t">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-sky-500" />
                  <h2 className="text-2xl font-bold">{roadmapData.q2_2025.quarter}</h2>
                </div>
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  {roadmapData.q2_2025.items.map((item, idx) => {
                    const Icon = item.icon
                    const CategoryIcon = getCategoryIcon(item.category)
                    return (
                      <Card key={idx} className="transition-shadow hover:shadow-lg">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex size-12 items-center justify-center rounded-lg bg-sky-500/10 dark:bg-sky-300/10">
                              <Icon className="size-6 text-sky-500 dark:text-sky-300" />
                            </div>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <div className="mt-4 flex items-center gap-2">
                            <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground capitalize">
                              {item.category}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Future */}
              <div className="space-y-6 pt-8 border-t">
                <div className="flex items-center gap-3">
                  <Rocket className="h-5 w-5 text-purple-500" />
                  <h2 className="text-2xl font-bold">{roadmapData.future.quarter}</h2>
                </div>
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  {roadmapData.future.items.map((item, idx) => {
                    const Icon = item.icon
                    const CategoryIcon = getCategoryIcon(item.category)
                    return (
                      <Card key={idx} className="transition-shadow hover:shadow-lg opacity-75">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex size-12 items-center justify-center rounded-lg bg-purple-500/10 dark:bg-purple-300/10">
                              <Icon className="size-6 text-purple-500 dark:text-purple-300" />
                            </div>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <div className="mt-4 flex items-center gap-2">
                            <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground capitalize">
                              {item.category}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <Footer />
    </div>
  )
}
