import type { Metadata } from 'next';

// Note: For dynamic metadata based on channel ID, this page would need to be
// converted to a server component. For now, using static metadata.
export const metadata: Metadata = {
  title: 'YouTube Channel - YouTube Summaries',
  description: 'View channel information, recent uploads, and get AI-powered video summaries.',
  openGraph: {
    title: 'YouTube Channel - YouTube Summaries',
    description: 'View channel information and recent uploads with AI summaries.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function ChannelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
