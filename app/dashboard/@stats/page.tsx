import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Zap,
  TrendingUp,
  CreditCard,
  ArrowRight,
} from "lucide-react";

interface Profile {
  subscription_tier: string;
  subscription_status: string;
  credits_remaining: number;
}

export default async function StatsSlot() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Default values when Supabase is not configured
  let userProfile: Profile = {
    subscription_tier: "free",
    subscription_status: "inactive",
    credits_remaining: 10,
  };
  let count = 0;

  try {
    const supabase = getSupabaseClient();

    // Fetch user profile and usage count in parallel
    const [{ data: profile }, { count: usageCount }] = await Promise.all([
      supabase
        .from("profiles")
        .select("subscription_tier, subscription_status, credits_remaining")
        .eq("clerk_user_id", userId)
        .single(),
      supabase
        .from("usage_logs")
        .select("*", { count: "exact", head: true })
        .eq("clerk_user_id", userId),
    ]);

    // Use fetched data if available
    if (profile) {
      userProfile = profile;
    }
    count = usageCount ?? 0;
  } catch (error) {
    // Supabase not configured or error fetching data - use defaults
    console.warn("Supabase not configured or error fetching stats:", error);
  }

  const creditsTotal = userProfile.subscription_tier === "pro" ? 100 : 10;
  const creditsUsed = creditsTotal - userProfile.credits_remaining;
  const usagePercent = Math.min((creditsUsed / creditsTotal) * 100, 100);

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Credits Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Credits Remaining
          </CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {userProfile.credits_remaining}
          </div>
          <Progress value={100 - usagePercent} className="mt-3 h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {creditsUsed} of {creditsTotal} credits used this period
          </p>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Subscription
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold capitalize">
              {userProfile.subscription_tier}
            </span>
            <Badge
              variant={
                userProfile.subscription_status === "active"
                  ? "default"
                  : "secondary"
              }
            >
              {userProfile.subscription_status}
            </Badge>
          </div>
          <div className="mt-3">
            {userProfile.subscription_tier === "free" ? (
              <Button asChild size="sm">
                <Link href={`/api/checkout?products=${process.env.POLAR_PRODUCT_ID || ""}`}>
                  Upgrade to Pro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/api/portal">Manage Subscription</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Total Summaries
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{count ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-2">
            All time video summaries generated
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
