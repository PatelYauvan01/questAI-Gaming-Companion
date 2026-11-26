import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  ArrowUpRight, Check, ChevronDown, CornerDownLeft, Gamepad2, Radar, RotateCcw, Send,
  Sparkles, X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormattedGuideText } from "../guide/FormattedGuideText";
import { askGameGuide, getSuggestedQuestions, hideGuideOverlay, type GuideMessage } from "../../services/gameGuide";
import { detectRunningGame, listGames, type DetectedGame } from "../../services/gameLibrary";
import type { ImportedGame } from "../../types/game";
import { useOverlayDrag } from "./useOverlayDrag";

const ACTIVE_GAME_KEY = "questai.active-game";
const DETECTION_INTERVAL_MS = 3000;

function errorText(reason: unknown) {
  return reason instanceof Error ? reason.message : String(reason);
}

export function GuideOverlay() {
  const [games, setGames] = useState<ImportedGame[]>([]);
  const [detectedGame, setDetectedGame] = useState<DetectedGame | null>(null);
  const [isRunningNow, setIsRunningNow] = useState(false);
  const [gameId, setGameId] = useState(localStorage.getItem(ACTIVE_GAME_KEY) ?? "");
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGamePicker, setShowGamePicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const lastDetectedGameId = useRef("");
  const { onPointerDown: beginWindowDrag } = useOverlayDrag();

  const game = useMemo(
    () => games.find((item) => item.id === gameId) ?? (detectedGame?.id === gameId ? detectedGame : undefined),
    [games, gameId, detectedGame],
  );
  const isDetected = Boolean(isRunningNow && game && detectedGame?.id === game.id);
  const suggestions = useMemo(() => getSuggestedQuestions(game?.title ?? ""), [game?.title]);
  const libraryChoices = useMemo(() => games.filter((item) => item.id !== detectedGame?.id), [games, detectedGame?.id]);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setError("");
  }, []);

  useEffect(() => {
    document.body.classList.add("overlay-mode");
    void listGames().then(setGames).catch((reason) => setError(errorText(reason)));
    const currentWindow = getCurrentWindow();
    let cancelled = false;

    const refreshRunningGame = async () => {
      try {
        // Skip the process scan while the overlay is hidden so it costs nothing mid-game.
        if (!(await currentWindow.isVisible())) return;
        const running = await detectRunningGame();
        if (cancelled) return;
        setIsRunningNow(Boolean(running));
        if (!running) return;
        // Keep the last detected game selectable after it exits so its conversation survives.
        setDetectedGame(running);
        if (lastDetectedGameId.current !== running.id) {
          lastDetectedGameId.current = running.id;
          localStorage.setItem(ACTIVE_GAME_KEY, running.id);
          setGameId(running.id);
          setMessages([]);
        }
      } catch (reason) {
        if (!cancelled) setError(errorText(reason));
      }
    };

    void refreshRunningGame();
    const timer = window.setInterval(() => void refreshRunningGame(), DETECTION_INTERVAL_MS);
    const onFocus = () => {
      void refreshRunningGame();
      void listGames().then((list) => { if (!cancelled) setGames(list); }).catch(() => undefined);
      inputRef.current?.focus();
    };
    const syncGame = (event: StorageEvent) => {
      if (event.key === ACTIVE_GAME_KEY && event.newValue) {
        setGameId(event.newValue);
        setMessages([]);
      }
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", syncGame);
    return () => {
      cancelled = true;
      document.body.classList.remove("overlay-mode");
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", syncGame);
      window.clearInterval(timer);
    };
  }, []);

  // Esc closes the game picker first, then returns to the game.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (showGamePicker) setShowGamePicker(false);
      else void hideGuideOverlay();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showGamePicker]);

  useEffect(() => {
    if (!showGamePicker) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setShowGamePicker(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [showGamePicker]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function ask(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed || loading || !game) return;
    const nextMessages = [...messages, { role: "user" as const, text: trimmed }];
    setMessages(nextMessages);
    setQuestion("");
    setError("");
    setLoading(true);
    try {
      const response = await askGameGuide({ gameTitle: game.title, question: trimmed, recentConversation: nextMessages });
      setMessages((current) => [...current, { role: "assistant", text: response.answer }]);
    } catch (reason) {
      setError(errorText(reason));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function submitQuestion(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }

  function selectGame(id: string) {
    if (id !== gameId) {
      setGameId(id);
      localStorage.setItem(ACTIVE_GAME_KEY, id);
      resetConversation();
    }
    setShowGamePicker(false);
    inputRef.current?.focus();
  }

  const hasConversation = messages.length > 0 || loading;

  return (
    <section className="guide-overlay-root" aria-label="QuestAI game guide overlay">
      {/* Drag handle: pointer tracking + setPosition (see useOverlayDrag). Keep it on this header. */}
      <header className="overlay-titlebar" onPointerDown={beginWindowDrag} title="Drag to move">
        <span className="overlay-drag-grip" aria-hidden="true" />
        <div className="overlay-brand">
          <span className="overlay-brand-mark">Q</span>
          <span className="overlay-brand-name">QuestAI</span>
          <span className="overlay-brand-divider" aria-hidden="true" />
          <span className="overlay-brand-section">Guide</span>
        </div>
        <div className="overlay-window-actions">
          {hasConversation ? (
            <button aria-label="New conversation" title="New conversation" onClick={resetConversation} disabled={loading}>
              <RotateCcw size={14} />
            </button>
          ) : null}
          <button aria-label="Back to game" title="Back to game (Esc)" onClick={() => void hideGuideOverlay()}>
            <X size={16} />
          </button>
        </div>
      </header>

      <div className="overlay-game-picker" ref={pickerRef}>
        <button
          className={`overlay-game-select${showGamePicker ? " is-open" : ""}`}
          aria-haspopup="listbox"
          aria-expanded={showGamePicker}
          onClick={() => setShowGamePicker((open) => !open)}
        >
          <span className={`overlay-game-icon${isDetected ? " is-live" : ""}`}><Gamepad2 size={17} /></span>
          <span className="overlay-game-copy">
            <small>
              {isDetected ? <><span className="overlay-live-dot" /> Detected running</> : game ? "Selected game" : "No game selected"}
            </small>
            <strong>{game?.title ?? "Choose a game"}</strong>
          </span>
          <ChevronDown size={16} className="overlay-game-chevron" />
        </button>

        {showGamePicker ? (
          <div className="overlay-game-menu" role="listbox" aria-label="Choose a game">
            {detectedGame ? (
              <>
                <p className="overlay-menu-label"><Radar size={11} /> {isRunningNow ? "Running now" : "Last detected"}</p>
                <button role="option" aria-selected={detectedGame.id === gameId} onClick={() => selectGame(detectedGame.id)}>
                  <span>{detectedGame.title}</span>
                  {detectedGame.id === gameId ? <Check size={14} /> : isRunningNow ? <span className="overlay-menu-badge">Live</span> : null}
                </button>
              </>
            ) : null}
            {libraryChoices.length > 0 ? (
              <>
                <p className="overlay-menu-label">Library</p>
                {libraryChoices.map((item) => (
                  <button role="option" aria-selected={item.id === gameId} key={item.id} onClick={() => selectGame(item.id)}>
                    <span>{item.title}</span>
                    {item.id === gameId ? <Check size={14} /> : null}
                  </button>
                ))}
              </>
            ) : null}
            {libraryChoices.length === 0 && !detectedGame ? (
              <p className="overlay-menu-empty">Launch a Steam or non-Steam game and QuestAI will detect it automatically.</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div ref={scrollRef} className="overlay-body" aria-live="polite">
        {!hasConversation ? (
          <div className="overlay-welcome">
            <span className="overlay-orb"><Sparkles size={18} /></span>
            <h1>{game ? `Stuck in ${game.title}?` : "Your in-game guide"}</h1>
            <p>{game ? "Ask for a strategy, your next objective, or how a mechanic works." : "Pick or launch a game to start asking questions."}</p>
            {game ? (
              <div className="overlay-suggestions" aria-label="Suggested questions">
                {suggestions.map((prompt) => (
                  <button key={prompt} onClick={() => void ask(prompt)}>
                    <span>{prompt}</span>
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="overlay-messages">
            {messages.map((message, index) => (
              <article key={`${message.role}-${index}`} className={`overlay-message ${message.role}`}>
                {message.role === "assistant" ? (
                  <>
                    <span className="overlay-message-label"><Sparkles size={11} /> QuestAI</span>
                    <div className="overlay-message-text"><FormattedGuideText text={message.text} /></div>
                  </>
                ) : (
                  <p className="overlay-message-text">{message.text}</p>
                )}
              </article>
            ))}
            {loading ? (
              <article className="overlay-message assistant">
                <span className="overlay-message-label"><Sparkles size={11} /> QuestAI</span>
                <p className="overlay-thinking"><i /><i /><i /> Thinking it through</p>
              </article>
            ) : null}
          </div>
        )}
      </div>

      <div className="overlay-dock">
        {hasConversation && game ? (
          <div className="overlay-chips" aria-label="Suggested questions">
            {suggestions.map((prompt) => (
              <button key={prompt} disabled={loading} onClick={() => void ask(prompt)}>{prompt}</button>
            ))}
          </div>
        ) : null}
        {error ? (
          <div className="overlay-error" role="alert">
            <span>{error}</span>
            <button aria-label="Dismiss error" onClick={() => setError("")}><X size={12} /></button>
          </div>
        ) : null}
        <form className="overlay-composer" onSubmit={submitQuestion}>
          <input
            ref={inputRef}
            aria-label="Ask your game guide"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={!game ? "Choose a game to get started" : loading ? "QuestAI is answering…" : `Ask about ${game.title}…`}
            disabled={!game}
            autoFocus
          />
          <button type="submit" aria-label="Send question" disabled={!question.trim() || !game || loading}>
            <Send size={15} />
          </button>
        </form>
        <footer className="overlay-footer">
          <span className="overlay-shortcut"><kbd>Alt</kbd><kbd>Shift</kbd><kbd>Q</kbd> toggle</span>
          <span className="overlay-shortcut overlay-shortcut-secondary"><kbd><CornerDownLeft size={10} /></kbd> send</span>
          <button onClick={() => void hideGuideOverlay()}>Back to game <ArrowUpRight size={12} /></button>
        </footer>
      </div>
    </section>
  );
}
