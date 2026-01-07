'use client';

import useSWR from 'swr';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VideoMetadataProps {
  videoId: string;
}

interface Metadata {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_url: string;
  provider_name: string;
  type: string;
}

const fetcher = async (url: string): Promise<Metadata> => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch metadata');
  }
  return response.json();
};

export function VideoMetadata({ videoId }: VideoMetadataProps) {
  const { data, error, isLoading } = useSWR(
    `/api/v1/transcript?video=${encodeURIComponent(videoId)}&format=metadata`,
    fetcher
  );

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 p-6 md:flex-row">
          <Skeleton className="h-32 w-full md:w-48" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-6 p-6 md:flex-row">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted md:w-64">
          <img
            src={data.thumbnail_url || "/placeholder.svg"}
            alt={data.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1 space-y-3">
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground">
            {data.title}
          </h2>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Author:</span>{' '}
              <a
                href={data.author_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {data.author_name}
              </a>
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Provider:</span>{' '}
              {data.provider_name}
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Type:</span> {data.type}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
