import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/chat-widget-demo")({
  component: ChatWidgetDemoPage,
  head: () => ({
    meta: [
      { title: "AI Chat Widget — Demo" },
      { name: "description", content: "Standalone demo of the AI chat widget in header." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

const DUMMY_RESPONSE =
  "This is a placeholder response. The AI integration will be added after the site is complete. But the widget design and interactions are fully functional!";

const SUGGESTIONS = [
  "What kind of work does Murat do?",
  "Is Murat open to new opportunities?",
  "What's his approach to accessibility?",
];

type Msg =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; content: string; showSuggestions: boolean };

function ChatWidgetDemoPage() {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <DemoHeader />
      <div className="mx-auto max-w-2xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Demo</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">AI Chat Widget — Header</h1>
        <p className="mt-4 text-neutral-600">
          The trigger lives in the header next to <em>about</em>. Hover to see the tooltip,
          click to open the panel with a smooth transition.
        </p>
      </div>
    </div>
  );
}

function DemoHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-tight">murat karcı</span>
        </div>
        <nav className="flex items-center gap-7 text-sm">
          <a href="#" className="text-neutral-900">work</a>
          <a href="#" className="text-neutral-900">about</a>
          <ChatTrigger />
          <span className="hidden sm:inline-flex items-center rounded-full bg-neutral-900 text-white px-4 py-2 text-sm font-medium">
            Resume
          </span>
        </nav>
      </div>
    </header>
  );
}

function ChatTrigger() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <style>{`
        @keyframes chatGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.45); }
          50% { box-shadow: 0 0 0 6px rgba(168, 85, 247, 0); }
        }
        .chat-trigger {
          background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #f59e0b, #6366f1);
          background-size: 300% 300%;
          animation: chatGradient 6s ease infinite, chatPulse 2.4s ease-in-out infinite;
        }
        .chat-trigger:hover { transform: scale(1.06); }
        .chat-tooltip {
          opacity: 0;
          transform: translate(-50%, 4px);
          transition: opacity 160ms ease, transform 160ms ease;
          pointer-events: none;
        }
        .chat-trigger-wrap:hover .chat-tooltip,
        .chat-trigger:focus-visible + .chat-tooltip {
          opacity: 1;
          transform: translate(-50%, 0);
        }
      `}</style>
      <div className="chat-trigger-wrap relative inline-flex">
        <button
          ref={btnRef}
          type="button"
          aria-label="Ask about Murat"
          onClick={() => setOpen(true)}
          className="chat-trigger flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-200 ease-out outline-none"
        >
          <span className="text-white" style={{ fontSize: 14, lineHeight: 1 }}>✦</span>
        </button>
        <span
          role="tooltip"
          className="chat-tooltip absolute left-1/2 top-full mt-2 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-[11px] font-medium text-white"
        >
          Ask about Murat
          <span
            aria-hidden
            className="absolute left-1/2 -top-1 h-2 w-2 -translate-x-1/2 rotate-45 bg-neutral-900"
          />
        </span>
      </div>
      <ChatPanel open={open} onClose={() => setOpen(false)} anchorRef={btnRef} />
    </>
  );
}

function ChatPanel({
  open,
  onClose,
  anchorRef,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
}) {
  // render mounting separately for entrance/exit animation (Srini-style)
  const [render, setRender] = useState(false);
  const [shown, setShown] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (open) {
      // capture trigger position for transform-origin
      const rect = anchorRef.current?.getBoundingClientRect();
      if (rect) setOrigin({ x: rect.left + rect.width / 2, y: rect.bottom });
      setRender(true);
      const t = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(t);
    } else {
      setShown(false);
      const t = setTimeout(() => setRender(false), 260);
      return () => clearTimeout(t);
    }
  }, [open, anchorRef]);

  useEffect(() => {
    if (shown) setTimeout(() => inputRef.current?.focus(), 200);
  }, [shown]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((prev) => [
      ...prev.map((m) => (m.role === "assistant" ? { ...m, showSuggestions: false } : m)),
      userMsg,
    ]);
    setInput("");
    setLoading(true);
    const delay = 1200 + Math.random() * 600;
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: DUMMY_RESPONSE,
          showSuggestions: true,
        },
      ]);
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }, delay);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send(input);
    }
  };

  if (!render) return null;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 480;

  return (
    <>
      {/* Backdrop for click-away */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{
          background: shown ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0)",
          transition: "background 250ms ease",
        }}
      />
      <div
        role="dialog"
        aria-label="AI assistant"
        className="fixed z-50 flex flex-col overflow-hidden"
        style={{
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: isMobile ? "16px 16px 0 0" : 16,
          width: isMobile ? "100vw" : 380,
          height: isMobile ? "85vh" : 540,
          top: isMobile ? "auto" : 72,
          right: isMobile ? 0 : 24,
          bottom: isMobile ? 0 : "auto",
          left: isMobile ? 0 : "auto",
          transformOrigin: origin
            ? `${origin.x - (isMobile ? 0 : window.innerWidth - 24 - 380)}px ${
                origin.y - (isMobile ? window.innerHeight * 0.15 : 72)
              }px`
            : "top right",
          transform: shown ? "scale(1) translateY(0)" : "scale(0.96) translateY(-8px)",
          opacity: shown ? 1 : 0,
          transition:
            "transform 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease-out",
          boxShadow:
            "0 24px 48px -12px rgba(0,0,0,0.18), 0 8px 20px -8px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between"
          style={{ height: 60, padding: "0 20px", borderBottom: "1px solid #e5e5e5" }}
        >
          <div className="flex flex-col">
            <span style={{ fontSize: 14, fontWeight: 500, color: "#111111", lineHeight: 1.2 }}>
              Murat
            </span>
            <span style={{ fontSize: 11, color: "#999999", lineHeight: 1.4 }}>AI assistant</span>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              background: "transparent",
              color: "#999999",
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="chat-scroll flex-1 overflow-y-auto"
          style={{ padding: 20, scrollbarWidth: "none" }}
        >
          <style>{`.chat-scroll::-webkit-scrollbar{display:none}`}</style>
          <div className="flex flex-col" style={{ gap: 16 }}>
            {messages.length === 0 && !loading && <WelcomeState onPick={send} />}
            {messages.map((m) => (
              <div key={m.id} className="flex flex-col" style={{ gap: 8 }}>
                <Bubble role={m.role}>{m.content}</Bubble>
                {m.role === "assistant" && m.showSuggestions && !loading && (
                  <Suggestions onPick={send} />
                )}
              </div>
            ))}
            {loading && <TypingBubble />}
          </div>
        </div>

        {/* Input */}
        <div
          className="flex shrink-0 items-center"
          style={{ borderTop: "1px solid #e5e5e5", padding: "12px 16px", gap: 8 }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 14, color: "#111111", border: "none" }}
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            style={{
              height: 32,
              padding: "0 16px",
              background: "#111111",
              color: "#ffffff",
              fontSize: 13,
              borderRadius: 999,
              opacity: loading || !input.trim() ? 0.5 : 1,
              transition: "opacity 150ms ease",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}

function WelcomeState({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: "#111111",
          lineHeight: 1.25,
          letterSpacing: "-0.01em",
        }}
      >
        Hi there 👋 what would you like to know about Murat?
      </h2>
      <Suggestions onPick={onPick} />
    </div>
  );
}

function Suggestions({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="flex flex-col">
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="group flex w-full items-center text-left"
          style={{
            padding: "10px 0",
            borderTop: "1px solid #eeeeee",
            gap: 8,
            transition: "color 150ms ease",
          }}
        >
          <span style={{ color: "#777777", fontSize: 12 }}>↗</span>
          <span
            className="transition-colors group-hover:!text-[#111111]"
            style={{ color: "#777777", fontSize: 13 }}
          >
            {s}
          </span>
        </button>
      ))}
    </div>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        style={{
          background: isUser ? "#111111" : "#f4f4f4",
          color: isUser ? "#ffffff" : "#111111",
          borderRadius: isUser ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
          padding: "10px 14px",
          maxWidth: isUser ? "78%" : "85%",
          fontSize: 14,
          lineHeight: 1.45,
          whiteSpace: "pre-wrap",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div
        style={{
          background: "#f4f4f4",
          borderRadius: "14px 14px 14px 2px",
          padding: "10px 14px",
          display: "inline-flex",
          gap: 4,
          alignItems: "center",
        }}
      >
        <Dot delay={0} />
        <Dot delay={0.15} />
        <Dot delay={0.3} />
        <style>{`@keyframes chatDot{0%,60%,100%{opacity:.25}30%{opacity:1}}`}</style>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: 999,
        background: "#999999",
        display: "inline-block",
        animation: `chatDot 1.2s ${delay}s infinite ease-in-out`,
      }}
    />
  );
}
