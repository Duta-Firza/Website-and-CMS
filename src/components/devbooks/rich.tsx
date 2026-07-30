import { Fragment, type ReactNode } from "react";

/**
 * Minimal inline markup for book content strings:
 *   **bold**            → <strong>
 *   `code`              → <code>
 *   [label](#anchor)    → <a>
 * Kept tiny on purpose — enough for a technical manual, no external parser.
 */
export function renderInline(text: string): ReactNode {
  const re = /\*\*(.+?)\*\*|`([^`]+?)`|\[([^\]]+)\]\(([^)]+)\)/g;
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>);
    if (m[1] !== undefined) {
      out.push(<strong key={key++}>{m[1]}</strong>);
    } else if (m[2] !== undefined) {
      out.push(
        <code
          key={key++}
          className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[0.85em] text-brand-deep dark:text-foreground"
        >
          {m[2]}
        </code>,
      );
    } else if (m[3] !== undefined) {
      out.push(
        <a
          key={key++}
          href={m[4]}
          className="text-brand-primary underline-offset-2 hover:underline"
        >
          {m[3]}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);
  return out;
}
