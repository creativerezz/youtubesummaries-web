import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  LiveCounter,
  UserBadge,
  AccuracyBadge,
  TrustIndicators,
} from "@/components/trust-signals"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function TrustSignalsDemoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Trust Signals Components</h1>
          <p className="text-lg text-muted-foreground">
            A showcase of all trust signal components for improving conversion
          </p>
        </div>

        <div className="grid gap-8">
          {/* Live Counter */}
          <Card>
            <CardHeader>
              <CardTitle>Live Activity Counter</CardTitle>
              <CardDescription>
                Shows real-time activity with animated counting and pulse effect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <LiveCounter />
              </div>
              <div className="flex justify-center">
                <LiveCounter initialCount={5678} />
              </div>
            </CardContent>
          </Card>

          {/* User Badge */}
          <Card>
            <CardHeader>
              <CardTitle>User Count Badge</CardTitle>
              <CardDescription>
                Displays total user count in a compact badge format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <UserBadge />
                <UserBadge userCount={25000} />
                <UserBadge userCount={500} />
              </div>
            </CardContent>
          </Card>

          {/* Accuracy Badge */}
          <Card>
            <CardHeader>
              <CardTitle>Accuracy Badge</CardTitle>
              <CardDescription>
                Highlights transcript accuracy to counter AI concerns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccuracyBadge />
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Trust Indicators</CardTitle>
              <CardDescription>
                Combined component with multiple trust signals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-3">Horizontal Layout:</p>
                <TrustIndicators />
              </div>
              <div>
                <p className="text-sm font-medium mb-3">Vertical Layout:</p>
                <TrustIndicators vertical />
              </div>
            </CardContent>
          </Card>

          {/* Usage Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Examples</CardTitle>
              <CardDescription>
                How to integrate these components in your pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="font-medium">Homepage Integration:</p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import { LiveCounter } from "@/components/trust-signals"

<section className="container mx-auto px-4 py-8 flex justify-center">
  <LiveCounter />
</section>`}
                </pre>
              </div>
              <div className="space-y-2">
                <p className="font-medium">Pricing Page:</p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import { UserBadge, TrustIndicators } from "@/components/trust-signals"

<div className="space-y-4">
  <UserBadge />
  <TrustIndicators />
</div>`}
                </pre>
              </div>
              <div className="space-y-2">
                <p className="font-medium">Features Page:</p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import { AccuracyBadge } from "@/components/trust-signals"

<AccuracyBadge />`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
