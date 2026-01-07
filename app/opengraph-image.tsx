import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'YouTube Summaries - AI-Powered Video Summaries';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #333 2%, transparent 0%), radial-gradient(circle at 75px 75px, #333 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            YouTube Summaries
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#9ca3af',
              textAlign: 'center',
              maxWidth: 800,
            }}
          >
            Get AI-powered summaries and transcripts from any YouTube video
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
