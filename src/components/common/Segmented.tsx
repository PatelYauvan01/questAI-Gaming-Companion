import { useLayoutEffect, useRef, useState } from "react";

type SegmentedOption<T extends string> = { value: T; label: string; count?: number };

type SegmentedProps<T extends string> = {
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Tab-like filter control with an indicator that slides to the active option. */
export function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  const refs = useRef(new Map<T, HTMLButtonElement>());
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  // Re-measure only when the active option or the rendered labels/counts change.
  const layoutKey = options.map((option) => `${option.label}:${option.count ?? ""}`).join("|");

  useLayoutEffect(() => {
    const measure = () => {
      const active = refs.current.get(value);
      if (!active) return;
      const next = { left: active.offsetLeft, width: active.offsetWidth };
      setIndicator((current) =>
        current && current.left === next.left && current.width === next.width ? current : next,
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [value, layoutKey]);

  return (
    <div
      aria-label={label}
      className="relative inline-flex rounded-lg border border-line bg-panel p-1"
      role="tablist"
    >
      {indicator ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-1 rounded-md bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
      ) : null}
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            aria-selected={active}
            className={`relative flex h-8 items-center gap-2 rounded-md px-3.5 text-sm font-medium transition-colors duration-150 ${
              active ? "text-ink-1" : "text-ink-3 hover:text-ink-1"
            }`}
            key={option.value}
            onClick={() => onChange(option.value)}
            ref={(element) => {
              if (element) refs.current.set(option.value, element);
              else refs.current.delete(option.value);
            }}
            role="tab"
          >
            {option.label}
            {option.count !== undefined ? (
              <span className={`text-2xs tabular-nums ${active ? "text-accent" : "text-ink-3"}`}>{option.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
