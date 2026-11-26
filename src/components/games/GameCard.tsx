import { Heart, Loader2, Play } from "lucide-react";
import { useState, type CSSProperties, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { launchGame } from "../../services/gameLibrary";
import { GameArtwork } from "./GameArtwork";

export type GameCardGame = {
  id: string;
  title: string;
  favorite: boolean;
  artwork?: string | null;
  artworkPath?: string | null;
  imageUrl?: string | null;
  genre?: string | null;
  lastPlayed?: string | number | null;
  playtime?: string | null;
  executableFilename?: string;
  executablePath?: string;
};

type GameCardProps = {
  game: GameCardGame;
  detailPath?: string;
  style?: CSSProperties;
};

const dateFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

export function GameCard({ game, detailPath, style }: GameCardProps) {
  const metadata = game.genre ?? game.executableFilename ?? "Imported game";
  const playedLabel =
    typeof game.lastPlayed === "number"
      ? `Played ${dateFormat.format(new Date(game.lastPlayed))}`
      : game.lastPlayed
        ? game.lastPlayed
        : game.executablePath
          ? "Not played yet"
          : null;

  return (
    <article
      style={style}
      className="surface group relative flex animate-rise flex-col overflow-hidden transition duration-200 ease-out focus-within:border-accent/50 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift"
    >
      <GameArtwork
        game={game}
        compact
        className="aspect-[16/10]"
        imageClassName="group-hover:scale-[1.04]"
      />
      {game.favorite ? (
        <span
          className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-black/45 text-accent backdrop-blur"
          title="Favorite"
        >
          <Heart aria-label="Favorite game" className="h-3.5 w-3.5 fill-current" />
        </span>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          {/* Stretched link: the whole card is clickable while the Play button stays a separate control. */}
          <Link
            to={detailPath ?? `/game/${game.id}`}
            className="block truncate font-semibold text-ink-1 outline-none transition-colors after:absolute after:inset-0 after:rounded-xl after:content-[''] group-hover:text-white"
            title={game.title}
          >
            {game.title}
          </Link>
          <p className="mt-0.5 truncate text-xs text-ink-3">{metadata}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="min-w-0 truncate text-2xs text-ink-3">
            {[playedLabel, game.playtime].filter(Boolean).join(" · ")}
          </span>
          {game.executablePath ? <PlayButton path={game.executablePath} title={game.title} /> : null}
        </div>
      </div>
    </article>
  );
}

function PlayButton({ path, title }: { path: string; title: string }) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsLaunching(true);
    setError(null);
    try {
      const pid = await launchGame(path);
      if (pid && pid > 0) setIsPlaying(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="relative z-10 flex shrink-0 flex-col items-end">
      <button
        aria-label={`Play ${title}`}
        className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold transition duration-150 active:scale-95 disabled:pointer-events-none ${
          isPlaying
            ? "border-accent/30 bg-accent/10 text-accent"
            : "border-line-strong bg-white/[0.04] text-ink-1 hover:border-transparent hover:bg-accent hover:text-accent-ink"
        }`}
        disabled={isPlaying || isLaunching}
        onClick={(event) => void handleClick(event)}
        title={error ?? undefined}
      >
        {isLaunching ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Play className="h-3.5 w-3.5 fill-current" />
        )}
        {isPlaying ? "Playing" : isLaunching ? "Launching" : "Play"}
      </button>
      {error ? (
        <span className="absolute right-0 top-full mt-1 w-48 text-right text-2xs text-red-300" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
