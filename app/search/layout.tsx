import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search YouTube Videos - YouTube Summaries',
  description: 'Search for YouTube videos and get AI-powered summaries and transcripts instantly.',
  alternates: {
    canonical: '/search',
  },
  openGraph: {
    title: 'Search YouTube Videos - YouTube Summaries',
    description: 'Search for YouTube videos and get AI-powered summaries and transcripts instantly.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search YouTube Videos - YouTube Summaries',
    description: 'Search for YouTube videos and get AI-powered summaries and transcripts instantly.',
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
