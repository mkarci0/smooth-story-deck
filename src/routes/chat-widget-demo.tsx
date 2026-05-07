import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/chat-widget-demo")({
  component: ChatWidgetDemoPage,
  head: () => ({
    meta: [
      { title: "AI Chat Widget — Demo" },
      { name: "description", content: "Standalone demo of the floating AI chat widget." },
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
      <div className="mx-auto max-w-2xl px-6 py-24">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Demo</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">AI Chat Widget</h1>
        <p className="mt-4 text-neutral-600">
          Standalone preview. Click the ✦ button at the bottom-right to open the widget.
        </p>
      </div>
      <ChatWidget />
    </div>
  );
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // for animation
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const t = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(t);
    }
    setMounted(false);
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: trimmed };
    // strip suggestions from previous assistant messages
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

  const isMobile = typeof window !== "undefined" && window.innerWidth < 480;

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-7 right-7 z-50 flex h-[52px] w-[52px] items-center justify-center rounded-full transition-transform duration-200 ease-out hover:scale-[1.04]"
        style={{ background: "#111111" }}
      >
        <span className="text-white" style={{ fontSize: 18, lineHeight: 1 }}>
          {open ? "✕" : "✦"}
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="AI assistant"
          className="fixed z-50 flex flex-col overflow-hidden"
          style={{
            background: "#ffffff",
            border: "1px solid #e5e5e5",
            borderRadius: 16,
            width: isMobile ? "100vw" : 380,
            height: isMobile ? "85vh" : 540,
            bottom: isMobile ? 0 : 92,
            right: isMobile ? 0 : 28,
            transform: mounted ? "translateY(0)" : "translateY(16px)",
            opacity: mounted ? 1 : 0,
            transition: "transform 250ms ease-out, opacity 250ms ease-out",
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
              onClick={() => setOpen(false)}
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
            className="flex-1 overflow-y-auto"
            style={{
              padding: 20,
              scrollbarWidth: "none",
            }}
          >
            <style>{`.chat-scroll::-webkit-scrollbar{display:none}`}</style>
            <div className="chat-scroll flex flex-col" style={{ gap: 16 }}>
              {messages.length === 0 && !loading && (
                <WelcomeState onPick={(s) => send(s)} />
              )}

              {messages.map((m) => (
                <div key={m.id} className="flex flex-col" style={{ gap: 8 }}>
                  <Bubble role={m.role}>{m.content}</Bubble>
                  {m.role === "assistant" && m.showSuggestions && !loading && (
                    <Suggestions onPick={(s) => send(s)} />
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
      )}
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
      {SUGGESTIONS.map((s, i) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="group flex w-full items-center text-left"
          style={{
            padding: "10px 0",
            borderTop: i === 0 ? "1px solid #eeeeee" : "1px solid #eeeeee",
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
