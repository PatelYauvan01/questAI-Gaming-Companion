import { ArrowUpRight } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { PageHeader } from "../components/common/PageHeader";
import { SectionHeader } from "../components/common/SectionHeader";
import { FeaturedGame } from "../components/games/FeaturedGame";
import { GameGrid } from "../components/games/GameGrid";
import type { LayoutContext } from "../components/layout/MainLayout";
import { mockGames } from "../data/mockGames";

const genres = [
  { name: "Action RPG", tint: "from-cyan-400/20" },
  { name: "Story RPG", tint: "from-violet-400/20" },
  { name: "Metroidvania", tint: "from-amber-400/20" },
  { name: "CRPG", tint: "from-rose-400/20" },
  { name: "Action Adventure", tint: "from-emerald-400/20" },
];

export function Discover() {
  const { search } = useOutletContext<LayoutContext>();
  const normalizedSearch = search.trim().toLowerCase();
  const games = normalizedSearch
    ? mockGames.filter((game) =>
        `${game.title} ${game.genre} ${game.description}`.toLowerCase().includes(normalizedSearch),
      )
    : mockGames;
  const featured = mockGames[6] ?? mockGames[0];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Discover"
        title="Discover"
        description="A curated sample of story-driven games. Dynamic recommendations are planned for a later release."
      />

      {!normalizedSearch && featured ? (
        <FeaturedGame
          badges={[featured.genre, featured.tone]}
          eyebrow="Editor's pick"
          game={featured}
        />
      ) : null}

      <section>
        <SectionHeader
          title={normalizedSearch ? "Matching games" : "Popular"}
          subtitle={normalizedSearch ? undefined : "High-signal story games from the sample set."}
        />
        <GameGrid detailPath={() => "/discover"} games={normalizedSearch ? games : games.slice(0, 4)} />
      </section>

      {!normalizedSearch && games.length > 4 ? (
        <section>
          <SectionHeader title="Recommended" />
          <GameGrid detailPath={() => "/discover"} games={games.slice(4)} />
        </section>
      ) : null}

      <section>
        <SectionHeader title="Browse by Genre" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
          {genres.map((genre) => (
            <Link
              className={`surface group relative overflow-hidden bg-gradient-to-br ${genre.tint} to-transparent p-5 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift`}
              key={genre.name}
              to="/library"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-ink-1">{genre.name}</p>
                <ArrowUpRight className="h-4 w-4 text-ink-3 transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
              <p className="mt-2 text-xs text-ink-3">Open your library</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
