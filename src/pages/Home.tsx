import { FolderPlus, Sparkles } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { Button } from "../components/common/Button";
import { SectionHeader } from "../components/common/SectionHeader";
import { FeaturedGame } from "../components/games/FeaturedGame";
import { GameGrid } from "../components/games/GameGrid";
import type { LayoutContext } from "../components/layout/MainLayout";
import { mockGames } from "../data/mockGames";

export function Home() {
  const { addGame, games, search } = useOutletContext<LayoutContext>();
  const normalizedSearch = search.trim().toLowerCase();
  const libraryGames = normalizedSearch
    ? games.filter((game) =>
        `${game.title} ${game.executableFilename} ${game.executablePath}`
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : games;
  const featured = mockGames[0];
  const recentGames = libraryGames.slice(0, 4);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Desktop Foundation
        </p>
        <h1 className="mt-2 text-4xl font-bold text-white">Welcome to QuestAI</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Your intelligent companion for story-driven games.
        </p>
      </section>

      <FeaturedGame detailPath="/discover" game={featured} />

      <section>
        <SectionHeader title="Recently Imported" subtitle="Games added from this PC." />
        {games.length === 0 ? (
          <div className="rounded-lg border border-line bg-card p-8">
            <h2 className="text-xl font-semibold text-white">Build your QuestAI library</h2>
            <p className="mt-2 max-w-2xl text-slate-400">
              Add a game executable to create the first persistent local library entry.
            </p>
            <Button className="mt-5" onClick={addGame}>
              <FolderPlus className="h-4 w-4" /> Add Game
            </Button>
          </div>
        ) : (
          <GameGrid games={recentGames} />
        )}
      </section>

      <section>
        <SectionHeader title="My Games" subtitle="Your imported games, stored locally." />
        <GameGrid games={libraryGames} />
      </section>

      <section className="rounded-lg border border-accent/30 bg-card p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              QuestAI Assistance
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">Stuck in a game?</h2>
            <p className="mt-2 max-w-2xl text-slate-400">
              Ask QuestAI for help. The interface is ready for future guidance features,
              while AI integration stays out of this milestone.
            </p>
          </div>
          <Link to={games[0] ? `/game/${games[0].id}` : "/library"}>
            <Button>
              <Sparkles className="h-4 w-4" /> Ask QuestAI
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
