import { Bell, Keyboard, Monitor, Settings as SettingsIcon, Sparkles } from "lucide-react";

const sections = [
  {
    title: "General",
    icon: SettingsIcon,
    body: "Launch behavior, desktop preferences, and library refresh controls will live here.",
  },
  {
    title: "Appearance",
    icon: Monitor,
    body: "QuestAI currently uses the default dark gaming theme with a cyan accent.",
  },
  {
    title: "Shortcuts",
    icon: Keyboard,
    body: "Future overlay access will support Alt+G. Global shortcuts are not implemented yet.",
  },
  {
    title: "AI",
    icon: Sparkles,
    body: "AI provider configuration will be added in a later milestone. No API keys are stored.",
  },
  {
    title: "About",
    icon: Bell,
    body: "QuestAI version 0.1.0. Milestone 1 desktop application foundation.",
  },
];

export function Settings() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-4xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-slate-400">
          Foundation-level preferences and placeholders for upcoming milestones.
        </p>
      </header>

      <div className="grid gap-5 xl:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <section
              className="rounded-lg border border-line bg-card p-5"
              id={section.title.toLowerCase()}
              key={section.title}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-400">{section.body}</p>
              {section.title === "General" ? (
                <label className="mt-5 flex items-center justify-between rounded-lg border border-line bg-black/20 p-4 text-sm text-slate-300">
                  Start minimized
                  <input
                    aria-label="Start minimized"
                    className="h-4 w-4 accent-teal-400"
                    type="checkbox"
                  />
                </label>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
