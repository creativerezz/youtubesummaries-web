import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  rateLimiters,
  checkRateLimit,
  getIdentifier,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { z } from "zod";

const betaSignupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  source: z.string().optional().default("website"),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP (5 per hour)
    const identifier = getIdentifier(request, null);
    const rateLimit = await checkRateLimit(rateLimiters.betaSignup, identifier);

    if (!rateLimit.success) {
      return rateLimitResponse(
        rateLimit,
        "Too many signup attempts. Please try again later."
      );
    }

    const body = await request.json();
    const parsed = betaSignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Use service role for inserts (bypasses RLS)
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("beta_signups").insert({
      email: parsed.data.email.toLowerCase().trim(),
      source: parsed.data.source,
    });

    if (error) {
      // Handle unique constraint violation (already signed up)
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "You're already on the list! We'll be in touch soon." },
          { status: 200 }
        );
      }
      console.error("Beta signup error:", error);
      throw error;
    }

    return NextResponse.json(
      { message: "Successfully joined the beta waitlist!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Beta signup error:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist. Please try again." },
      { status: 500 }
    );
  }
}
