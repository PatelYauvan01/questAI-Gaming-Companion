import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  importGameFromPath,
  importSteamGames,
  listGames,
  selectExecutable,
  updateGame,
} from "../../services/gameLibrary";
import type { GameUpdate, ImportedGame } from "../../types/game";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export type LayoutContext = {
  search: string;
  games: ImportedGame[];
  isLibraryLoading: boolean;
  libraryError: string | null;
  addGame: () => Promise<void>;
  importSteamLibrary: () => Promise<number>;
  refreshGames: () => Promise<void>;
  setLibraryError: (message: string | null) => void;
  updateLibraryGame: (id: string, updates: GameUpdate) => Promise<ImportedGame>;
  replaceGames: (games: ImportedGame[]) => void;
};

export function MainLayout() {
  const [search, setSearch] = useState("");
  const [games, setGames] = useState<ImportedGame[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);
  const [libraryError, setLibraryError] = useState<string | null>(null);

  const refreshGames = useCallback(async () => {
    setIsLibraryLoading(true);
    try {
      const loadedGames = await listGames();
      setGames(loadedGames);
      setLibraryError(null);
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLibraryLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshGames();
  }, [refreshGames]);

  const addGame = useCallback(async () => {
    try {
      const selectedPath = await selectExecutable();
      if (!selectedPath) {
        return;
      }

      const importedGame = await importGameFromPath(selectedPath);
      setGames((currentGames) =>
        [...currentGames, importedGame].sort((left, right) =>
          left.title.localeCompare(right.title),
        ),
      );
      setLibraryError(null);
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : String(error));
    }
  }, []);

  const importSteamLibrary = useCallback(async () => {
    try {
      const importedGames = await importSteamGames();
      if (importedGames.length > 0) {
        setGames((currentGames) =>
          [...currentGames, ...importedGames].sort((left, right) =>
            left.title.localeCompare(right.title),
          ),
        );
      }
      setLibraryError(null);
      return importedGames.length;
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : String(error));
      return 0;
    }
  }, []);

  const updateLibraryGame = useCallback(
    async (id: string, updates: GameUpdate) => {
      const updatedGame = await updateGame(id, updates);
      setGames((currentGames) =>
        currentGames
          .map((game) => (game.id === id ? updatedGame : game))
          .sort((left, right) => left.title.localeCompare(right.title)),
      );
      return updatedGame;
    },
    [],
  );

  return (
    <div className="flex h-full min-h-0 bg-shell text-slate-100">
      <Sidebar games={games} onAddGame={addGame} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar search={search} onSearchChange={setSearch} />
        <main className="min-h-0 flex-1 overflow-y-auto bg-shell">
          <div className="mx-auto w-full max-w-[1500px] px-7 py-7">
            <Outlet
              context={{
                search,
                games,
                isLibraryLoading,
                libraryError,
                addGame,
                importSteamLibrary,
                refreshGames,
                setLibraryError,
                updateLibraryGame,
                replaceGames: setGames,
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
