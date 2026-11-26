import {
  Compass,
  Gamepad2,
  Heart,
  Home,
  Info,
  Library,
  Plus,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import type { ImportedGame } from "../../types/game";

const mainItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Discover", to: "/discover", icon: Compass },
  { label: "Library", to: "/library", icon: Library },
  { label: "Favorites", to: "/favorites", icon: Heart },
];

const SIDEBAR_GAME_LIMIT = 6;

// Below xl (1280px) the sidebar collapses to an icon rail; labels become tooltips.
const labelClass = "truncate max-xl:sr-only";

function navClass({ isActive }: { isActive: boolean }) {
  return `group relative flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition duration-150 max-xl:justify-center max-xl:px-0 ${
    isActive
      ? "bg-white/[0.06] text-ink-1"
      : "text-ink-3 hover:bg-white/[0.04] hover:text-ink-1"
  }`;
}

function NavItem({ to, label, icon: Icon, end }: { to: string; label: string; icon: LucideIcon; end?: boolean }) {
  return (
    <NavLink className={navClass} end={end} to={to} title={label}>
      {({ isActive }) => (
        <>
          <span
            aria-hidden="true"
            className={`absolute -left-3 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-accent transition duration-200 ease-out max-xl:-left-2 ${
              isActive ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
            }`}
          />
          <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${isActive ? "text-accent" : ""}`} />
          <span className={labelClass}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-1.5 px-3 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-3/80 max-xl:sr-only">
      {children}
    </p>
  );
}

type SidebarProps = {
  games: ImportedGame[];
  onAddGame: () => void;
};

export function Sidebar({ games, onAddGame }: SidebarProps) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-panel max-xl:w-[68px]">
      <div className="flex h-16 items-center px-5 max-xl:justify-center max-xl:px-0">
        <NavLink to="/" className="flex items-center gap-3 rounded-lg" title="QuestAI home">
          <div className="grid h-9 w-9 place-items-center rounded-[10px] border border-accent/40 bg-gradient-to-br from-accent/25 to-accent/5 text-sm font-black text-accent shadow-[0_0_24px_-6px_rgba(45,212,191,0.5)]">
            Q
          </div>
          <div className="max-xl:sr-only">
            <p className="text-sm font-bold tracking-[0.14em] text-ink-1">QUESTAI</p>
            <p className="text-2xs text-ink-3">Game companion</p>
          </div>
        </NavLink>
      </div>

      <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto px-3 py-4 max-xl:px-2">
        <section>
          <SectionLabel>Menu</SectionLabel>
          <div className="space-y-0.5">
            {mainItems.map((item) => (
              <NavItem end={item.to === "/"} icon={item.icon} key={item.to} label={item.label} to={item.to} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-1.5 flex items-center justify-between gap-2 pl-3 pr-1 max-xl:justify-center max-xl:p-0">
            <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-3/80 max-xl:sr-only">My Games</p>
            <button
              aria-label="Add game"
              className="grid h-6 w-6 place-items-center rounded-md text-ink-3 transition hover:bg-white/[0.06] hover:text-accent"
              onClick={onAddGame}
              title="Add game"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-0.5">
            {games.length === 0 ? (
              <p className="px-3 py-2 text-xs leading-5 text-ink-3 max-xl:hidden">
                No games yet. Add one or import your Steam library.
              </p>
            ) : null}
            {games.slice(0, SIDEBAR_GAME_LIMIT).map((game) => (
              <NavItem icon={Gamepad2} key={game.id} label={game.title} to={`/game/${game.id}`} />
            ))}
            {games.length > SIDEBAR_GAME_LIMIT ? (
              <Link
                className="block px-3 py-1.5 text-xs font-medium text-ink-3 transition hover:text-accent max-xl:hidden"
                to="/library"
              >
                View all {games.length} games
              </Link>
            ) : null}
          </div>
        </section>
      </nav>

      <div className="space-y-0.5 border-t border-line px-3 py-3 max-xl:px-2">
        <NavItem icon={Settings} label="Settings" to="/settings" />
        <Link className={navClass({ isActive: false })} title="About" to="/settings#about">
          <Info className="h-[18px] w-[18px] shrink-0" />
          <span className={labelClass}>About</span>
        </Link>
      </div>
    </aside>
  );
}
