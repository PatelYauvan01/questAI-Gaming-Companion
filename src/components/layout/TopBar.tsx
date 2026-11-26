import { ChevronLeft, ChevronRight, PanelsTopLeft, Search, Settings, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { showGuideOverlay } from "../../services/gameGuide";

type TopBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

const iconButton =
  "grid h-9 w-9 place-items-center rounded-lg text-ink-3 transition duration-150 hover:bg-white/[0.06] hover:text-ink-1 active:scale-95";

export function TopBar({ search, onSearchChange }: TopBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [overlayError, setOverlayError] = useState<string | null>(null);

  // Ctrl+K (or Cmd+K) focuses search from anywhere in the app.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function openOverlay() {
    setOverlayError(null);
    try {
      await showGuideOverlay();
    } catch (error) {
      setOverlayError(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-shell/80 px-4 backdrop-blur xl:px-6">
      <div className="flex gap-0.5">
        <button aria-label="Go back" className={iconButton} onClick={() => window.history.back()} title="Back">
          <ChevronLeft className="h-[18px] w-[18px]" />
        </button>
        <button aria-label="Go forward" className={iconButton} onClick={() => window.history.forward()} title="Forward">
          <ChevronRight className="h-[18px] w-[18px]" />
        </button>
      </div>

      <label className="group relative min-w-[220px] max-w-lg flex-1">
        <span className="sr-only">Search games</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3 transition-colors group-focus-within:text-accent" />
        <input
          ref={inputRef}
          value={search}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              onSearchChange("");
              event.currentTarget.blur();
            }
          }}
          placeholder="Search games, genres, files…"
          className="field pl-9 pr-16"
        />
        {search ? (
          <button
            aria-label="Clear search"
            className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-ink-3 transition hover:bg-white/10 hover:text-ink-1"
            onClick={() => {
              onSearchChange("");
              inputRef.current?.focus();
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 gap-1" aria-hidden="true">
            <kbd className="kbd">Ctrl</kbd>
            <kbd className="kbd">K</kbd>
          </span>
        )}
      </label>

      <div className="ml-auto flex items-center gap-1.5">
        {overlayError ? (
          <span className="max-w-[220px] truncate text-xs text-red-300" role="alert" title={overlayError}>
            {overlayError}
          </span>
        ) : null}
        <button
          className="group flex h-9 items-center gap-2 rounded-lg border border-line-strong bg-white/[0.03] pl-3 pr-2 text-sm font-medium text-ink-2 transition duration-150 hover:border-accent/40 hover:bg-accent/[0.06] hover:text-ink-1 active:scale-[0.98]"
          onClick={() => void openOverlay()}
          title="Open the in-game guide overlay"
        >
          <PanelsTopLeft className="h-4 w-4 text-accent" />
          <span className="max-lg:sr-only">Guide overlay</span>
          <span className="flex gap-0.5 max-lg:hidden" aria-hidden="true">
            <kbd className="kbd">Alt</kbd>
            <kbd className="kbd">Shift</kbd>
            <kbd className="kbd">Q</kbd>
          </span>
        </button>
        <Link aria-label="Open settings" className={iconButton} title="Settings" to="/settings">
          <Settings className="h-[18px] w-[18px]" />
        </Link>
      </div>
    </header>
  );
}
