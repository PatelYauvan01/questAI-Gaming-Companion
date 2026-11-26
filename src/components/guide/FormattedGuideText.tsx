import type { ReactNode } from "react";

function renderInline(line: string, keyPrefix: string): ReactNode[] {
  return line
    .split(/(\*\*.*?\*\*|`[^`]+`)/g)
    .filter(Boolean)
    .map((segment, index) => {
      const key = `${keyPrefix}-${index}`;
      if (segment.startsWith("**") && segment.endsWith("**")) {
        return <strong key={key} className="font-semibold text-white">{segment.slice(2, -2)}</strong>;
      }
      if (segment.startsWith("`") && segment.endsWith("`")) {
        return <code key={key} className="rounded bg-slate-800 px-1 py-0.5 text-teal-200">{segment.slice(1, -1)}</code>;
      }
      return <span key={key}>{segment}</span>;
    });
}

/** Renders the light markdown (paragraphs, lists, bold, code) returned by the AI guide. */
export function FormattedGuideText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).filter((block) => block.trim().length > 0);

  return (
    <>
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").map((line) => line.trimEnd());
        const numbered = lines.every((line) => /^\d+\.\s/.test(line));
        const bulleted = lines.every((line) => /^[-*]\s/.test(line));

        const content = lines.map((line, lineIndex) => {
          const key = `${blockIndex}-${lineIndex}`;
          if (/^\d+\.\s/.test(line)) {
            return <li key={key} className="mb-2 ml-6 list-decimal text-slate-200">{renderInline(line.replace(/^\d+\.\s/, ""), key)}</li>;
          }
          if (/^[-*]\s/.test(line)) {
            return <li key={key} className="mb-2 ml-6 list-disc text-slate-200">{renderInline(line.replace(/^[-*]\s/, ""), key)}</li>;
          }
          return <p key={key} className="mb-2 text-slate-200">{renderInline(line, key)}</p>;
        });

        if (numbered) return <ol key={blockIndex}>{content}</ol>;
        if (bulleted) return <ul key={blockIndex}>{content}</ul>;
        return <div key={blockIndex}>{content}</div>;
      })}
    </>
  );
}
