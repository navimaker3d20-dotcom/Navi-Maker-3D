"use client";

import { useChatStore } from "@/store/chat-store";
import { trackChatbotOpen, trackContact } from "@/lib/analytics/events";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER; // ej. "5215512345678"

export function useChatbot() {
  const { isOpen, hasOpenedOnce, messages, isSending, open, close, addMessage, setSending } =
    useChatStore();

  function openChat() {
    if (!hasOpenedOnce) trackChatbotOpen();
    open();
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    addMessage({ role: "user", content: trimmed });
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const { data } = await res.json();
      addMessage({ role: "assistant", content: data.reply, escalate: data.escalate });
    } catch {
      addMessage({
        role: "assistant",
        content: "Tuvimos un problema para responder. Intenta de nuevo en un momento.",
      });
    } finally {
      setSending(false);
    }
  }

  function getWhatsappUrl(lastUserMessage?: string) {
    trackContact("whatsapp");
    const base = `https://wa.me/${WHATSAPP_NUMBER}`;
    if (!lastUserMessage) return base;
    return `${base}?text=${encodeURIComponent(lastUserMessage)}`;
  }

  return { isOpen, messages, isSending, openChat, close, sendMessage, getWhatsappUrl };
}
