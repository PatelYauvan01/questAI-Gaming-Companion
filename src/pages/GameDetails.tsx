import { confirm } from "@tauri-apps/plugin-dialog";
import {
  ArrowUp, CalendarDays, FileCode2, Heart, Loader2, PanelsTopLeft, Play, RotateCcw, Sparkles, Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Notice } from "../components/common/Notice";
import { FormattedGuideText } from "../components/guide/FormattedGuideText";
import { GameArtwork } from "../components/games/GameArtwork";
import { GameBadge } from "../components/games/GameBadge";
import type { LayoutContext } from "../components/layout/MainLayout";
import { askGameGuide, getSuggestedQuestions, showGuideOverlay, type GuideMessage } from "../services/gameGuide";
import { launchGame, removeGame } from "../services/gameLibrary";

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

function errorText(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function DetailsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading game details">
      <div className="skeleton h-[340px] rounded-2xl" />
      <div className="skeleton h-[420px] rounded-xl" />
    </div>
  );
}

export function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { games, isLibraryLoading, replaceGames, setLibraryError, updateLibraryGame } =
    useOutletContext<LayoutContext>();
  const game = useMemo(() => games.find((item) => item.id === id), [games, id]);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [isGuideLoading, setIsGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const suggestedQuestions = useMemo(() => getSuggestedQuestions(game?.title ?? ""), [game?.title]);

  useEffect(() => {
    setActionError(null);
    setMessages([]);
    setGuideError(null);
    setQuestion("");
    setIsPlaying(false);
  }, [game?.id]);

  // The overlay opens on whichever game was viewed last.
  useEffect(() => {
    if (game?.id) localStorage.setItem("questai.active-game", game.id);
  }, [game?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isGuideLoading]);

  if (isLibraryLoading) {
    return <DetailsSkeleton />;
  }

  if (!game) {
    return <Navigate to="/library" replace />;
  }

  async function handleFavorite() {
    if (!game) return;
    try {
      await updateLibraryGame(game.id, { favorite: !game.favorite });
      setLibraryError(null);
    } catch (error) {
      setLibraryError(errorText(error));
    }
  }

  async function handleLaunch() {
    if (!game) return;
    setIsLaunching(true);
    setActionError(null);
    try {
      const pid = await launchGame(game.executablePath);
      if (pid && pid > 0) setIsPlaying(true);
    } catch (error) {
      setActionError(errorText(error));
    } finally {
      setIsLaunching(false);
    }
  }

  async function handleOpenOverlay() {
    setActionError(null);
    try {
      await showGuideOverlay();
    } catch (error) {
      setActionError(errorText(error));
    }
  }

  async function handleRemove() {
    if (!game) return;
    const shouldRemove = await confirm(
      `Remove "${game.title}" from QuestAI? This will only delete QuestAI metadata and will not touch the game files.`,
      { title: "Remove from Library", kind: "warning" },
    );
    if (!shouldRemove) return;

    setIsRemoving(true);
    try {
      const remainingGames = await removeGame(game.id);
      replaceGames(remainingGames);
      setLibraryError(null);
      navigate("/library");
    } catch (error) {
      setLibraryError(errorText(error));
    } finally {
      setIsRemoving(false);
    }
  }

  async function ask(prompt: string) {
    if (!game) return;
    const trimmed = prompt.trim();
    if (!trimmed || isGuideLoading) return;

    const nextMessages: GuideMessage[] = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setQuestion("");
    setGuideError(null);
    setIsGuideLoading(true);

    try {
      const response = await askGameGuide({
        gameTitle: game.title,
        question: trimmed,
        recentConversation: nextMessages,
      });
      setMessages((currentMessages) => [...currentMessages, { role: "assistant", text: response.answer }]);
    } catch (error) {
      setGuideError(errorText(error));
      setMessages(nextMessages);
    } finally {
      setIsGuideLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleAskGuide(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    void ask(question);
  }

  function clearConversation() {
    setMessages([]);
    setGuideError(null);
    setQuestion("");
  }

  const hasConversation = messages.length > 0 || isGuideLoading;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative isolate overflow-hidden rounded-2xl border border-line bg-card shadow-card">
        <GameArtwork compact className="absolute inset-0 -z-20 scale-110 opacity-60 blur-2xl saturate-150" game={game} />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-card via-card/90 to-card/60" />
        <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:p-6">
          <GameArtwork
            compact
            className="aspect-[16/10] rounded-xl border border-white/10 shadow-lift lg:aspect-auto lg:min-h-[300px]"
            game={game}
          />
          <div className="flex min-w-0 flex-col justify-between gap-6 py-1">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap gap-1.5">
                <GameBadge tone="accent">
                  <Sparkles className="h-3 w-3" /> Guide ready
                </GameBadge>
                <GameBadge>{game.genre || "Uncategorized"}</GameBadge>
                {game.favorite ? (
                  <GameBadge>
                    <Heart className="h-3 w-3 fill-current text-accent" /> Favorite
                  </GameBadge>
                ) : null}
              </div>
              <h1 className="break-words text-4xl font-semibold tracking-tight text-white xl:text-5xl">{game.title}</h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-ink-2">
                {game.description || "Ask the AI guide below for strategies, objectives, and mechanics, or open the overlay while you play."}
              </p>
              <dl className="mt-5 grid gap-x-6 gap-y-2 text-xs text-ink-3 sm:grid-cols-2">
                <div className="flex min-w-0 items-center gap-2" title={game.executablePath}>
                  <FileCode2 className="h-3.5 w-3.5 shrink-0" />
                  <dt className="sr-only">Executable</dt>
                  <dd className="truncate">{game.executableFilename}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  <dt className="sr-only">Imported</dt>
                  <dd>Added {dateFormat.format(new Date(game.importDate))}</dd>
                </div>
              </dl>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button disabled={isLaunching || isPlaying} onClick={() => void handleLaunch()} size="lg">
                  {isLaunching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                  {isPlaying ? "Playing" : isLaunching ? "Launching…" : "Play"}
                </Button>
                <Button
                  onClick={() => void handleOpenOverlay()}
                  size="lg"
                  title="Toggle anytime with Alt+Shift+Q"
                  variant="secondary"
                >
                  <PanelsTopLeft className="h-4 w-4" /> Guide Overlay
                </Button>
                <Button
                  aria-pressed={game.favorite}
                  onClick={() => void handleFavorite()}
                  size="lg"
                  variant="secondary"
                >
                  <Heart
                    className={`h-4 w-4 transition-transform duration-200 ${game.favorite ? "scale-110 fill-accent text-accent" : ""}`}
                  />
                  {game.favorite ? "Favorited" : "Favorite"}
                </Button>
                <Button
                  className="ml-auto"
                  disabled={isRemoving}
                  onClick={() => void handleRemove()}
                  size="lg"
                  title="Remove from library (game files are not touched)"
                  variant="danger"
                >
                  <Trash2 className="h-4 w-4" /> {isRemoving ? "Removing…" : "Remove"}
                </Button>
              </div>
              {actionError ? <Notice onDismiss={() => setActionError(null)}>{actionError}</Notice> : null}
            </div>
          </div>
        </div>
      </section>

      {/* AI guide */}
      <section className="surface flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
              <Sparkles className="h-[18px] w-[18px]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-ink-1">AI Game Guide</h2>
              <p className="truncate text-xs text-ink-3">Strategies, objectives, and mechanics for {game.title}</p>
            </div>
          </div>
          <Button
            disabled={messages.length === 0 && !guideError && !question}
            onClick={clearConversation}
            size="sm"
            variant="ghost"
          >
            <RotateCcw className="h-3.5 w-3.5" /> New chat
          </Button>
        </div>

        <div
          aria-live="polite"
          className="max-h-[460px] min-h-[220px] space-y-4 overflow-y-auto px-5 py-5"
          ref={scrollRef}
        >
          {!hasConversation ? (
            <div className="animate-rise">
              <p className="text-sm text-ink-2">
                Ask anything about <strong className="font-semibold text-ink-1">{game.title}</strong>, or start with one of these:
              </p>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {suggestedQuestions.map((prompt, index) => (
                  <button
                    className="group flex animate-rise items-center justify-between gap-3 rounded-lg border border-line bg-panel px-4 py-3 text-left text-sm text-ink-2 transition duration-150 hover:border-accent/35 hover:bg-accent/[0.05] hover:text-ink-1"
                    key={prompt}
                    onClick={() => void ask(prompt)}
                    style={{ animationDelay: `${index * 40}ms` }}
                    type="button"
                  >
                    {prompt}
                    <ArrowUp className="h-4 w-4 shrink-0 rotate-45 text-ink-3 transition duration-150 group-hover:text-accent" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message, index) => (
            <div
              className={`flex animate-rise ${message.role === "user" ? "justify-end" : "justify-start"}`}
              key={`${message.role}-${index}`}
            >
              {message.role === "user" ? (
                <div className="max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-sm font-medium leading-6 text-accent-ink">
                  {message.text}
                </div>
              ) : (
                <div className="max-w-[88%] rounded-2xl rounded-tl-md border border-line bg-panel px-4 pb-1.5 pt-3 text-sm leading-7 text-ink-2">
                  <p className="mb-1 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.12em] text-accent">
                    <Sparkles className="h-3 w-3" /> QuestAI
                  </p>
                  <FormattedGuideText text={message.text} />
                </div>
              )}
            </div>
          ))}

          {isGuideLoading ? (
            <div className="flex animate-rise justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-line bg-panel px-4 py-3 text-sm text-ink-3">
                <span className="flex gap-1" aria-hidden="true">
                  {[0, 150, 300].map((delay) => (
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent"
                      key={delay}
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </span>
                QuestAI is thinking…
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-3 border-t border-line bg-panel/50 px-5 py-4">
          {hasConversation ? (
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {suggestedQuestions.map((prompt) => (
                <button
                  className="shrink-0 rounded-full border border-line px-3 py-1 text-xs text-ink-3 transition hover:border-accent/35 hover:text-ink-1 disabled:pointer-events-none disabled:opacity-45"
                  disabled={isGuideLoading}
                  key={prompt}
                  onClick={() => void ask(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          {guideError ? <Notice onDismiss={() => setGuideError(null)}>{guideError}</Notice> : null}

          <form
            className="flex items-end gap-2 rounded-xl border border-line-strong bg-shell/60 p-2 transition duration-150 focus-within:border-accent/60 focus-within:ring-4 focus-within:ring-accent/10"
            onSubmit={handleAskGuide}
          >
            <label className="sr-only" htmlFor="guide-question">Ask the game guide</label>
            <textarea
              className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-ink-1 outline-none placeholder:text-ink-3"
              id="guide-question"
              onChange={(event) => setQuestion(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleAskGuide();
                }
              }}
              placeholder={`Ask about strategy, mechanics, items, or progression in ${game.title}…`}
              ref={inputRef}
              rows={1}
              value={question}
            />
            <Button
              aria-label="Send question"
              className="h-10 w-10 !px-0"
              disabled={isGuideLoading || !question.trim()}
              type="submit"
            >
              {isGuideLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </Button>
          </form>
          <p className="text-2xs text-ink-3">
            <kbd className="kbd">Enter</kbd> to send · <kbd className="kbd">Shift</kbd> + <kbd className="kbd">Enter</kbd> for a new line
          </p>
        </div>
      </section>
    </div>
  );
}
