import { useEffect, useState } from "react";
import { mockGames } from "../../data/mockGames";

type GameVisual = {
  title: string;
  artwork?: string | null;
  imageUrl?: string | null;
  artworkPath?: string | null;
};

type GameArtworkProps = {
  game: GameVisual;
  className?: string;
  /** Extra classes for the <img>, e.g. hover zoom driven by a parent `group`. */
  imageClassName?: string;
  /** Show the title over the artwork (used by large heroes). */
  showTitle?: boolean;
  /** Back-compat: `compact` hides the title overlay. */
  compact?: boolean;
};

function resolveImage(game: GameVisual): string | null {
  // Support mock data (`imageUrl`) and imported games (`artworkPath`).
  let rawImage = game.imageUrl ?? game.artworkPath ?? null;

  // Imported games without artwork reuse a matching sample cover by title.
  if (!rawImage && game.title) {
    const match = mockGames.find((m) => m.title.toLowerCase() === game.title.toLowerCase());
    rawImage = match?.imageUrl ?? null;
  }
  if (!rawImage) return null;

  if (/^https?:\/\//i.test(rawImage)) return rawImage;
  // Normalize Windows / absolute paths to file:// URLs.
  if (/^[a-zA-Z]:\\|^\\\\/.test(rawImage) || rawImage.startsWith("/")) {
    const normalized = rawImage.replace(/\\/g, "/").replace(/^\/+/, "");
    return encodeURI(`file:///${normalized}`);
  }
  return rawImage;
}

export function GameArtwork({ game, className = "", imageClassName = "", showTitle, compact = false }: GameArtworkProps) {
  const gradient = game.artwork ?? "from-teal-400/25 via-slate-800 to-zinc-950";
  const resolvedUrl = resolveImage(game);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const withTitle = showTitle ?? !compact;

  // Reset load state when the same component instance shows a different game.
  useEffect(() => {
    setLoadedUrl(null);
  }, [resolvedUrl]);

  const showImage = !!resolvedUrl && failedUrl !== resolvedUrl;
  const initial = game.title.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      aria-label={`${game.title} artwork`}
      role="img"
      className={`${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
    >
      {!showImage ? (
        // Monogram fallback so cards without art still look intentional.
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center text-[clamp(2rem,8vw,4.5rem)] font-black text-white/[0.07]"
        >
          {initial}
        </span>
      ) : null}
      {showImage ? (
        <img
          alt=""
          src={resolvedUrl}
          draggable={false}
          onLoad={() => setLoadedUrl(resolvedUrl)}
          onError={() => setFailedUrl(resolvedUrl)}
          className={`absolute inset-0 h-full w-full object-cover transition duration-500 ease-out ${
            loadedUrl === resolvedUrl ? "opacity-100" : "opacity-0"
          } ${imageClassName}`}
        />
      ) : null}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      {withTitle ? (
        <div className="absolute bottom-5 left-5 right-5">
          <p className="eyebrow">QuestAI ready</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{game.title}</p>
        </div>
      ) : null}
    </div>
  );
}
