import {
  Compass,
  Gamepad2,
  Heart,
  Home,
  Info,
  Library,
  Plus,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import type { ImportedGame } from "../../types/game";

const mainItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Discover", to: "/discover", icon: Compass },
  { label: "Library", to: "/library", icon: Library },
  { label: "Favorites", to: "/favorites", icon: Heart },
];

const bottomItems = [
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "About", to: "/settings#about", icon: Info },
];

function navClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-accent/15 text-accent"
      : "text-slate-400 hover:bg-white/5 hover:text-white"
  }`;
}

type SidebarProps = {
  games: ImportedGame[];
  onAddGame: () => void;
};

export function Sidebar({ games, onAddGame }: SidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-line bg-[#0b0f16]">
      <div className="border-b border-line p-5">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg border border-accent/50 bg-accent/15 text-lg font-black text-accent">
            Q
          </div>
          <div>
            <p className="text-lg font-black tracking-[0.12em] text-white">QUESTAI</p>
            <p className="text-xs text-slate-500">Game companion</p>
          </div>
        </NavLink>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto p-4">
        <section>
          <p className="mb-2 px-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
            Main
          </p>
          <div className="space-y-1">
            {mainItems.map((item) => (
              <NavLink
                className={navClass}
                end={item.to === "/"}
                key={item.to}
                to={item.to}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between gap-2 px-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
              My Games
            </p>
            <button
              aria-label="Add game"
              className="rounded-md p-1 text-slate-500 transition hover:bg-white/5 hover:text-accent"
              onClick={onAddGame}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1">
            {games.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-600">No imported games yet.</p>
            ) : null}
            {games.slice(0, 6).map((game) => (
              <NavLink className={navClass} key={game.id} to={`/game/${game.id}`}>
                <Gamepad2 className="h-4 w-4" />
                <span className="truncate">{game.title}</span>
              </NavLink>
            ))}
          </div>
        </section>
      </nav>

      <div className="border-t border-line p-4">
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <NavLink className={navClass} key={item.to} to={item.to}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
}
