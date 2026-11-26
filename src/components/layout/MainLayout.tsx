import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  importGameFromPath,
  importSteamGames,
  listGames,
  selectExecutable,
  updateGame,
} from "../../services/gameLibrary";
import type { GameUpdate, ImportedGame } from "../../types/game";
import { Notice } from "../common/Notice";
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
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

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

  // Each route starts at the top (the scroll container is <main>, not the window).
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

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
    <div className="flex h-full min-h-0 bg-shell text-ink-1">
      <Sidebar games={games} onAddGame={addGame} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar search={search} onSearchChange={setSearch} />
        <main ref={mainRef} className="relative min-h-0 flex-1 overflow-y-auto">
          {/* Soft ambient light behind content; decorative only. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_100%_at_20%_0%,rgba(45,212,191,0.07),transparent)]"
          />
          <div className="relative mx-auto w-full max-w-[1400px] px-6 py-7 xl:px-8">
            {/* Library errors surface on every page, not just Library. */}
            {libraryError ? (
              <div className="mb-6">
                <Notice onDismiss={() => setLibraryError(null)}>{libraryError}</Notice>
              </div>
            ) : null}
            {/* Keyed on the path so each navigation gets a quick enter transition. */}
            <div key={location.pathname} className="animate-rise">
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
          </div>
        </main>
      </div>
    </div>
  );
}
