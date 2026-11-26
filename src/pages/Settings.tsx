import { Info, Keyboard, Monitor, PanelsTopLeft, Settings as SettingsIcon, Sparkles, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "../components/common/Button";
import { PageHeader } from "../components/common/PageHeader";
import { showGuideOverlay } from "../services/gameGuide";

const shortcuts: { keys: string[]; action: string; scope: string }[] = [
  { keys: ["Alt", "Shift", "Q"], action: "Show or hide the guide overlay", scope: "Anywhere, including in-game" },
  { keys: ["Esc"], action: "Back to game (hide overlay)", scope: "Overlay" },
  { keys: ["Enter"], action: "Send a question", scope: "Guide" },
  { keys: ["Ctrl", "K"], action: "Search your games", scope: "App" },
];

function Section({ id, icon: Icon, title, description, children }: {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="surface scroll-mt-6 p-5" id={id}>
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-ink-1">{title}</h2>
          <p className="mt-0.5 text-sm leading-6 text-ink-3">{description}</p>
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-line bg-panel px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm text-ink-1">{label}</p>
        {hint ? <p className="mt-0.5 text-xs text-ink-3">{hint}</p> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function Settings() {
  const { hash } = useLocation();
  const [overlayError, setOverlayError] = useState<string | null>(null);

  // Sidebar "About" links to #about; scroll the matching section into view.
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  async function openOverlay() {
    setOverlayError(null);
    try {
      await showGuideOverlay();
    } catch (error) {
      setOverlayError(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Settings"
        description="Preferences for QuestAI and the in-game guide overlay."
      />

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <Section
          description="The guide overlay floats above your game in its own always-on-top window. Drag its top bar to move it."
          icon={PanelsTopLeft}
          id="overlay"
          title="In-game overlay"
        >
          <Row hint={overlayError ?? "Detects running Steam and non-Steam games automatically."} label="Guide overlay">
            <Button onClick={() => void openOverlay()} size="sm" variant="secondary">
              Open overlay
            </Button>
          </Row>
        </Section>

        <Section
          description="Keyboard shortcuts available in QuestAI."
          icon={Keyboard}
          id="shortcuts"
          title="Shortcuts"
        >
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-panel">
            {shortcuts.map((shortcut) => (
              <li className="flex items-center justify-between gap-4 px-4 py-2.5" key={shortcut.action}>
                <div className="min-w-0">
                  <p className="text-sm text-ink-1">{shortcut.action}</p>
                  <p className="text-xs text-ink-3">{shortcut.scope}</p>
                </div>
                <span className="flex shrink-0 gap-1">
                  {shortcut.keys.map((key) => (
                    <kbd className="kbd" key={key}>{key}</kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          description="Launch behavior, desktop preferences, and library refresh controls."
          icon={SettingsIcon}
          id="general"
          title="General"
        >
          <Row hint="Not available yet" label="Start minimized">
            <span className="rounded-md border border-line px-2 py-0.5 text-2xs font-medium text-ink-3">Coming soon</span>
          </Row>
        </Section>

        <Section
          description="QuestAI uses a dark theme with a teal accent, tuned for low-light gaming setups. Animations follow your system's reduced-motion setting."
          icon={Monitor}
          id="appearance"
          title="Appearance"
        >
          <div className="flex items-center gap-2">
            {["bg-shell", "bg-card", "bg-elevated", "bg-accent"].map((swatch) => (
              <span className={`h-7 w-7 rounded-md border border-line-strong ${swatch}`} key={swatch} />
            ))}
          </div>
        </Section>

        <Section
          description="The game guide is powered by Google Gemini. Provide a key with the GEMINI_API_KEY environment variable; in-app provider settings are planned for a later release."
          icon={Sparkles}
          id="ai"
          title="AI"
        />

        <Section description="QuestAI version 0.1.0." icon={Info} id="about" title="About" />
      </div>
    </div>
  );
}
