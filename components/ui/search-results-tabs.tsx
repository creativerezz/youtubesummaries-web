"use client"

import * as React from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { Globe, Image as ImageIcon, Newspaper, ExternalLink, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface WebResult {
  title: string
  url: string
  content: string
  date?: string
}

export interface ImageResult {
  url: string
  title?: string
}

export interface NewsResult {
  title: string
  url: string
  content: string
  score?: number
  date?: string
}

export interface SearchResults {
  web?: WebResult[]
  images?: string[] | ImageResult[]
  news?: NewsResult[]
}

interface SearchResultsTabsProps {
  search_results: SearchResults
  onImageClick?: (imageUrl: string) => void
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return ""
  }
}

function formatDate(dateString?: string): string {
  if (!dateString) return ""
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  } catch {
    return dateString
  }
}

function WebResultsPopover({ results }: { results: WebResult[] }) {
  const [open, setOpen] = React.useState(false)

  if (results.length === 0) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          {results.length} {results.length === 1 ? "source" : "sources"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <a
              key={index}
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block border-b last:border-b-0 p-4 hover:bg-accent transition-colors"
            >
              <div className="flex items-start gap-3">
                <img
                  src={getFaviconUrl(result.url)}
                  alt=""
                  className="h-4 w-4 mt-0.5 shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium line-clamp-2">{result.title}</h4>
                    <ExternalLink className="h-3 w-3 shrink-0 mt-0.5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {result.content}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground truncate">{result.url}</span>
                    {result.date && (
                      <span className="text-xs text-muted-foreground">· {formatDate(result.date)}</span>
                    )}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ImageCard({
  image,
  index,
  onClick,
}: {
  image: string | ImageResult
  index: number
  onClick?: (url: string) => void
}) {
  const [loaded, setLoaded] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [rotation, setRotation] = React.useState(0)
  const imageUrl = typeof image === "string" ? image : image.url
  const imageTitle = typeof image === "string" ? undefined : image.title

  if (error) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
    >
      {!loaded && (
        <Skeleton className="absolute inset-0" />
      )}
      <Image
        src={imageUrl}
        alt={imageTitle || `Image ${index + 1}`}
        fill
        className={cn(
          "object-cover transition-transform duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        style={{ transform: `rotate(${rotation}deg)` }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
        unoptimized
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              setRotation((prev) => (prev + 90) % 360)
            }}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          {onClick && (
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onClick(imageUrl)
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function SearchResultsTabs({ search_results, onImageClick }: SearchResultsTabsProps) {
  const { web = [], images = [], news = [] } = search_results

  const hasWeb = web.length > 0
  const hasImages = images.length > 0
  const hasNews = news.length > 0

  const defaultTab = hasWeb ? "web" : hasImages ? "images" : hasNews ? "news" : "web"

  if (!hasWeb && !hasImages && !hasNews) {
    return null
  }

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        {hasWeb && (
          <TabsTrigger value="web" className="gap-2">
            <Globe className="h-4 w-4" />
            Web
            {web.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                {web.length}
              </span>
            )}
          </TabsTrigger>
        )}
        {hasImages && (
          <TabsTrigger value="images" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Images
            {images.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                {images.length}
              </span>
            )}
          </TabsTrigger>
        )}
        {hasNews && (
          <TabsTrigger value="news" className="gap-2">
            <Newspaper className="h-4 w-4" />
            News
            {news.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                {news.length}
              </span>
            )}
          </TabsTrigger>
        )}
      </TabsList>

      <AnimatePresence mode="wait">
        {hasWeb && (
          <TabsContent value="web" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {web.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Web Results</h3>
                    {web.length > 1 && <WebResultsPopover results={web} />}
                  </div>
                  <div className="space-y-3">
                    {web.slice(0, 3).map((result, index) => (
                      <a
                        key={index}
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg border p-4 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={getFaviconUrl(result.url)}
                            alt=""
                            className="h-5 w-5 mt-0.5 shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium line-clamp-2">{result.title}</h4>
                              <ExternalLink className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {result.content}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground truncate">
                                {result.url}
                              </span>
                              {result.date && (
                                <span className="text-xs text-muted-foreground">
                                  · {formatDate(result.date)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">No web results found</p>
              )}
            </motion.div>
          </TabsContent>
        )}

        {hasImages && (
          <TabsContent value="images" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <ImageCard
                      key={index}
                      image={image}
                      index={index}
                      onClick={onImageClick}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No images found</p>
              )}
            </motion.div>
          </TabsContent>
        )}

        {hasNews && (
          <TabsContent value="news" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {news.length > 0 ? (
                news.map((article, index) => (
                  <a
                    key={index}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <h4 className="font-medium line-clamp-2">{article.title}</h4>
                          <ExternalLink className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {article.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground truncate">
                            {article.url}
                          </span>
                          {article.date && (
                            <span className="text-xs text-muted-foreground">
                              · {formatDate(article.date)}
                            </span>
                          )}
                          {article.score !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              · Score: {(article.score * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No news articles found</p>
              )}
            </motion.div>
          </TabsContent>
        )}
      </AnimatePresence>
    </Tabs>
  )
}

