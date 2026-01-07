import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Clock,
  Video,
  ArrowRight,
} from "lucide-react";

interface UsageLog {
  id: string;
  endpoint: string;
  video_id: string | null;
  created_at: string;
}

export default async function ActivitySlot() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  let recentUsage: UsageLog[] | null = null;

  try {
    const supabase = getSupabaseClient();

    // Fetch recent usage
    const { data } = await supabase
      .from("usage_logs")
      .select("id, endpoint, video_id, created_at")
      .eq("clerk_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    
    recentUsage = data;
  } catch (error) {
    // Supabase not configured or error fetching data - show empty state
    console.warn("Supabase not configured or error fetching activity:", error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your latest video summaries</CardDescription>
      </CardHeader>
      <CardContent>
        {recentUsage && recentUsage.length > 0 ? (
          <div className="space-y-4">
            {recentUsage.map((usage: UsageLog) => (
              <div
                key={usage.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {usage.endpoint === "/api/summarize" || usage.endpoint === "/api/v1/summarize"
                        ? "Video Summary"
                        : usage.endpoint === "/api/chat" || usage.endpoint === "/api/v1/chat"
                        ? "Chat Q&A"
                        : "API Request"}
                    </p>
                    {usage.video_id && (
                      <p className="text-xs text-muted-foreground">
                        Video: {usage.video_id}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(usage.created_at).toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Video className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground mt-4">
              No activity yet. Start by summarizing a video!
            </p>
            <Button asChild className="mt-4">
              <Link href="/">
                Summarize a Video
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
