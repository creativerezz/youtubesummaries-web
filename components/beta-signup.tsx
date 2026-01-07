"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, CheckCircle, Sparkles } from "lucide-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type FormData = z.infer<typeof schema>;

interface BetaSignupProps {
  source?: string;
  className?: string;
}

export function BetaSignup({ source = "website", className }: BetaSignupProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    // Cast to handle Zod v4 compatibility with @hookform/resolvers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/beta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source }),
      });

      const result = await response.json();

      if (!response.ok && response.status !== 200) {
        throw new Error(result.error || "Something went wrong");
      }

      setIsSuccess(true);
      toast.success(result.message);
      reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  if (isSuccess) {
    return (
      <div
        className={`flex items-center gap-2 text-green-600 dark:text-green-400 ${className}`}
      >
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm font-medium">
          You&apos;re on the list! We&apos;ll be in touch.
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`flex flex-col sm:flex-row gap-2 ${className}`}
    >
      <div className="flex-1 min-w-0">
        <Input
          type="email"
          placeholder="Enter your email for beta access"
          {...register("email")}
          className="h-10"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-10 whitespace-nowrap"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Join Beta
          </>
        )}
      </Button>
    </form>
  );
}
