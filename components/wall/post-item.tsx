"use client";

import { useState, type CSSProperties } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { fullDate, timeAgo } from "@/lib/format";
import type { Post } from "@/lib/types";

function PostImage({ src, alt }: { src: string; alt: string }) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");

  if (state === "error") {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-400">
        <ImageOff className="size-4" aria-hidden="true" />
        This photo couldn&apos;t be loaded.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mt-3 w-fit max-w-full overflow-hidden rounded-xl",
        state === "loading" && "min-h-48 min-w-64 animate-pulse bg-gray-100"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setState("loaded")}
        onError={() => setState("error")}
        className={cn(
          "block max-h-[28rem] w-auto max-w-full object-contain transition-opacity duration-500",
          state === "loaded" ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

type Props = {
  post: Post;
  now: number;
  fresh: boolean;
  index: number;
};

export function PostItem({ post, now, fresh, index }: Props) {
  // Initial posts cascade in; posts that arrive live pop in with a soft blue glow.
  const style: CSSProperties | undefined = fresh
    ? undefined
    : { animationDelay: `${Math.min(index, 10) * 45}ms` };

  return (
    <article
      style={style}
      className={cn(
        "-mx-3 rounded-xl border-b border-gray-200 px-3 py-4 last:border-b-0",
        fresh ? "animate-post-glow" : "animate-post-in"
      )}
    >
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="truncate font-bold text-gray-900">{post.author_name}</h3>
        <time
          dateTime={post.created_at}
          title={fullDate(post.created_at)}
          className="shrink-0 text-xs text-gray-500"
        >
          {timeAgo(post.created_at, now)}
        </time>
      </header>

      {post.body && (
        <p className="mt-1.5 whitespace-pre-wrap break-words text-gray-800">{post.body}</p>
      )}

      {post.image_url && (
        <PostImage src={post.image_url} alt={`Photo shared by ${post.author_name}`} />
      )}
    </article>
  );
}
