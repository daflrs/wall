"use client";

import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CharCounter } from "./char-counter";
import { PhotoPicker } from "./photo-picker";
import { useSavedName } from "@/hooks/use-saved-name";
import { getSupabase, IMAGE_BUCKET, POSTS_TABLE } from "@/lib/supabase";
import { friendlyError } from "@/lib/format";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_BODY_LENGTH,
  MAX_IMAGE_BYTES,
  MAX_NAME_LENGTH,
} from "@/lib/constants";
import { profile } from "@/lib/profile";
import type { Post } from "@/lib/types";

type Stage = "idle" | "uploading" | "posting";

export function Composer({ onPosted }: { onPosted: (post: Post) => void }) {
  const [name, setName] = useSavedName();
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");

  // Free the preview's memory when it changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const trimmedName = name.trim();
  const trimmedBody = body.trim();
  const busy = stage !== "idle";
  const hasContent = trimmedBody.length > 0 || file !== null;
  const canShare = !busy && trimmedName.length > 0 && hasContent;

  function selectFile(next: File) {
    if (!ACCEPTED_IMAGE_TYPES[next.type]) {
      setFileError("That file type isn't supported. Use JPG, PNG, GIF or WebP.");
      return;
    }
    if (next.size > MAX_IMAGE_BYTES) {
      setFileError(`That photo is ${(next.size / 1024 / 1024).toFixed(1)}MB. The limit is 5MB.`);
      return;
    }
    setFileError(null);
    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));
  }

  function removeFile() {
    setFile(null);
    setPreviewUrl(null);
    setFileError(null);
  }

  async function share(e?: FormEvent) {
    e?.preventDefault();
    if (!canShare) return;

    try {
      const supabase = getSupabase();
      let imageUrl: string | null = null;

      if (file) {
        setStage("uploading");
        const path = `${crypto.randomUUID()}.${ACCEPTED_IMAGE_TYPES[file.type]}`;
        const { error: uploadError } = await supabase.storage
          .from(IMAGE_BUCKET)
          .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
      }

      setStage("posting");
      const { data, error } = await supabase
        .from(POSTS_TABLE)
        .insert({
          author_name: trimmedName.slice(0, MAX_NAME_LENGTH),
          body: trimmedBody ? trimmedBody.slice(0, MAX_BODY_LENGTH) : null,
          image_url: imageUrl,
        })
        .select()
        .single();
      if (error) throw error;

      onPosted(data as Post);
      setBody("");
      removeFile();
      toast.success(`Posted to ${profile.name.split(" ")[0]}'s wall ✨`);
    } catch (err) {
      toast.error("Couldn't share your post", { description: friendlyError(err) });
    } finally {
      setStage("idle");
    }
  }

  // Ctrl/Cmd + Enter shares, like most chat apps.
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void share();
    }
  }

  const shareLabel =
    stage === "uploading" ? "Uploading photo…" : stage === "posting" ? "Sharing…" : "Share";

  return (
    <form onSubmit={share} className="space-y-3" aria-label="Write on the wall">
      <div className="space-y-1">
        <label htmlFor="author-name" className="text-sm font-medium text-gray-700">
          Your name
        </label>
        <Input
          id="author-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={MAX_NAME_LENGTH}
          placeholder="Juan dela Cruz"
          autoComplete="name"
          disabled={busy}
          className="max-w-xs bg-white"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="post-body" className="sr-only">
          Message
        </label>
        <Textarea
          id="post-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_BODY_LENGTH}
          placeholder="What's on your mind?"
          disabled={busy}
          rows={3}
          className="min-h-24 resize-none rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 text-base transition-colors focus-visible:border-blue-400 focus-visible:bg-white md:text-base"
        />
        <CharCounter length={body.length} max={MAX_BODY_LENGTH} />
      </div>

      <PhotoPicker
        previewUrl={previewUrl}
        fileName={file?.name ?? null}
        error={fileError}
        disabled={busy}
        onSelect={selectFile}
        onRemove={removeFile}
      />

      <div className="flex items-center justify-end gap-3">
        {!busy && !trimmedName && hasContent && (
          <p className="text-sm text-gray-500">Add your name to share</p>
        )}
        <Button
          type="submit"
          disabled={!canShare}
          className="min-w-24 bg-blue-500 font-semibold text-white transition-all hover:bg-blue-600 active:scale-95"
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {shareLabel}
        </Button>
      </div>
    </form>
  );
}
