import { Link, useOutletContext } from "react-router-dom";
import { Button } from "../components/common/Button";
import { SectionHeader } from "../components/common/SectionHeader";
import { FeaturedGame } from "../components/games/FeaturedGame";
import { GameGrid } from "../components/games/GameGrid";
import type { LayoutContext } from "../components/layout/MainLayout";
import { mockGames } from "../data/mockGames";

const genres = ["Action RPG", "Story RPG", "Metroidvania", "CRPG", "Action Adventure"];

export function Discover() {
  const { search } = useOutletContext<LayoutContext>();
  const normalizedSearch = search.trim().toLowerCase();
  const games = normalizedSearch
    ? mockGames.filter((game) =>
        `${game.title} ${game.genre} ${game.description}`
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : mockGames;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-white">Discover</h1>
        <p className="mt-2 text-slate-400">
          Curated mock discovery surfaces prepared for future dynamic content.
        </p>
      </header>

      <FeaturedGame detailPath="/discover" game={mockGames[6]} />

      <section>
        <SectionHeader title="Popular" subtitle="High-signal story games from the sample set." />
        <GameGrid detailPath={() => "/discover"} games={games.slice(0, 4)} />
      </section>

      <section>
        <SectionHeader title="Recommended" />
        <GameGrid detailPath={() => "/discover"} games={games.slice(3)} />
      </section>

      <section>
        <SectionHeader title="Browse by Genre" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          {genres.map((genre) => (
            <Link
              className="rounded-lg border border-line bg-card p-5 transition hover:border-accent/50 hover:bg-[#19212c]"
              key={genre}
              to="/library"
            >
              <p className="font-semibold text-white">{genre}</p>
              <p className="mt-2 text-sm text-slate-500">Explore matching library entries</p>
            </Link>
          ))}
        </div>
      </section>

      <Button variant="secondary">Refresh Recommendations</Button>
    </div>
  );
}
