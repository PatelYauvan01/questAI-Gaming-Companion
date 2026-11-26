import { useState } from "react";
import { mockGames } from "../../data/mockGames";

type GameVisual = {
  title: string;
  artwork?: string | null;
  imageUrl?: string | null;
};

type GameArtworkProps = {
  game: GameVisual;
  className?: string;
  compact?: boolean;
};

export function GameArtwork({ game, className = "", compact = false }: GameArtworkProps) {
  const artwork = game.artwork ?? "from-teal-400/25 via-slate-800 to-zinc-950";
  // support multiple possible image sources: `imageUrl` (mock data), or `artworkPath` (imported library)
  const anyGame = game as unknown as Record<string, unknown>;
  let rawImage = (anyGame.imageUrl as string) ?? (anyGame.artworkPath as string) ?? null;

  // If there's no artwork for an imported game, try to reuse the mockGames
  // cover images by matching on title (case-insensitive). This provides a
  // sensible default for common demo titles.
  if (!rawImage) {
    const title = (anyGame.title as string) ?? "";
    if (title) {
      const match = mockGames.find((m) => m.title.toLowerCase() === title.toLowerCase());
      if (match && match.imageUrl) {
        rawImage = match.imageUrl;
      }
    }
  }

  const [imageFailed, setImageFailed] = useState(false);

  // normalize Windows paths to file:// URLs when appropriate
  let resolvedUrl: string | null = null;
  if (rawImage) {
    const isHttp = /^https?:\/\//i.test(rawImage);
    const isFileLike = /^[a-zA-Z]:\\|^\\\\/.test(rawImage) || rawImage.startsWith("/");
    if (isHttp) {
      resolvedUrl = rawImage;
    } else if (isFileLike) {
      const forward = rawImage.replace(/\\/g, "/");
      // ensure no leading slashes before adding file:///
      const normalized = forward.replace(/^\/+/, "");
      resolvedUrl = encodeURI(`file:///${normalized}`);
    } else {
      resolvedUrl = rawImage;
    }
  }

  const showImage = !!resolvedUrl && !imageFailed;

  return (
    <div
      aria-label={`${game.title} artwork`}
      role="img"
      className={`relative overflow-hidden ${showImage ? "" : "bg-gradient-to-br " + artwork} ${className}`}
    >
      {showImage ? (
        // use an <img> so we can detect load errors and fallback gracefully
        // eslint-disable-next-line jsx-a11y/alt-text
        <img
          src={resolvedUrl!}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.22),transparent_18rem)]" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 to-transparent" />
      <div className="absolute right-4 top-4 h-16 w-16 rounded-full border border-white/10 bg-white/10 blur-xl" />
      {!compact ? (
        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            QuestAI Ready
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{game.title}</p>
        </div>
      ) : null}
    </div>
  );
}

