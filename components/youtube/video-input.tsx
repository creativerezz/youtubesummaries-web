'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface VideoInputProps {
  onVideoSubmit: (videoId: string) => void;
}

export function VideoInput({ onVideoSubmit }: VideoInputProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const extractVideoId = (urlOrId: string): string | null => {
    const trimmed = urlOrId.trim();

    // If it's already an ID (11 characters)
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    // Extract from URL
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const videoId = extractVideoId(input);
    if (!videoId) {
      setError('Invalid YouTube URL or video ID');
      return;
    }

    onVideoSubmit(videoId);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="video-input" className="text-sm font-medium text-foreground">
            YouTube URL or Video ID
          </label>
          <div className="flex gap-2">
            <Input
              id="video-input"
              type="text"
              placeholder="dQw4w9WgXcQ or https://youtu.be/dQw4w9WgXcQ"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="lg">
              Extract
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}
