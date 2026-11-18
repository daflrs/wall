import { cn } from "@/lib/utils";

const RADIUS = 9;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** A small progress ring plus "N characters remaining". */
export function CharCounter({ length, max }: { length: number; max: number }) {
  const remaining = max - length;
  const progress = Math.min(length / max, 1);
  const tone =
    remaining <= 0 ? "danger" : remaining <= 20 ? "warning" : "normal";

  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <svg width="22" height="22" viewBox="0 0 22 22" className="-rotate-90" aria-hidden="true">
        <circle cx="11" cy="11" r={RADIUS} fill="none" strokeWidth="2.5" className="stroke-gray-200" />
        <circle
          cx="11"
          cy="11"
          r={RADIUS}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          className={cn(
            "transition-[stroke-dashoffset,stroke] duration-300 ease-out",
            tone === "normal" && "stroke-blue-500",
            tone === "warning" && "stroke-amber-500",
            tone === "danger" && "stroke-red-500"
          )}
        />
      </svg>
      <span
        className={cn(
          "text-sm tabular-nums transition-colors",
          tone === "normal" && "text-gray-500",
          tone === "warning" && "text-amber-600",
          tone === "danger" && "font-medium text-red-600"
        )}
      >
        {remaining} {remaining === 1 ? "character" : "characters"} remaining
      </span>
    </div>
  );
}
