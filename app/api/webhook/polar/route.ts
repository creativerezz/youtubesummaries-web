import { Webhooks } from "@polar-sh/nextjs";
import { getSupabaseAdmin } from "@/lib/supabase";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET || "",

  onPayload: async (payload) => {
    // Log all webhook events for debugging
    console.log("Received Polar webhook:", payload.type);
  },

  onOrderCreated: async (payload) => {
    const order = payload.data;
    console.log("Order created:", order.id);

    const customerEmail = order.customer?.email;
    if (!customerEmail) {
      console.error("No customer email in order");
      return;
    }

    try {
      const supabase = getSupabaseAdmin();

      // Find user by email and update their profile
      const { data: profile, error: findError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", customerEmail)
        .single();

      if (findError || !profile) {
        console.log("User not found for email:", customerEmail);
        return;
      }

      // Update profile with Polar customer ID and subscription info
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          polar_customer_id: order.customerId,
          subscription_tier: "pro",
          subscription_status: "active",
          credits_remaining: 100, // Pro tier credits
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) {
        console.error("Failed to update profile:", updateError);
      } else {
        console.log("Updated profile for user:", profile.id);
      }
    } catch (error) {
      console.error("Error processing order:", error);
    }
  },

  onSubscriptionCreated: async (payload) => {
    const subscription = payload.data;
    console.log("Subscription created:", subscription.id);

    const customerEmail = subscription.customer?.email;
    if (!customerEmail) {
      console.error("No customer email in subscription");
      return;
    }

    try {
      const supabase = getSupabaseAdmin();

      // Find user by email
      const { data: profile, error: findError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", customerEmail)
        .single();

      if (findError || !profile) {
        console.log("User not found for subscription:", customerEmail);
        return;
      }

      // Create subscription record
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: profile.id,
          polar_subscription_id: subscription.id,
          polar_product_id: subscription.productId,
          status: subscription.status,
          current_period_start: subscription.currentPeriodStart,
          current_period_end: subscription.currentPeriodEnd,
        });

      if (insertError) {
        console.error("Failed to create subscription record:", insertError);
      }

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          polar_customer_id: subscription.customerId,
          subscription_tier: "pro",
          subscription_status: subscription.status,
          credits_remaining: 100,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) {
        console.error("Failed to update profile for subscription:", updateError);
      }
    } catch (error) {
      console.error("Error processing subscription creation:", error);
    }
  },

  onSubscriptionUpdated: async (payload) => {
    const subscription = payload.data;
    console.log("Subscription updated:", subscription.id);

    try {
      const supabase = getSupabaseAdmin();

      // Update subscription record
      const { data: subRecord, error: updateSubError } = await supabase
        .from("subscriptions")
        .update({
          status: subscription.status,
          current_period_end: subscription.currentPeriodEnd,
          cancel_at_period_end: subscription.cancelAtPeriodEnd,
          updated_at: new Date().toISOString(),
        })
        .eq("polar_subscription_id", subscription.id)
        .select("user_id")
        .single();

      if (updateSubError) {
        console.error("Failed to update subscription:", updateSubError);
        return;
      }

      if (subRecord?.user_id) {
        // Update profile subscription status
        const newStatus = subscription.status;
        const newTier =
          newStatus === "active" || newStatus === "trialing" ? "pro" : "free";
        const newCredits = newTier === "pro" ? 100 : 10;

        await supabase
          .from("profiles")
          .update({
            subscription_status: newStatus,
            subscription_tier: newTier,
            credits_remaining: newCredits,
            updated_at: new Date().toISOString(),
          })
          .eq("id", subRecord.user_id);
      }
    } catch (error) {
      console.error("Error processing subscription update:", error);
    }
  },

  onSubscriptionCanceled: async (payload) => {
    const subscription = payload.data;
    console.log("Subscription canceled:", subscription.id);

    try {
      const supabase = getSupabaseAdmin();

      // Find subscription record
      const { data: subRecord } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("polar_subscription_id", subscription.id)
        .single();

      if (subRecord?.user_id) {
        // Update profile to free tier
        await supabase
          .from("profiles")
          .update({
            subscription_status: "cancelled",
            subscription_tier: "free",
            credits_remaining: 10,
            updated_at: new Date().toISOString(),
          })
          .eq("id", subRecord.user_id);
      }

      // Update subscription record
      await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("polar_subscription_id", subscription.id);
    } catch (error) {
      console.error("Error processing subscription cancellation:", error);
    }
  },

  onCustomerStateChanged: async (payload) => {
    console.log("Customer state changed:", payload.data);
    // Handle customer state changes if needed
  },
});
