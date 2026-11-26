import { FolderPlus, Heart, Library as LibraryIcon } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { Button, buttonClasses } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { PageHeader } from "../components/common/PageHeader";
import { GameGrid, GameGridSkeleton } from "../components/games/GameGrid";
import type { LayoutContext } from "../components/layout/MainLayout";

export function Favorites() {
  const { addGame, games, isLibraryLoading, search } = useOutletContext<LayoutContext>();
  const normalizedSearch = search.trim().toLowerCase();
  const allFavorites = games.filter((game) => game.favorite);
  const favoriteGames = allFavorites.filter((game) =>
    `${game.title} ${game.executableFilename} ${game.genre ?? ""}`.toLowerCase().includes(normalizedSearch),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Favorites"
        title="Favorites"
        description={
          allFavorites.length
            ? `${allFavorites.length} pinned ${allFavorites.length === 1 ? "game" : "games"}, ready to launch.`
            : "Pin the games you play most so they are one click away."
        }
      />

      {isLibraryLoading ? (
        <GameGridSkeleton />
      ) : games.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title="Your library is empty"
          description="Import a game before marking favorites."
          actions={
            <Button onClick={addGame}>
              <FolderPlus className="h-4 w-4" /> Add Game
            </Button>
          }
        />
      ) : allFavorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Open any game and select Favorite to pin it here."
          actions={
            <Link className={buttonClasses("secondary")} to="/library">
              <LibraryIcon className="h-4 w-4" /> Browse Library
            </Link>
          }
        />
      ) : (
        <GameGrid games={favoriteGames} />
      )}
    </div>
  );
}
