import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { GameArtwork } from "./GameArtwork";
import { Button } from "../common/Button";
import { launchGame } from "../../services/gameLibrary";
import { useState } from "react";

export type GameCardGame = {
  id: string;
  title: string;
  favorite: boolean;
  artwork?: string | null;
  genre?: string | null;
  lastPlayed?: string | number | null;
  playtime?: string | null;
  executableFilename?: string;
  executablePath?: string;
};

type GameCardProps = {
  game: GameCardGame;
  detailPath?: string;
};

export function GameCard({ game, detailPath }: GameCardProps) {
  const metadata = game.genre ?? game.executableFilename ?? "Imported game";
  const footerLeft =
    typeof game.lastPlayed === "number"
      ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
          new Date(game.lastPlayed),
        )
      : game.lastPlayed ?? game.executablePath ?? "Ready in library";
  const footerRight = game.playtime ?? "Manual import";

  return (
    <Link
      to={detailPath ?? `/game/${game.id}`}
      className="group block rounded-lg border border-line bg-card transition duration-200 hover:-translate-y-1 hover:border-accent/45 hover:bg-[#19212c]"
    >
      <GameArtwork game={game} compact className="aspect-[16/10] rounded-t-lg" />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white group-hover:text-accent">
              {game.title}
            </h3>
            <p className="mt-1 truncate text-sm text-slate-400">{metadata}</p>
          </div>
          <Heart
            aria-label={game.favorite ? "Favorite game" : "Not favorited"}
            className={`h-5 w-5 shrink-0 ${
              game.favorite ? "fill-accent text-accent" : "text-slate-500"
            }`}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="truncate">{footerLeft}</span>
          <span className="ml-3 shrink-0">{footerRight}</span>
        </div>
        <div className="mt-3 flex justify-end">
          <PlayButton
            path={game.executablePath ?? ""}
            title={game.title}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </Link>
  );
}

function PlayButton({
  path,
  // title,
  onClick,
}: {
  path: string;
  title: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!path) return;
    setIsLaunching(true);
    setError(null);
    try {
      const pid = await launchGame(path);
      console.log("Launched from card pid=", pid);
      if (pid && pid > 0) setIsPlaying(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="secondary"
        className="px-3 py-1 text-sm"
        onClick={(e) => {
          onClick?.(e);
          void handleClick(e as React.MouseEvent);
        }}
        disabled={isPlaying}
      >
        {isPlaying ? "Playing" : isLaunching ? "Launching..." : "Play"}
      </Button>
      {error ? <div className="text-xs text-red-400">{error}</div> : null}
    </div>
  );
}
