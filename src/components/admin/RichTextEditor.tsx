import { useRef, useState } from "react";
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Code,
  Eye,
  Pencil,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
};

type Action =
  | { kind: "wrap"; before: string; after: string; placeholder: string }
  | { kind: "linePrefix"; prefix: string; placeholder?: string }
  | { kind: "orderedList" }
  | { kind: "link" };

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Body copy…",
  rows = 6,
  className = "",
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");

  const apply = (action: Action) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);

    let next = value;
    let newStart = start;
    let newEnd = end;

    if (action.kind === "wrap") {
      const text = selected || action.placeholder;
      next = value.slice(0, start) + action.before + text + action.after + value.slice(end);
      newStart = start + action.before.length;
      newEnd = newStart + text.length;
    } else if (action.kind === "linePrefix") {
      // apply prefix to each selected line (or current line if no selection)
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = end === start ? value.indexOf("\n", end) : end;
      const sliceEnd = lineEnd === -1 ? value.length : lineEnd;
      const block = value.slice(lineStart, sliceEnd) || action.placeholder || "";
      const prefixed = block
        .split("\n")
        .map((line) => (line.length === 0 ? action.prefix : action.prefix + line))
        .join("\n");
      next = value.slice(0, lineStart) + prefixed + value.slice(sliceEnd);
      newStart = lineStart;
      newEnd = lineStart + prefixed.length;
    } else if (action.kind === "orderedList") {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = end === start ? value.indexOf("\n", end) : end;
      const sliceEnd = lineEnd === -1 ? value.length : lineEnd;
      const block = value.slice(lineStart, sliceEnd) || "List item";
      const prefixed = block
        .split("\n")
        .map((line, i) => `${i + 1}. ${line || "List item"}`)
        .join("\n");
      next = value.slice(0, lineStart) + prefixed + value.slice(sliceEnd);
      newStart = lineStart;
      newEnd = lineStart + prefixed.length;
    } else if (action.kind === "link") {
      const url = window.prompt("Link URL", "https://");
      if (!url) return;
      const text = selected || "link text";
      const md = `[${text}](${url})`;
      next = value.slice(0, start) + md + value.slice(end);
      newStart = start + 1;
      newEnd = newStart + text.length;
    }

    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newStart, newEnd);
    });
  };

  const Btn = ({
    onClick,
    label,
    children,
  }: {
    onClick: () => void;
    label: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted text-foreground/80 hover:text-foreground transition-colors"
    >
      {children}
    </button>
  );

  return (
    <div className={`rounded-xl border border-border bg-background ${className}`}>
      <div className="flex items-center justify-between gap-1 border-b border-border px-1.5 py-1">
        <div className="flex items-center gap-0.5 flex-wrap">
          <Btn
            label="Bold"
            onClick={() => apply({ kind: "wrap", before: "**", after: "**", placeholder: "bold text" })}
          >
            <Bold className="w-4 h-4" />
          </Btn>
          <Btn
            label="Italic"
            onClick={() => apply({ kind: "wrap", before: "*", after: "*", placeholder: "italic text" })}
          >
            <Italic className="w-4 h-4" />
          </Btn>
          <Btn
            label="Heading"
            onClick={() => apply({ kind: "linePrefix", prefix: "## ", placeholder: "Heading" })}
          >
            <Heading2 className="w-4 h-4" />
          </Btn>
          <span className="w-px h-5 bg-border mx-1" aria-hidden />
          <Btn
            label="Bulleted list"
            onClick={() => apply({ kind: "linePrefix", prefix: "- ", placeholder: "List item" })}
          >
            <List className="w-4 h-4" />
          </Btn>
          <Btn label="Numbered list" onClick={() => apply({ kind: "orderedList" })}>
            <ListOrdered className="w-4 h-4" />
          </Btn>
          <Btn
            label="Quote"
            onClick={() => apply({ kind: "linePrefix", prefix: "> ", placeholder: "Quote" })}
          >
            <Quote className="w-4 h-4" />
          </Btn>
          <span className="w-px h-5 bg-border mx-1" aria-hidden />
          <Btn label="Link" onClick={() => apply({ kind: "link" })}>
            <LinkIcon className="w-4 h-4" />
          </Btn>
          <Btn
            label="Inline code"
            onClick={() => apply({ kind: "wrap", before: "`", after: "`", placeholder: "code" })}
          >
            <Code className="w-4 h-4" />
          </Btn>
        </div>
        <button
          type="button"
          onClick={() => setMode((m) => (m === "write" ? "preview" : "write"))}
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground px-2 py-1 rounded-md"
        >
          {mode === "write" ? (
            <>
              <Eye className="w-3.5 h-3.5" /> Preview
            </>
          ) : (
            <>
              <Pencil className="w-3.5 h-3.5" /> Edit
            </>
          )}
        </button>
      </div>

      {mode === "write" ? (
        <textarea
          ref={textareaRef}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-2.5 text-sm outline-none resize-y leading-relaxed"
        />
      ) : (
        <div className="px-3 py-2.5 prose-rich min-h-[8rem]">
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
