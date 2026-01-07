import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy - YouTube Summaries",
  description: "Privacy Policy for YouTube Summaries - Learn how we handle your data and protect your privacy.",
}

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/" className="text-primary hover:underline">
          ← Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you use our YouTube transcript and summary service.
          This may include YouTube URLs and any other information you choose to provide.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          We use the information we collect to provide, maintain, and improve our services, including:
        </p>
        <ul>
          <li>Processing YouTube video transcripts and summaries</li>
          <li>Analytics and usage tracking (via PostHog)</li>
          <li>Improving our service quality</li>
        </ul>

        <h2>3. Data Sharing and Disclosure</h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal information to third parties without your consent,
          except as described in this policy. We may share your information in the following circumstances:
        </p>
        <ul>
          <li>With service providers who assist us in operating our website</li>
          <li>When required by law or to protect our rights</li>
          <li>In connection with a business transfer</li>
        </ul>

        <h2>4. Data Retention</h2>
        <p>
          We retain your information for as long as necessary to provide our services and fulfill the purposes outlined
          in this privacy policy, unless a longer retention period is required by law.
        </p>

        <h2>5. Cookies and Analytics</h2>
        <p>
          We use PostHog for analytics and tracking. PostHog may use cookies and similar technologies to collect
          information about your use of our service. You can learn more about PostHog&apos;s privacy practices at
          <a href="https://posthog.com/privacy" className="text-primary hover:underline"> https://posthog.com/privacy</a>.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          Depending on your location, you may have certain rights regarding your personal information, including:
        </p>
        <ul>
          <li>The right to access your personal information</li>
          <li>The right to rectify inaccurate information</li>
          <li>The right to erase your personal information</li>
          <li>The right to restrict or object to processing</li>
        </ul>

        <h2>7. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal information against
          unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new
          privacy policy on this page and updating the &quot;Last updated&quot; date.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have any questions about this privacy policy, please contact us through our
          <Link href="/contact" className="text-primary hover:underline"> contact page</Link>.
        </p>
      </div>
    </div>
  )
}