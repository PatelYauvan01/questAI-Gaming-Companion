import { FolderPlus, Gamepad2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Button } from "../components/common/Button";
import { GameGrid } from "../components/games/GameGrid";
import type { LayoutContext } from "../components/layout/MainLayout";

const filters = ["All", "Recently Played", "Favorites"] as const;
type LibraryFilter = (typeof filters)[number];

export function Library() {
  const [filter, setFilter] = useState<LibraryFilter>("All");
  const [localSearch, setLocalSearch] = useState("");
  const { addGame, games: libraryGames, importSteamLibrary, isLibraryLoading, libraryError, search, setLibraryError } =
    useOutletContext<LayoutContext>();
  const [steamImportMessage, setSteamImportMessage] = useState<string | null>(null);

  const handleSteamImport = async () => {
    const count = await importSteamLibrary();
    setSteamImportMessage(
      count === 0
        ? "No new installed Steam games were found."
        : `${count} Steam ${count === 1 ? "game was" : "games were"} added to your library.`,
    );
  };

  const filteredGames = useMemo(() => {
    const normalizedSearch = `${search} ${localSearch}`.trim().toLowerCase();
    return libraryGames.filter((game) => {
      const matchesSearch = `${game.title} ${game.executableFilename} ${game.executablePath} ${
        game.genre ?? ""
      }`
        .toLowerCase()
        .includes(normalizedSearch);
      const matchesFilter =
        filter === "All" ||
        (filter === "Favorites" && game.favorite) ||
        (filter === "Recently Played" && game.lastPlayed !== null);

      return matchesSearch && matchesFilter;
    });
  }, [filter, libraryGames, localSearch, search]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-4xl font-bold text-white">My Library</h1>
          <p className="mt-2 text-slate-400">
            {libraryGames.length} {libraryGames.length === 1 ? "game" : "games"} imported from this PC.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => void handleSteamImport()}>
            <Gamepad2 className="h-4 w-4" /> Import Steam Library
          </Button>
          <Button onClick={addGame}>
            <FolderPlus className="h-4 w-4" /> Add Game
          </Button>
        </div>
      </header>

      {libraryError ? (
        <div className="flex items-start justify-between gap-4 rounded-lg border border-red-500/35 bg-red-500/10 p-4 text-sm text-red-100">
          <span>{libraryError}</span>
          <button
            className="font-semibold text-red-200 hover:text-white"
            onClick={() => setLibraryError(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {steamImportMessage ? (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-slate-200">
          <span>{steamImportMessage}</span>
          <button
            className="font-semibold text-accent hover:text-white"
            onClick={() => setSteamImportMessage(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <label className="relative block max-w-xl">
        <span className="sr-only">Search imported games</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          className="h-11 w-full rounded-lg border border-line bg-card pl-10 pr-4 text-sm text-white placeholder:text-slate-500 transition focus:border-accent"
          onChange={(event) => setLocalSearch(event.currentTarget.value)}
          placeholder="Search by title, executable, or path..."
          value={localSearch}
        />
      </label>

      <div className="flex flex-wrap gap-2 rounded-lg border border-line bg-card p-2">
        {filters.map((item) => (
          <button
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              filter === item
                ? "bg-accent text-slate-950"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
            key={item}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {isLibraryLoading ? (
        <div className="rounded-lg border border-line bg-card p-8 text-center text-slate-400">
          Loading your library...
        </div>
      ) : libraryGames.length === 0 ? (
        <section className="rounded-lg border border-dashed border-line bg-card p-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-accent/10 text-accent">
            <FolderPlus className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-white">Import your first game</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Select a Windows executable from an installed game. QuestAI stores only
            metadata and never modifies the game files.
          </p>
          <Button className="mt-6" onClick={addGame}>
            <FolderPlus className="h-4 w-4" /> Add Game
          </Button>
        </section>
      ) : (
        <GameGrid games={filteredGames} />
      )}
    </div>
  );
}
