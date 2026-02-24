export type TranscriptSegment = {
  startMs: number;
  endMs?: number | null;
  text: string;
};

export type DirectTranscriptResult = {
  captions: string;
  timestamps: Array<{ text: string; start: number; duration: number }>;
  metadata?: {
    title?: string;
    author_name?: string;
    author_url?: string;
    thumbnail_url?: string;
  };
  source: "youtubei" | "captionTracks";
};
