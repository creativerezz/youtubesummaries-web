import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { isAuthenticated: false, isPro: false, subscription_tier: "free" },
        { status: 200 }
      );
    }

    try {
      const supabase = getSupabaseClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier, subscription_status")
        .eq("clerk_user_id", userId)
        .single();

      const isPro =
        profile?.subscription_tier === "pro" &&
        profile?.subscription_status === "active";

      return NextResponse.json({
        isAuthenticated: true,
        isPro,
        subscription_tier: profile?.subscription_tier || "free",
        subscription_status: profile?.subscription_status || "inactive",
      });
    } catch (error) {
      // Supabase not configured or error - default to free but user is still authenticated
      console.warn("Error fetching subscription:", error);
      return NextResponse.json(
        { isAuthenticated: true, isPro: false, subscription_tier: "free" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json(
      { isAuthenticated: false, isPro: false, subscription_tier: "free" },
      { status: 200 }
    );
  }
}

