import { GameCard, type GameCardGame } from "./GameCard";

type GameGridProps = {
  games: GameCardGame[];
  detailPath?: (game: GameCardGame) => string;
};

export function GameGrid({ games, detailPath }: GameGridProps) {
  if (games.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-card p-8 text-center text-slate-400">
        No games match this view.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
      {games.map((game) => (
        <GameCard
          detailPath={detailPath ? detailPath(game) : undefined}
          game={game}
          key={game.id}
        />
      ))}
    </div>
  );
}
