import { Bell, ChevronLeft, ChevronRight, Search, Settings } from "lucide-react";
import { Link } from "react-router-dom";

type TopBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function TopBar({ search, onSearchChange }: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-line bg-panel/95 px-5">
      <div className="flex gap-2">
        <button
          aria-label="Go back"
          className="rounded-lg border border-line bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          aria-label="Go forward"
          className="rounded-lg border border-line bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
          onClick={() => window.history.forward()}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <label className="relative min-w-[280px] max-w-xl flex-1">
        <span className="sr-only">Search games</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          placeholder="Search games, genres, guides..."
          className="h-10 w-full rounded-lg border border-line bg-[#0b0f16] pl-10 pr-4 text-sm text-white placeholder:text-slate-500 transition focus:border-accent"
        />
      </label>

      <div className="ml-auto flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="rounded-lg border border-line bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <Bell className="h-4 w-4" />
        </button>
        <Link
          aria-label="Open settings"
          to="/settings"
          className="rounded-lg border border-line bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <Settings className="h-4 w-4" />
        </Link>
        <div className="flex h-10 items-center gap-3 rounded-lg border border-line bg-white/5 px-3">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-xs font-black text-slate-950">
            Q
          </div>
          <span className="hidden text-sm font-medium text-slate-200 xl:inline">
            Player
          </span>
        </div>
      </div>
    </header>
  );
}
