"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { NAME_STORAGE_KEY } from "@/lib/constants";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readSaved(): string {
  try {
    return localStorage.getItem(NAME_STORAGE_KEY) ?? "";
  } catch {
    return ""; // storage blocked (e.g. strict privacy mode)
  }
}

/**
 * The visitor's name, remembered in localStorage so they only type it once.
 * useSyncExternalStore reads storage safely: the server render uses "" and the
 * browser swaps in the saved name, so there's no hydration mismatch.
 */
export function useSavedName() {
  const saved = useSyncExternalStore(subscribe, readSaved, () => "");
  const [draft, setDraft] = useState<string | null>(null);

  const setName = useCallback((value: string) => {
    setDraft(value);
    try {
      localStorage.setItem(NAME_STORAGE_KEY, value);
    } catch {
      // ignore: the name still works for this visit
    }
  }, []);

  return [draft ?? saved, setName] as const;
}
