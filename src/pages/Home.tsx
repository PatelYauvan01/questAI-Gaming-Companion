import { FolderPlus, Gamepad2, Loader2, PanelsTopLeft, Play, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Button, buttonClasses } from "../components/common/Button";
import { Notice } from "../components/common/Notice";
import { SectionHeader } from "../components/common/SectionHeader";
import { FeaturedGame } from "../components/games/FeaturedGame";
import { GameGrid, GameGridSkeleton } from "../components/games/GameGrid";
import type { LayoutContext } from "../components/layout/MainLayout";
import { showGuideOverlay } from "../services/gameGuide";
import { launchGame } from "../services/gameLibrary";
import type { ImportedGame } from "../types/game";

function matchesSearch(game: ImportedGame, query: string) {
  return `${game.title} ${game.executableFilename} ${game.executablePath} ${game.genre ?? ""}`
    .toLowerCase()
    .includes(query);
}

export function Home() {
  const { addGame, games, importSteamLibrary, isLibraryLoading, search } = useOutletContext<LayoutContext>();
  const [launchState, setLaunchState] = useState<{ id: string; status: "launching" | "playing" } | null>(null);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const normalizedSearch = search.trim().toLowerCase();

  const recentlyAdded = useMemo(
    () => [...games].sort((a, b) => b.importDate - a.importDate).slice(0, 4),
    [games],
  );
  const recentlyPlayed = useMemo(
    () =>
      games
        .filter((game) => game.lastPlayed)
        .sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0))
        .slice(0, 4),
    [games],
  );
  // Hero: the most recently played game, otherwise the newest import.
  const spotlight = recentlyPlayed[0] ?? recentlyAdded[0];
  const searchResults = useMemo(
    () => (normalizedSearch ? games.filter((game) => matchesSearch(game, normalizedSearch)) : []),
    [games, normalizedSearch],
  );

  async function playSpotlight() {
    if (!spotlight) return;
    setLaunchState({ id: spotlight.id, status: "launching" });
    setMessage(null);
    try {
      const pid = await launchGame(spotlight.executablePath);
      setLaunchState(pid && pid > 0 ? { id: spotlight.id, status: "playing" } : null);
    } catch (error) {
      setLaunchState(null);
      setMessage({ tone: "error", text: error instanceof Error ? error.message : String(error) });
    }
  }

  async function openOverlay() {
    try {
      await showGuideOverlay();
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : String(error) });
    }
  }

  async function handleSteamImport() {
    const count = await importSteamLibrary();
    setMessage({
      tone: "success",
      text:
        count === 0
          ? "No new installed Steam games were found."
          : `${count} Steam ${count === 1 ? "game was" : "games were"} added to your library.`,
    });
  }

  const spotlightStatus = launchState && spotlight && launchState.id === spotlight.id ? launchState.status : null;

  if (normalizedSearch) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title={`Results for “${search.trim()}”`}
          aside={`${searchResults.length} ${searchResults.length === 1 ? "game" : "games"}`}
        />
        <GameGrid games={searchResults} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {message ? (
        <Notice tone={message.tone} onDismiss={() => setMessage(null)}>
          {message.text}
        </Notice>
      ) : null}

      {isLibraryLoading ? (
        <div className="skeleton h-[300px] rounded-2xl" aria-label="Loading" />
      ) : spotlight ? (
        <FeaturedGame
          game={spotlight}
          eyebrow={spotlight.lastPlayed ? "Jump back in" : "Recently added"}
          badges={[spotlight.genre || "Imported", spotlight.executableFilename]}
          detailPath={`/game/${spotlight.id}`}
          linkLabel="Details"
          actions={
            <>
              <Button disabled={spotlightStatus !== null} onClick={() => void playSpotlight()} size="lg">
                {spotlightStatus === "launching" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
                {spotlightStatus === "playing" ? "Playing" : spotlightStatus === "launching" ? "Launching…" : "Play"}
              </Button>
              <Button onClick={() => void openOverlay()} size="lg" variant="secondary">
                <PanelsTopLeft className="h-4 w-4" /> Guide Overlay
              </Button>
            </>
          }
        />
      ) : (
        <section className="relative overflow-hidden rounded-2xl border border-line bg-card p-8 shadow-card lg:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
          />
          <p className="eyebrow">Welcome to QuestAI</p>
          <h1 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight text-ink-1">
            Your AI companion for every game you play.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink-3">
            Add your games, launch them from one place, and get instant guidance with the in-game
            overlay. Running Steam and non-Steam games are detected automatically.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={addGame} size="lg">
              <FolderPlus className="h-4 w-4" /> Add Game
            </Button>
            <Button onClick={() => void handleSteamImport()} size="lg" variant="secondary">
              <Gamepad2 className="h-4 w-4" /> Import Steam Library
            </Button>
          </div>
        </section>
      )}

      {isLibraryLoading ? (
        <section>
          <SectionHeader title="Recently Added" />
          <GameGridSkeleton />
        </section>
      ) : games.length > 0 ? (
        <>
          {recentlyPlayed.length > 0 ? (
            <section>
              <SectionHeader title="Recently Played" subtitle="Pick up where you left off." />
              <GameGrid games={recentlyPlayed} />
            </section>
          ) : null}
          <section>
            <SectionHeader
              title="Recently Added"
              subtitle="The newest games in your library."
              aside={
                games.length > recentlyAdded.length ? (
                  <Link className="font-medium text-accent transition hover:text-accent-strong" to="/library">
                    View all {games.length}
                  </Link>
                ) : null
              }
            />
            <GameGrid games={recentlyAdded} />
          </section>
        </>
      ) : null}

      <section className="surface flex flex-col justify-between gap-5 p-6 lg:flex-row lg:items-center">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink-1">Stuck in a game?</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-3">
              Press <kbd className="kbd">Alt</kbd> <kbd className="kbd">Shift</kbd> <kbd className="kbd">Q</kbd> in-game
              to open the guide overlay. It detects what you are playing and answers without making you leave it.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button onClick={() => void openOverlay()}>
            <PanelsTopLeft className="h-4 w-4" /> Open Guide Overlay
          </Button>
          <Link className={buttonClasses("secondary")} to={spotlight ? `/game/${spotlight.id}` : "/library"}>
            <Sparkles className="h-4 w-4" /> Ask in App
          </Link>
        </div>
      </section>
    </div>
  );
}
