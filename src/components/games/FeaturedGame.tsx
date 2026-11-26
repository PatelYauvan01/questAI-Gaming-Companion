import { ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { Game } from "../../data/mockGames";
import { Button } from "../common/Button";
import { GameArtwork } from "./GameArtwork";
import { GameBadge } from "./GameBadge";

type FeaturedGameProps = {
  game: Game;
  detailPath?: string;
};

export function FeaturedGame({ game, detailPath }: FeaturedGameProps) {
  const target = detailPath ?? `/game/${game.id}`;

  return (
    <section className="grid overflow-hidden rounded-lg border border-line bg-card shadow-soft lg:grid-cols-[1.15fr_0.85fr]">
      <GameArtwork game={game} className="min-h-[300px]" />
      <div className="flex flex-col justify-between gap-8 p-7">
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <GameBadge>{game.genre}</GameBadge>
            <GameBadge>{game.status}</GameBadge>
            <GameBadge>{game.tone}</GameBadge>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Featured Game
          </p>
          <h2 className="mt-2 text-4xl font-bold text-white">{game.title}</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            {game.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to={target}>
            <Button>
              Open Game <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="secondary">
            <Sparkles className="h-4 w-4" /> Ask QuestAI
          </Button>
        </div>
      </div>
    </section>
  );
}
