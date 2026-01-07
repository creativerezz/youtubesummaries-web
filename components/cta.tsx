"use client";

import { useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BetaSignup } from "@/components/beta-signup";
import { Sparkles, Zap, Play, Search } from "lucide-react";
import Link from "next/link";

export function CTA() {
  const scrollToDemo = useCallback(() => {
    const demoElement = document.getElementById("demo");
    if (demoElement) {
      const header = document.querySelector("header");
      const headerHeight = header ? header.offsetHeight : 0;
      const elementPosition = demoElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  }, []);

  return (
    <section className="container mx-auto px-4 py-16 sm:py-20 md:py-24 lg:py-32">
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 shadow-lg">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <CardHeader className="text-center relative z-10 pb-4">
          <div className="inline-flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <Zap className="h-3.5 w-3.5" />
              <span>Early Access</span>
            </Badge>
          </div>
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            Join the Beta
          </CardTitle>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Get exclusive early access to Pro features and help shape the future of YouTube summarization
          </p>
        </CardHeader>
        
        <CardContent className="relative z-10 pt-2 pb-8 space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              onClick={scrollToDemo}
              size="lg"
              className="group w-full sm:w-auto px-8"
            >
              <Play className="mr-2 h-4 w-4" />
              Start My Free Trial
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8"
            >
              <Link href="/search">
                <Search className="mr-2 h-4 w-4" />
                Find My Videos
              </Link>
            </Button>
          </div>

          {/* Beta Signup */}
          <div className="max-w-lg mx-auto pt-4 border-t border-border/50">
            <BetaSignup source="homepage-cta" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
