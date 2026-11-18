"use client";

import { useRef, useState, type DragEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  previewUrl: string | null;
  fileName: string | null;
  error: string | null;
  disabled?: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
};

export function PhotoPicker({ previewUrl, fileName, error, disabled, onSelect, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && !disabled) onSelect(file);
  }

  if (previewUrl) {
    return (
      <div className="animate-post-in relative w-fit">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt={fileName ?? "Selected photo"}
          className="max-h-64 max-w-full rounded-xl border border-gray-200 object-contain"
        />
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Remove photo"
          className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-md transition hover:scale-110 hover:text-red-600 active:scale-95 disabled:opacity-50"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "group flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all duration-200",
          dragging
            ? "scale-[1.01] border-blue-400 bg-blue-50"
            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40",
          error && "border-red-300",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        <ImagePlus className="size-7 text-gray-400 transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110 group-hover:text-blue-500" />
        <span className="text-sm text-gray-600">
          <span className="font-medium">Click to add photo</span> (optional)
        </span>
        <span className="text-xs text-gray-400">JPG, PNG, GIF, WebP up to 5MB</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = ""; // allow picking the same file again
        }}
      />
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
