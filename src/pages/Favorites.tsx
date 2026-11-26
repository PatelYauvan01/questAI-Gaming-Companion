import { useOutletContext } from "react-router-dom";
import { SectionHeader } from "../components/common/SectionHeader";
import { GameGrid } from "../components/games/GameGrid";
import type { LayoutContext } from "../components/layout/MainLayout";

export function Favorites() {
  const { addGame, games, search } = useOutletContext<LayoutContext>();
  const normalizedSearch = search.trim().toLowerCase();
  const favoriteGames = games.filter(
    (game) =>
      game.favorite &&
      `${game.title} ${game.executableFilename} ${game.genre ?? ""}`
        .toLowerCase()
        .includes(normalizedSearch),
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-bold text-white">Favorites</h1>
        <p className="mt-2 text-slate-400">Your pinned games and likely QuestAI targets.</p>
      </header>
      <section>
        <SectionHeader title="Favorite Games" />
        {games.length === 0 ? (
          <div className="rounded-lg border border-line bg-card p-8 text-center text-slate-400">
            Import a game before marking favorites.
            <button
              className="ml-2 font-semibold text-accent hover:text-teal-200"
              onClick={addGame}
            >
              Add Game
            </button>
          </div>
        ) : (
          <GameGrid games={favoriteGames} />
        )}
      </section>
    </div>
  );
}
