'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Copy, Check, ChevronRight, Terminal, Zap, Server, Code2, BookOpen, ExternalLink } from 'lucide-react'

// Navigation sections
const navSections = [
  { id: 'quick-start', label: 'Quick Start', icon: Zap },
  { id: 'authentication', label: 'Authentication', icon: BookOpen },
  { id: 'cors', label: 'CORS', icon: Server },
  { id: 'endpoints', label: 'Endpoints', icon: Terminal },
  { id: 'errors', label: 'Error Handling', icon: Code2 },
  { id: 'examples', label: 'Code Examples', icon: Code2 },
  { id: 'types', label: 'TypeScript Types', icon: Code2 },
]

const endpoints = [
  {
    method: 'GET',
    path: '/youtube/metadata',
    title: 'Get Video Metadata',
    description: 'Retrieve video information including title, author, thumbnail, and more.',
    params: [
      { name: 'video', required: true, description: 'YouTube video URL or ID' }
    ],
    response: `{
  "title": "Rick Astley - Never Gonna Give You Up",
  "author_name": "Rick Astley",
  "author_url": "https://www.youtube.com/@RickAstleyYT",
  "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
}`,
    example: `const response = await fetch(
  'https://api1.youtubesummaries.cc/youtube/metadata?video=dQw4w9WgXcQ'
);
const data = await response.json();`
  },
  {
    method: 'GET',
    path: '/youtube/captions',
    title: 'Get Video Captions',
    description: 'Get plain-text captions/transcripts for a video.',
    params: [
      { name: 'video', required: true, description: 'YouTube video URL or ID' },
      { name: 'languages', required: false, description: 'Array of language codes (default: ["en"])' }
    ],
    response: `"[♪♪♪] ♪ We're no strangers to love ♪
♪ You know the rules and so do I ♪..."`,
    example: `const response = await fetch(
  'https://api1.youtubesummaries.cc/youtube/captions?video=dQw4w9WgXcQ&languages=en'
);
const captions = await response.text(); // Note: returns plain text`
  },
  {
    method: 'GET',
    path: '/youtube/timestamps',
    title: 'Get Video Timestamps',
    description: 'Get captions with formatted timestamps.',
    params: [
      { name: 'video', required: true, description: 'YouTube video URL or ID' },
      { name: 'languages', required: false, description: 'Array of language codes (default: ["en"])' }
    ],
    response: `[
  "0:01 - [♪♪♪]",
  "0:18 - ♪ We're no strangers to love ♪",
  "0:22 - ♪ You know the rules and so do I ♪"
]`,
    example: `const response = await fetch(
  'https://api1.youtubesummaries.cc/youtube/timestamps?video=dQw4w9WgXcQ'
);
const timestamps = await response.json();`
  },
  {
    method: 'GET',
    path: '/youtube/cache/stats',
    title: 'Cache Statistics',
    description: 'Get current cache statistics and configuration.',
    params: [],
    response: `{
  "enabled": true,
  "size": 42,
  "max_size": 1000,
  "ttl_seconds": 3600
}`,
    example: `const response = await fetch(
  'https://api1.youtubesummaries.cc/youtube/cache/stats'
);
const stats = await response.json();`
  },
  {
    method: 'DELETE',
    path: '/youtube/cache/clear',
    title: 'Clear Cache',
    description: 'Clear all cached transcripts.',
    params: [],
    response: `{
  "message": "Cache cleared successfully",
  "size": 0
}`,
    example: `const response = await fetch(
  'https://api1.youtubesummaries.cc/youtube/cache/clear',
  { method: 'DELETE' }
);`
  },
  {
    method: 'GET',
    path: '/service/status',
    title: 'Service Status',
    description: 'Get comprehensive service status and configuration.',
    params: [],
    response: `{
  "status": "operational",
  "version": "1.1.0",
  "features": {
    "proxy_enabled": true,
    "cache_enabled": true
  }
}`,
    example: `const response = await fetch(
  'https://api1.youtubesummaries.cc/service/status'
);`
  },
  {
    method: 'GET',
    path: '/health',
    title: 'Health Check',
    description: 'Simple health check endpoint.',
    params: [],
    response: `{ "status": "healthy" }`,
    example: `const response = await fetch(
  'https://api1.youtubesummaries.cc/health'
);`
  },
]

function CodeBlock({ code, language = 'javascript', showLineNumbers = false }: {
  code: string
  language?: string
  showLineNumbers?: boolean
}) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.split('\n')

  return (
    <div className="group relative">
      <div className="absolute right-3 top-3 z-10">
        <button
          onClick={copyToClipboard}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all",
            "bg-white/5 hover:bg-white/10 border border-white/10",
            "opacity-0 group-hover:opacity-100",
            copied && "text-emerald-400"
          )}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/8 bg-[#0d1117]">
        <div className="flex items-center gap-2 border-b border-white/6 px-4 py-2 bg-white/2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="ml-2 text-xs text-white/40 font-mono">{language}</span>
        </div>
        <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
          <code className="font-mono text-[13px]">
            {lines.map((line, i) => (
              <div key={i} className="flex">
                {showLineNumbers && (
                  <span className="mr-4 select-none text-white/20 w-6 text-right">{i + 1}</span>
                )}
                <span className="text-[#e6edf3]">{line || ' '}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}

// Removed unused highlightSyntax function - using plain text for simplicity

function MethodBadge({ method }: { method: string }) {
  const colors = {
    GET: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    POST: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    PUT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    PATCH: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border",
      colors[method as keyof typeof colors] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    )}>
      {method}
    </span>
  )
}

function EndpointCard({ endpoint, index }: { endpoint: typeof endpoints[0], index: number }) {
  const [isExpanded, setIsExpanded] = useState(index === 0)

  return (
    <div
      className={cn(
        "group rounded-2xl border transition-all duration-300",
        "bg-linear-to-b from-card/80 to-card",
        isExpanded
          ? "border-primary/20 shadow-lg shadow-primary/5"
          : "border-border/50 hover:border-border"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center gap-4 text-left"
      >
        <MethodBadge method={endpoint.method} />
        <code className="font-mono text-sm text-foreground/80 flex-1">{endpoint.path}</code>
        <span className="text-sm text-muted-foreground hidden sm:block">{endpoint.title}</span>
        <ChevronRight className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isExpanded && "rotate-90"
        )} />
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-muted-foreground text-sm">{endpoint.description}</p>

          {endpoint.params.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Parameters</h4>
              <div className="space-y-2">
                {endpoint.params.map((param) => (
                  <div key={param.name} className="flex items-start gap-3 text-sm">
                    <code className="font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">
                      {param.name}
                    </code>
                    {param.required && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-400/10 px-1.5 py-0.5 rounded">
                        required
                      </span>
                    )}
                    <span className="text-muted-foreground">{param.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Example Request</h4>
              <CodeBlock code={endpoint.example} language="javascript" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Response</h4>
              <CodeBlock code={endpoint.response} language="json" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function APIReferenceContent() {
  const [activeSection, setActiveSection] = useState('quick-start')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -60% 0px' }
    )

    navSections.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-linear-to-br from-primary/3 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/3 blur-[120px] rounded-full" />

        <div className="container relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <Terminal className="h-6 w-6 text-primary" />
            </div>
            <div className="h-px flex-1 bg-linear-to-r from-border to-transparent max-w-[200px]" />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
            API Reference
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-8">
            Integrate YouTube transcript extraction and AI-powered summarization into your applications.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://api1.youtubesummaries.cc/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Interactive Docs
            </a>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-sm font-mono">
              <span className="text-muted-foreground">Base URL:</span>
              <code className="text-foreground">https://api1.youtubesummaries.cc</code>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-3">
                On this page
              </p>
              {navSections.map(({ id, label, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                    activeSection === id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="space-y-16">
            {/* Quick Start */}
            <section id="quick-start" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Zap className="h-6 w-6 text-amber-500" />
                Quick Start
              </h2>
              <div className="space-y-4">
                <CodeBlock
                  code={`const API_BASE_URL = 'https://api1.youtubesummaries.cc';

// Fetch video metadata
const response = await fetch(
  \`\${API_BASE_URL}/youtube/metadata?video=dQw4w9WgXcQ\`
);
const data = await response.json();

console.log(data.title);     // "Rick Astley - Never Gonna Give You Up..."
console.log(data.author_name); // "Rick Astley"`}
                  language="javascript"
                  showLineNumbers
                />
              </div>
            </section>

            {/* Authentication */}
            <section id="authentication" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-emerald-500" />
                Authentication
              </h2>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                    <Check className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-500 mb-1">No Authentication Required</h3>
                    <p className="text-muted-foreground text-sm">
                      All API endpoints are publicly accessible. No API keys or authentication tokens needed.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CORS */}
            <section id="cors" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Server className="h-6 w-6 text-blue-500" />
                CORS Configuration
              </h2>
              <p className="text-muted-foreground mb-4">
                The API supports CORS and accepts requests from all origins. The following headers are included in all responses:
              </p>
              <CodeBlock
                code={`Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: *
Access-Control-Allow-Headers: *
Access-Control-Allow-Credentials: true`}
                language="http"
              />
            </section>

            {/* Endpoints */}
            <section id="endpoints" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Terminal className="h-6 w-6 text-purple-500" />
                API Endpoints
              </h2>
              <div className="space-y-4">
                {endpoints.map((endpoint, i) => (
                  <EndpointCard key={endpoint.path} endpoint={endpoint} index={i} />
                ))}
              </div>
            </section>

            {/* Error Handling */}
            <section id="errors" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Code2 className="h-6 w-6 text-rose-500" />
                Error Handling
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Error Response Format</h3>
                  <CodeBlock
                    code={`{
  "detail": "Error message here"
}`}
                    language="json"
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-3">HTTP Status Codes</h3>
                  <div className="grid gap-2">
                    {[
                      { code: '200', status: 'OK', desc: 'Success', color: 'emerald' },
                      { code: '400', status: 'Bad Request', desc: 'Invalid request parameters', color: 'amber' },
                      { code: '500', status: 'Internal Server Error', desc: 'Server error', color: 'rose' },
                    ].map(({ code, status, desc, color }) => (
                      <div key={code} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <span className={cn(
                          "font-mono font-bold text-sm",
                          color === 'emerald' && "text-emerald-500",
                          color === 'amber' && "text-amber-500",
                          color === 'rose' && "text-rose-500"
                        )}>
                          {code}
                        </span>
                        <span className="font-medium">{status}</span>
                        <span className="text-muted-foreground text-sm">— {desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Error Handling Example</h3>
                  <CodeBlock
                    code={`async function safeApiCall(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || \`HTTP \${response.status}\`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
}`}
                    language="javascript"
                    showLineNumbers
                  />
                </div>
              </div>
            </section>

            {/* Code Examples */}
            <section id="examples" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Code2 className="h-6 w-6 text-cyan-500" />
                Code Examples
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="text-cyan-500">React Hook</span>
                  </h3>
                  <CodeBlock
                    code={`import { useState, useEffect } from 'react';

function useYouTubeMetadata(videoId) {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!videoId) return;

    const fetchMetadata = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          \`https://api1.youtubesummaries.cc/youtube/metadata?video=\${encodeURIComponent(videoId)}\`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch metadata');
        }

        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [videoId]);

  return { metadata, loading, error };
}`}
                    language="javascript"
                    showLineNumbers
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="text-cyan-500">API Client Class</span>
                  </h3>
                  <CodeBlock
                    code={`class YouTubeAPI {
  constructor(baseURL = 'https://api1.youtubesummaries.cc') {
    this.baseURL = baseURL;
  }

  async getMetadata(videoId) {
    const response = await fetch(
      \`\${this.baseURL}/youtube/metadata?video=\${encodeURIComponent(videoId)}\`
    );
    if (!response.ok) throw new Error('Failed to fetch metadata');
    return response.json();
  }

  async getCaptions(videoId, languages = ['en']) {
    const params = new URLSearchParams({ video: videoId, languages: languages.join(',') });
    const response = await fetch(\`\${this.baseURL}/youtube/captions?\${params}\`);
    if (!response.ok) throw new Error('Failed to fetch captions');
    return response.text();
  }

  async getTimestamps(videoId, languages = ['en']) {
    const params = new URLSearchParams({ video: videoId, languages: languages.join(',') });
    const response = await fetch(\`\${this.baseURL}/youtube/timestamps?\${params}\`);
    if (!response.ok) throw new Error('Failed to fetch timestamps');
    return response.json();
  }
}

// Usage
const api = new YouTubeAPI();
const metadata = await api.getMetadata('dQw4w9WgXcQ');`}
                    language="javascript"
                    showLineNumbers
                  />
                </div>
              </div>
            </section>

            {/* TypeScript Types */}
            <section id="types" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Code2 className="h-6 w-6 text-blue-500" />
                TypeScript Types
              </h2>
              <CodeBlock
                code={`interface VideoMetadata {
  title: string;
  author_name: string;
  author_url: string;
  type: string;
  height: number;
  width: number;
  version?: string;
  provider_name?: string;
  provider_url?: string;
  thumbnail_url: string;
}

interface CacheStats {
  enabled: boolean;
  size: number;
  max_size: number;
  ttl_seconds: number;
}

interface ServiceStatus {
  status: 'operational' | 'degraded' | 'down';
  version: string;
  timestamp: string;
  service: {
    name: string;
    host: string;
    port: number;
    log_level: string;
  };
  features: {
    proxy_enabled: boolean;
    proxy_type: string;
    cache_enabled: boolean;
    cache_size: number;
    cache_max_size: number;
    cache_ttl_seconds: number;
  };
  endpoints: Record<string, string>;
  cors: {
    enabled: boolean;
    allowed_origins: string[] | string;
  };
}

interface APIError {
  detail: string;
}`}
                language="typescript"
                showLineNumbers
              />
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
