'use client';

import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Play, Clock, User } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

interface VideoGridProps {
  videos: Video[];
  onVideoSelect: (videoId: string) => void;
}

export function VideoGrid({ videos, onVideoSelect }: VideoGridProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <Card
          key={video.id}
          className="group cursor-pointer overflow-hidden border-0 bg-card shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]"
          onClick={() => onVideoSelect(video.id)}
        >
          <div className="relative aspect-video overflow-hidden bg-muted">
            <Image
              src={video.thumbnail || "/placeholder.svg"}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <div className="rounded-full bg-primary/90 p-4 shadow-lg backdrop-blur-sm">
                <Play className="h-6 w-6 text-primary-foreground" fill="currentColor" />
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <h3 className="line-clamp-2 font-semibold leading-tight text-sm group-hover:text-primary transition-colors">
              {video.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span className="truncate max-w-[120px]">{video.channelTitle}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDate(video.publishedAt)}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
