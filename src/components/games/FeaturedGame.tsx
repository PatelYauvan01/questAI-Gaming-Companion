import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { buttonClasses } from "../common/Button";
import { GameArtwork } from "./GameArtwork";
import { GameBadge } from "./GameBadge";

type FeaturedGameProps = {
  game: {
    id: string;
    title: string;
    description?: string | null;
    artwork?: string | null;
    imageUrl?: string | null;
    artworkPath?: string | null;
  };
  eyebrow?: string;
  badges?: string[];
  detailPath?: string;
  /** Primary label for the link to `detailPath`; omit `detailPath` to hide it. */
  linkLabel?: string;
  /** Extra actions rendered after the primary link. */
  actions?: ReactNode;
};

/** Large hero card: artwork backdrop with title, description, and actions. */
export function FeaturedGame({
  game,
  eyebrow = "Featured",
  badges = [],
  detailPath,
  linkLabel = "Open Game",
  actions,
}: FeaturedGameProps) {
  return (
    <section className="group relative isolate overflow-hidden rounded-2xl border border-line bg-card shadow-card">
      <GameArtwork
        game={game}
        compact
        className="absolute inset-0 -z-10"
        imageClassName="scale-[1.02] group-hover:scale-[1.05]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-shell via-shell/85 to-shell/10"
      />
      <div className="flex min-h-[300px] max-w-2xl flex-col justify-end gap-6 p-7 lg:p-9">
        <div>
          {badges.length ? (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {badges.map((badge) => (
                <GameBadge key={badge}>{badge}</GameBadge>
              ))}
            </div>
          ) : null}
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white">{game.title}</h2>
          {game.description ? (
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-ink-2">{game.description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {actions}
          {detailPath ? (
            <Link className={buttonClasses(actions ? "secondary" : "primary")} to={detailPath}>
              {linkLabel} <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
