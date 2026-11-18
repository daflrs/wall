"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase, POSTS_TABLE } from "@/lib/supabase";
import { friendlyError } from "@/lib/format";
import type { Post } from "@/lib/types";

const FEED_LIMIT = 50;

export type FeedStatus = "loading" | "ready" | "error";
export type LiveStatus = "connecting" | "live" | "reconnecting";

async function fetchLatest(): Promise<Post[]> {
  const { data, error } = await getSupabase()
    .from(POSTS_TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(FEED_LIMIT);
  if (error) throw error;
  return (data ?? []) as Post[];
}

/** Merge without duplicates, newest first. */
function merge(current: Post[], incoming: Post[]): Post[] {
  const byId = new Map<string, Post>();
  for (const post of [...current, ...incoming]) byId.set(post.id, post);
  return [...byId.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<FeedStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState<LiveStatus>("connecting");
  const [freshIds, setFreshIds] = useState<ReadonlySet<string>>(() => new Set());
  const [attempt, setAttempt] = useState(0);
  const wasDisconnected = useRef(false);

  /** Add one post (from realtime or from our own Share) and mark it as fresh. */
  const addPost = useCallback((post: Post) => {
    setPosts((current) => merge(current, [post]));
    setFreshIds((ids) => new Set(ids).add(post.id));
  }, []);

  // Initial load (and Retry).
  useEffect(() => {
    let cancelled = false;
    fetchLatest()
      .then((latest) => {
        if (cancelled) return;
        setPosts((current) => merge(current, latest));
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(friendlyError(err));
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // Live updates: listen for new rows in the posts table.
  useEffect(() => {
    const supabase = getSupabase();
    const channel = supabase
      .channel("wall-posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: POSTS_TABLE },
        (payload) => addPost(payload.new as Post)
      )
      .subscribe((state) => {
        if (state === "SUBSCRIBED") {
          setLive("live");
          // After a dropped connection, catch up on anything we missed.
          if (wasDisconnected.current) {
            wasDisconnected.current = false;
            fetchLatest()
              .then((latest) => setPosts((current) => merge(current, latest)))
              .catch(() => {});
          }
        } else if (state === "CHANNEL_ERROR" || state === "TIMED_OUT" || state === "CLOSED") {
          wasDisconnected.current = true;
          setLive("reconnecting");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addPost]);

  const retry = useCallback(() => {
    setStatus("loading");
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return { posts, status, error, live, freshIds, addPost, retry };
}
