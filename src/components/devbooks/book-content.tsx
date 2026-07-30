// biome-ignore-all lint/suspicious/noArrayIndexKey: static manual content, never reordered at runtime
import type { Block } from "@/content/devbooks/types";
import { cn } from "@/lib/utils";
import { Figure } from "./book-client";
import { renderInline } from "./rich";

const CALLOUT_STYLES = {
  note: "border-brand-primary/60 bg-brand-primary/5",
  tip: "border-blue-500/50 bg-blue-500/5",
  warn: "border-amber-500/60 bg-amber-500/10",
} as const;

const CALLOUT_LABEL = {
  note: "text-brand-primary",
  tip: "text-blue-600 dark:text-blue-400",
  warn: "text-amber-700 dark:text-amber-400",
} as const;

export function BlockList({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.t) {
    case "h3":
      return (
        <h3
          id={block.id}
          className="mt-8 scroll-mt-20 text-lg font-semibold text-brand-deep dark:text-foreground"
        >
          {block.text}
        </h3>
      );
    case "h4":
      return (
        <h4 className="mt-5 text-base font-semibold text-brand-primary">
          {renderInline(block.text)}
        </h4>
      );
    case "lead":
      return (
        <p className="mt-3 text-[1.02rem] leading-relaxed text-foreground/90">
          {renderInline(block.text)}
        </p>
      );
    case "p":
      return <p className="mt-3 leading-relaxed text-foreground/90">{renderInline(block.text)}</p>;
    case "ul":
      return (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-foreground/90">
          {block.items.map((it, i) => (
            <li key={i}>{renderInline(it)}</li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="mt-3 space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="leading-relaxed text-foreground/90">{renderInline(it)}</span>
            </li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <div
          className={cn(
            "my-4 break-inside-avoid rounded-r-lg border-l-4 px-4 py-3",
            CALLOUT_STYLES[block.kind],
          )}
        >
          <p className={cn("text-xs font-bold uppercase tracking-wide", CALLOUT_LABEL[block.kind])}>
            {block.title}
          </p>
          {block.body.map((line, i) => (
            <p key={i} className="mt-1 text-sm leading-relaxed text-foreground/90">
              {renderInline(line)}
            </p>
          ))}
        </div>
      );
    case "table":
      return (
        <div className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {block.head.map((h, i) => (
                  <th
                    key={i}
                    className="border border-border bg-muted px-3 py-2 text-left font-semibold text-brand-deep dark:text-foreground"
                  >
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="break-inside-avoid">
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="border border-border px-3 py-2 align-top text-foreground/90"
                    >
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "figure":
      return <Figure code={block.code} caption={block.caption} url={block.url} />;
    default:
      return null;
  }
}
