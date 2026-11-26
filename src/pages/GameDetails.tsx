import { confirm } from "@tauri-apps/plugin-dialog";
import { Heart, Send, Sparkles, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Button } from "../components/common/Button";
import { GameBadge } from "../components/games/GameBadge";
import { GameArtwork } from "../components/games/GameArtwork";
import type { LayoutContext } from "../components/layout/MainLayout";
import { askGameGuide, getSuggestedQuestions, type GuideMessage } from "../services/gameGuide";
import { removeGame, launchGame } from "../services/gameLibrary";

// function formatDate(timestamp: number) {
//   return new Intl.DateTimeFormat(undefined, {
//     dateStyle: "medium",
//     timeStyle: "short",
//   }).format(new Date(timestamp));
// }

function formatAssistantText(text: string) {
  const blocks = text.split(/\n{2,}/).filter((block) => block.trim().length > 0);

  return blocks.map((block, blockIndex) => {
    const lines = block.split("\n").map((line) => line.trimEnd());
    const numListMatch = lines.every((line) => /^\d+\.\s/.test(line));
    const bulletListMatch = lines.every((line) => /^[-*]\s/.test(line));

    const content = lines.map((line, lineIndex) => {
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={`${blockIndex}-${lineIndex}`} className="mb-2 ml-6 list-decimal text-slate-200">
            {line.replace(/^\d+\.\s/, "")}
          </li>
        );
      }
      if (/^[-*]\s/.test(line)) {
        return (
          <li key={`${blockIndex}-${lineIndex}`} className="mb-2 ml-6 list-disc text-slate-200">
            {line.replace(/^[-*]\s/, "")}
          </li>
        );
      }

      return (
        <p key={`${blockIndex}-${lineIndex}`} className="mb-2 text-slate-200">
          {line
            .split(/(\*\*.*?\*\*|`[^`]+`)/g)
            .filter(Boolean)
            .map((segment, segmentIndex) => {
              if (segment.startsWith("**") && segment.endsWith("**")) {
                return (
                  <strong key={`${blockIndex}-${lineIndex}-${segmentIndex}`} className="font-semibold text-white">
                    {segment.slice(2, -2)}
                  </strong>
                );
              }
              if (segment.startsWith("`") && segment.endsWith("`")) {
                return (
                  <code key={`${blockIndex}-${lineIndex}-${segmentIndex}`} className="rounded bg-slate-800 px-1 py-0.5 text-teal-200">
                    {segment.slice(1, -1)}
                  </code>
                );
              }
              return <span key={`${blockIndex}-${lineIndex}-${segmentIndex}`}>{segment}</span>;
            })}
        </p>
      );
    });

    if (numListMatch) {
      return <ol key={blockIndex}>{content}</ol>;
    }
    if (bulletListMatch) {
      return <ul key={blockIndex}>{content}</ul>;
    }
    return <div key={blockIndex}>{content}</div>;
  });
}

export function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    games,
    isLibraryLoading,
    replaceGames,
    setLibraryError,
    updateLibraryGame,
  } = useOutletContext<LayoutContext>();
  const game = useMemo(() => games.find((item) => item.id === id), [games, id]);
  // const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [isGuideLoading, setIsGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const suggestedQuestions = useMemo(() => getSuggestedQuestions(game?.title ?? ""), [game?.title]);

  useEffect(() => {
    setLaunchError(null);
    setMessages([]);
    setGuideError(null);
    setQuestion("");
    setIsPlaying(false);
  }, [game?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isGuideLoading]);

  if (isLibraryLoading) {
    return (
      <div className="rounded-lg border border-line bg-card p-8 text-center text-slate-400">
        Loading game details...
      </div>
    );
  }

  if (!game) {
    return <Navigate to="/library" replace />;
  }

  async function handleFavorite() {
    if (!game) {
      return;
    }

    try {
      await updateLibraryGame(game.id, { favorite: !game.favorite });
      setLibraryError(null);
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : String(error));
    }
  }

  async function handleLaunch() {
    if (!game) return;
    setIsLaunching(true);
    setLaunchError(null);
    try {
      const pid = await launchGame(game.executablePath);
      if (pid && pid > 0) {
        console.log(`Launched game pid=${pid}`);
        setIsPlaying(true);
      } else {
        console.warn("launch_game returned no pid");
      }
    } catch (error) {
      setLaunchError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLaunching(false);
    }
  }

  async function handleRemove() {
    if (!game) {
      return;
    }

    const shouldRemove = await confirm(
      `Remove "${game.title}" from QuestAI? This will only delete QuestAI metadata and will not touch the game files.`,
      { title: "Remove from Library", kind: "warning" },
    );

    if (!shouldRemove) {
      return;
    }

    setIsRemoving(true);
    try {
      const remainingGames = await removeGame(game.id);
      replaceGames(remainingGames);
      setLibraryError(null);
      navigate("/library");
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsRemoving(false);
    }
  }

  async function handleAskGuide(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!game) {
      return;
    }

    const trimmed = question.trim();

    if (!trimmed || isGuideLoading) {
      return;
    }

    const nextQuestion = trimmed;
    const userMessage: GuideMessage = { role: "user", text: nextQuestion };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setQuestion("");
    setGuideError(null);
    setIsGuideLoading(true);

    try {
      const response = await askGameGuide({
        gameTitle: game.title,
        question: nextQuestion,
        recentConversation: nextMessages,
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: "assistant", text: response.answer },
      ]);
    } catch (error) {
      setGuideError(error instanceof Error ? error.message : String(error));
      setMessages(nextMessages);
    } finally {
      setIsGuideLoading(false);
    }
  }

  function handleSuggestedQuestion(prompt: string) {
    setQuestion(prompt);
  }

  function clearConversation() {
    setMessages([]);
    setGuideError(null);
    setQuestion("");
  }

  return (
    <div className="space-y-7">
      <section className="grid overflow-hidden rounded-lg border border-line bg-card lg:grid-cols-[1fr_1.05fr]">
        <GameArtwork game={game} className="min-h-[380px]" />
        <div className="flex flex-col justify-between gap-8 p-8">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <GameBadge>{game.genre || "Uncategorized"}</GameBadge>
              <GameBadge>{game.executableFilename}</GameBadge>
              <GameBadge>Imported</GameBadge>
            </div>
            <h1 className="break-words text-5xl font-bold text-white">{game.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              {game.description ||
                "No description yet. Edit the details below to add your own notes."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleFavorite} variant="secondary">
              <Heart
                className={`h-4 w-4 ${game.favorite ? "fill-accent text-accent" : ""}`}
              />
              {game.favorite ? "Favorited" : "Favorite"}
            </Button>
            <Button disabled={isRemoving} onClick={handleRemove} variant="secondary">
              <Trash2 className="h-4 w-4" /> Remove from Library
            </Button>
            <Button
              className="ml-2"
              onClick={() => void handleLaunch()}
              disabled={isLaunching || isPlaying}
              variant="secondary"
            >
              {isPlaying ? "Playing" : isLaunching ? "Launching..." : "Play"}
            </Button>
            {launchError ? (
              <div className="w-full mt-2 text-sm text-red-400">{launchError}</div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">AI Game Guide</h2>
              <p className="text-sm text-slate-400">Ask about {game.title}</p>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10"
            onClick={clearConversation}
            type="button"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-line bg-black/20 p-3">
          <p className="text-sm text-slate-300">
            Welcome to the QuestAI guide for <strong className="font-semibold text-white">{game.title}</strong>. Ask a question and I’ll help with the next step.
          </p>
        </div>

        <div className="mb-4 grid gap-2 md:grid-cols-2">
          {suggestedQuestions.map((prompt) => (
            <button
              key={prompt}
              className="rounded-lg border border-line bg-white/5 px-3 py-2 text-left text-sm text-slate-200 transition hover:border-slate-500 hover:bg-white/10"
              onClick={() => handleSuggestedQuestion(prompt)}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div ref={scrollRef} className="max-h-[430px] space-y-3 overflow-y-auto rounded-xl border border-line bg-black/15 p-3">
          {messages.length === 0 && !isGuideLoading ? (
            <div className="rounded-lg border border-dashed border-line bg-white/5 p-4 text-sm text-slate-400">
              No guide messages yet. Ask your first question about {game.title}.
            </div>
          ) : null}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 ${
                  message.role === "user"
                    ? "bg-accent text-slate-950"
                    : "border border-line bg-slate-900/80 text-slate-100"
                }`}
              >
                {message.role === "assistant" ? formatAssistantText(message.text) : message.text}
              </div>
            </div>
          ))}

          {isGuideLoading ? (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-line bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                  QuestAI is thinking...
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {guideError ? (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            <div className="flex items-center justify-between gap-4">
              <span>{guideError}</span>
              <button
                className="rounded-md border border-red-400/40 px-2 py-1 text-xs font-semibold text-red-100 hover:bg-red-500/10"
                onClick={() => setGuideError(null)}
                type="button"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}

        <form className="mt-4 flex gap-3" onSubmit={handleAskGuide}>
          <textarea
            className="min-h-[96px] flex-1 rounded-xl border border-line bg-black/20 px-3 py-3 text-sm text-white placeholder:text-slate-500"
            onChange={(event) => setQuestion(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleAskGuide();
              }
            }}
            placeholder="Ask about strategy, mechanics, items, or progression..."
            value={question}
          />
          <Button
            className="h-fit self-end"
            disabled={isGuideLoading || !question.trim()}
            onClick={() => void handleAskGuide()}
            type="submit"
          >
            <Send className="h-4 w-4" />
            {isGuideLoading ? "Sending..." : "Send"}
          </Button>
        </form>
      </section>
    </div>
  );
}
