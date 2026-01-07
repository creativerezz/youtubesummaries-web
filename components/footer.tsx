import Link from "next/link"
import { Github, Linkedin, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:px-6 sm:py-8 md:flex-row">
        <p className="text-xs text-muted-foreground sm:text-sm">
          © 2025 YouTubeSummaries.cc - All rights reserved | <Link href="/privacy-policy" className="transition-colors hover:text-foreground">Privacy Policy</Link> | <Link href="/terms-of-service" className="transition-colors hover:text-foreground">Terms of Service</Link>
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground sm:gap-6 sm:text-sm">
          <Link
            href="/about"
            className="transition-colors hover:text-foreground"
          >
            About
          </Link>
          <Link
            href="/features"
            className="transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="/contact"
            className="transition-colors hover:text-foreground"
          >
            Contact
          </Link>
          <a
            href="https://twitter.com/intent/tweet?text=Check%20out%20YouTube%20Summaries%20-%20Get%20free%20transcripts%20and%20AI%20summaries%20from%20any%20YouTube%20video!&url=https://youtubesummaries.cc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Twitter className="h-3 w-3" />
            Share
          </a>
          <a
            href="https://github.com/creativerezz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Github className="h-3 w-3" />
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/rezajafar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Linkedin className="h-3 w-3" />
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  )
}

