import { CustomerPortal } from "@polar-sh/nextjs";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase";

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: "sandbox", // Change to 'production' for live
  getCustomerId: async (): Promise<string> => {
    // Get authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Look up Polar customer ID from database
    const supabase = getSupabaseClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("polar_customer_id")
      .eq("clerk_user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      throw new Error("Failed to fetch profile");
    }

    if (!profile?.polar_customer_id) {
      throw new Error("No subscription found. Please subscribe first.");
    }

    return profile.polar_customer_id;
  },
});
