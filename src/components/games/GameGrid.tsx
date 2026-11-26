import { SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "../common/EmptyState";
import { GameCard, type GameCardGame } from "./GameCard";

type GameGridProps = {
  games: GameCardGame[];
  detailPath?: (game: GameCardGame) => string;
  /** Replaces the default "no matches" state. */
  empty?: ReactNode;
};

const gridClass = "grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4";
const STAGGER_MS = 30;
const MAX_STAGGERED = 10;

export function GameGrid({ games, detailPath, empty }: GameGridProps) {
  if (games.length === 0) {
    return (
      <>
        {empty ?? (
          <EmptyState
            compact
            icon={SearchX}
            title="No games match this view"
            description="Try a different search or filter."
          />
        )}
      </>
    );
  }

  return (
    <div className={gridClass}>
      {games.map((game, index) => (
        <GameCard
          detailPath={detailPath ? detailPath(game) : undefined}
          game={game}
          key={game.id}
          style={{ animationDelay: `${Math.min(index, MAX_STAGGERED) * STAGGER_MS}ms` }}
        />
      ))}
    </div>
  );
}

export function GameGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={gridClass} aria-busy="true" aria-label="Loading games">
      {Array.from({ length: count }, (_, index) => (
        <div className="surface overflow-hidden" key={index}>
          <div className="skeleton aspect-[16/10] rounded-none" />
          <div className="space-y-2.5 p-4">
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-3 w-1/3" />
            <div className="flex justify-between pt-2">
              <div className="skeleton h-3 w-1/4" />
              <div className="skeleton h-8 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
