import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Successful - YouTube Summaries",
  description: "Thank you for subscribing to YouTube Summaries Pro",
};

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { checkout_id?: string; checkoutId?: string; customer_session_token?: string };
}) {
  // Handle both checkout_id and checkoutId (Polar sends both)
  const checkoutId = searchParams.checkout_id || searchParams.checkoutId;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for subscribing to YouTube Summaries Pro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checkoutId && (
            <p className="text-center text-sm text-muted-foreground">
              Checkout ID: {checkoutId}
            </p>
          )}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your subscription is now active. You now have access to:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>100 credits per month</li>
              <li>Unlimited video summaries</li>
              <li>Priority support</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2 pt-4">
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
