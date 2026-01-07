import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { APIReferenceContent } from "@/app/api-reference/api-reference-content"

export const metadata: Metadata = {
  title: "API Reference - YouTube Summaries",
  description: "Complete API documentation for the YouTube Summaries API. Learn how to integrate transcript and summary extraction into your applications.",
}

export default function APIReferencePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <APIReferenceContent />
      <Footer />
    </div>
  )
}
