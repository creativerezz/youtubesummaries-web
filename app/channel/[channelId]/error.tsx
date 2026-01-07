'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Youtube } from 'lucide-react';

export default function ChannelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Channel page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <Youtube className="mx-auto mb-4 h-16 w-16 text-destructive" />
        <h2 className="mb-4 text-2xl font-bold">Failed to Load Channel</h2>
        <p className="mb-6 text-muted-foreground">
          We couldn&apos;t load this channel. It might not exist or there may be a temporary issue.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-left">
            <p className="font-mono text-sm text-destructive">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Button asChild variant="outline">
            <Link href="/search">Search Channels</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
