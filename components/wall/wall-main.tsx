"use client";

import { Composer } from "./composer";
import { PostFeed } from "./post-feed";
import { usePosts } from "@/hooks/use-posts";
import { isSupabaseConfigured } from "@/lib/supabase";

function SetupNotice() {
  return (
    <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
      <p className="font-semibold">Supabase isn&apos;t connected yet</p>
      <p className="mt-1">
        Add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>{" "}
        (or to Vercel&apos;s Environment Variables), then restart or redeploy.
      </p>
    </div>
  );
}

function ConnectedWall() {
  const { posts, status, error, live, freshIds, addPost, retry } = usePosts();

  return (
    <>
      <Composer onPosted={addPost} />
      <PostFeed
        posts={posts}
        status={status}
        error={error}
        live={live}
        freshIds={freshIds}
        onRetry={retry}
      />
    </>
  );
}

export function WallMain() {
  return (
    <main className="min-w-0 flex-1 p-4 md:p-6">
      {isSupabaseConfigured ? <ConnectedWall /> : <SetupNotice />}
    </main>
  );
}
