import { FolderPlus, Gamepad2, Heart, History, Library as LibraryIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Button } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { Notice } from "../components/common/Notice";
import { PageHeader } from "../components/common/PageHeader";
import { Segmented } from "../components/common/Segmented";
import { GameGrid, GameGridSkeleton } from "../components/games/GameGrid";
import type { LayoutContext } from "../components/layout/MainLayout";

type LibraryFilter = "All" | "Recently Played" | "Favorites";

export function Library() {
  const [filter, setFilter] = useState<LibraryFilter>("All");
  const { addGame, games: libraryGames, importSteamLibrary, isLibraryLoading, search } =
    useOutletContext<LayoutContext>();
  const [steamImportMessage, setSteamImportMessage] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleSteamImport = async () => {
    setIsImporting(true);
    try {
      const count = await importSteamLibrary();
      setSteamImportMessage(
        count === 0
          ? "No new installed Steam games were found."
          : `${count} Steam ${count === 1 ? "game was" : "games were"} added to your library.`,
      );
    } finally {
      setIsImporting(false);
    }
  };

  const searched = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return libraryGames.filter((game) =>
      `${game.title} ${game.executableFilename} ${game.executablePath} ${game.genre ?? ""}`
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [libraryGames, search]);

  const counts = useMemo(
    () => ({
      All: searched.length,
      "Recently Played": searched.filter((game) => game.lastPlayed != null).length,
      Favorites: searched.filter((game) => game.favorite).length,
    }),
    [searched],
  );

  const filteredGames = useMemo(() => {
    if (filter === "Favorites") return searched.filter((game) => game.favorite);
    if (filter === "Recently Played") {
      return searched
        .filter((game) => game.lastPlayed != null)
        .sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0));
    }
    return searched;
  }, [filter, searched]);

  const filterEmpty =
    filter === "Favorites" ? (
      <EmptyState compact icon={Heart} title="No favorites here" description="Open a game and mark it as a favorite to pin it." />
    ) : filter === "Recently Played" ? (
      <EmptyState compact icon={History} title="Nothing played yet" description="Games you launch from QuestAI will show up here." />
    ) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Library"
        title="My Library"
        description={
          isLibraryLoading
            ? "Loading your games…"
            : `${libraryGames.length} ${libraryGames.length === 1 ? "game" : "games"} on this PC. QuestAI stores only metadata and never modifies game files.`
        }
        actions={
          <>
            <Button disabled={isImporting} onClick={() => void handleSteamImport()} variant="secondary">
              <Gamepad2 className="h-4 w-4" /> {isImporting ? "Importing…" : "Import Steam Library"}
            </Button>
            <Button onClick={addGame}>
              <FolderPlus className="h-4 w-4" /> Add Game
            </Button>
          </>
        }
      />

      {steamImportMessage ? (
        <Notice tone="success" onDismiss={() => setSteamImportMessage(null)}>
          {steamImportMessage}
        </Notice>
      ) : null}

      {isLibraryLoading ? (
        <GameGridSkeleton count={8} />
      ) : libraryGames.length === 0 ? (
        <EmptyState
          icon={LibraryIcon}
          title="Import your first game"
          description="Pick a game executable from this PC or import every installed Steam game at once."
          actions={
            <>
              <Button onClick={addGame}>
                <FolderPlus className="h-4 w-4" /> Add Game
              </Button>
              <Button onClick={() => void handleSteamImport()} variant="secondary">
                <Gamepad2 className="h-4 w-4" /> Import Steam Library
              </Button>
            </>
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented
              label="Filter games"
              onChange={setFilter}
              options={(["All", "Recently Played", "Favorites"] as const).map((value) => ({
                value,
                label: value,
                count: counts[value],
              }))}
              value={filter}
            />
            {search.trim() ? (
              <p className="text-sm text-ink-3">
                Filtered by “<span className="text-ink-1">{search.trim()}</span>”
              </p>
            ) : null}
          </div>
          {/* Re-key on filter so the grid re-runs its staggered entrance. */}
          <div key={filter}>
            <GameGrid empty={filterEmpty} games={filteredGames} />
          </div>
        </>
      )}
    </div>
  );
}
