"use client";

import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PostItem } from "./post-item";
import { useNow } from "@/hooks/use-now";
import { profile } from "@/lib/profile";
import { cn } from "@/lib/utils";
import type { FeedStatus, LiveStatus } from "@/hooks/use-posts";
import type { Post } from "@/lib/types";

type Props = {
  posts: Post[];
  status: FeedStatus;
  error: string | null;
  live: LiveStatus;
  freshIds: ReadonlySet<string>;
  onRetry: () => void;
};

function LiveBadge({ live }: { live: LiveStatus }) {
  const label = live === "live" ? "Live" : live === "connecting" ? "Connecting…" : "Reconnecting…";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-600"
      title={live === "live" ? "New posts appear automatically" : undefined}
    >
      <span className="relative flex size-2">
        {live === "live" && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        )}
        <span
          className={cn(
            "relative inline-flex size-2 rounded-full",
            live === "live" ? "bg-emerald-500" : "bg-amber-400"
          )}
        />
      </span>
      {label}
    </span>
  );
}

function FeedSkeleton() {
  return (
    <div aria-label="Loading posts" className="space-y-6 py-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-2.5">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="h-4 w-2/3 max-w-sm" />
        </div>
      ))}
    </div>
  );
}

export function PostFeed({ posts, status, error, live, freshIds, onRetry }: Props) {
  const now = useNow();

  return (
    <section aria-labelledby="feed-heading" className="mt-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h2 id="feed-heading" className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Wall posts
        </h2>
        <LiveBadge live={live} />
      </div>

      {status === "loading" && posts.length === 0 && <FeedSkeleton />}

      {status === "error" && posts.length === 0 && (
        <div role="alert" className="animate-post-in flex flex-col items-center gap-3 py-12 text-center">
          <AlertCircle className="size-8 text-red-400" aria-hidden="true" />
          <div>
            <p className="font-medium text-gray-900">Couldn&apos;t load the wall</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        </div>
      )}

      {status === "ready" && posts.length === 0 && (
        <div className="animate-post-in flex flex-col items-center gap-2 py-12 text-center">
          <Sparkles className="size-8 text-blue-400" aria-hidden="true" />
          <p className="font-medium text-gray-900">No posts yet</p>
          <p className="text-sm text-gray-500">
            Be the first to write on {profile.name.split(" ")[0]}&apos;s wall!
          </p>
        </div>
      )}

      {posts.length > 0 && (
        <div aria-live="polite">
          {posts.map((post, i) => (
            <PostItem key={post.id} post={post} now={now} fresh={freshIds.has(post.id)} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
