import { Skeleton } from '@/components/ui/skeleton';

export default function ChannelLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Channel Header */}
      <div className="mb-8 flex items-start gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full max-w-2xl" />
        </div>
      </div>

      {/* Videos Section */}
      <div className="mb-6">
        <Skeleton className="h-7 w-48 mb-4" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
