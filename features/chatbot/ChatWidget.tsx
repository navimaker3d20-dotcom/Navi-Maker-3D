"use client";

import { useEffect, useRef, useState } from "react";
import { useChatbot } from "@/hooks/useChatbot";

export function ChatWidget() {
  const { isOpen, messages, isSending, openChat, close, sendMessage, getWhatsappUrl } = useChatbot();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content;
  const lastMessage = messages[messages.length - 1];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="mb-3 flex h-[440px] w-[320px] flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--card)] shadow-xl">
          <div className="flex items-center justify-between bg-[var(--navy)] px-4 py-3 text-white">
            <span className="text-sm font-medium">Navi Maker 3D — Asistente</span>
            <button aria-label="Cerrar chat" onClick={close} className="text-[var(--ink-soft)] text-white/70 hover:text-white">
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-md px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-[var(--blue)] text-white"
                    : "bg-[var(--blue-tint)] text-[var(--ink)]"
                }`}
              >
                {m.content}
              </div>
            ))}
            {isSending && (
              <div className="max-w-[60%] rounded-md bg-[var(--blue-tint)] px-3 py-2 text-sm text-[var(--ink-soft)]">
                Escribiendo…
              </div>
            )}

            {lastMessage?.role === "assistant" && lastMessage.escalate && (
              <a
                href={getWhatsappUrl(lastUserMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md border border-[var(--blue)] px-3 py-2 text-center text-sm font-medium text-[var(--blue-deep)]"
              >
                Hablar con un asesor por WhatsApp
              </a>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-[var(--line)] p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta…"
              className="flex-1 rounded-md border border-[var(--line-strong)] px-3 py-2 text-sm outline-none focus:border-[var(--blue)]"
            />
            <button
              type="submit"
              disabled={isSending}
              className="rounded-md bg-[var(--blue)] px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Enviar
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={openChat}
          aria-label="Abrir chat"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--blue)] text-white shadow-lg"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
      )}
    </div>
  );
}
