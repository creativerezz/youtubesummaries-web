import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { OptionalClerkProvider } from "@/components/clerk/optional-clerk-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { PHProvider } from "@/components/posthog-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://youtubesummaries.cc'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'YouTube Summaries',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
  title: {
    default: "YouTube Summaries - Get Transcripts & Summaries from YouTube Videos",
    template: "%s | YouTube Summaries",
  },
  description: "Extract transcripts and AI-powered summaries from any YouTube video. Fast, accurate, and easy to use. Perfect for research, learning, and content creation.",
  keywords: ["YouTube transcript", "YouTube summary", "video transcript", "YouTube captions", "video summary", "AI summary", "YouTube analyzer"],
  authors: [{ name: "YouTube Summaries" }],
  creator: "YouTube Summaries",
  publisher: "YouTube Summaries",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "YouTube Summaries",
    title: "YouTube Summaries - Get Transcripts & Summaries from YouTube Videos",
    description: "Extract transcripts and AI-powered summaries from any YouTube video. Fast, accurate, and easy to use.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "YouTube Summaries - Summarize any YouTube Video instantly",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Summaries - Get Transcripts & Summaries from YouTube Videos",
    description: "Extract transcripts and AI-powered summaries from any YouTube video. Fast, accurate, and easy to use.",
    images: ["/og-image.png"],
    creator: "@youtubesummaries",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-9B0RZBZ2FM"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-9B0RZBZ2FM');
        `}
      </Script>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ServiceWorkerRegistration />
        <OptionalClerkProvider>
          <PHProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Analytics />
              <SpeedInsights />
              <Toaster />
            </ThemeProvider>
          </PHProvider>
        </OptionalClerkProvider>
      </body>
    </html>
  );
}
