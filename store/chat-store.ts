import { create } from "zustand";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  escalate?: boolean;
};

type ChatState = {
  isOpen: boolean;
  hasOpenedOnce: boolean;
  messages: ChatMessage[];
  isSending: boolean;
  open: () => void;
  close: () => void;
  addMessage: (message: ChatMessage) => void;
  setSending: (value: boolean) => void;
};

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "¡Hola! Soy el asistente de Navi Maker 3D. Puedo ayudarte con precios, materiales, tiempos de producción y personalizados. ¿En qué te ayudo?",
};

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  hasOpenedOnce: false,
  messages: [WELCOME_MESSAGE],
  isSending: false,
  open: () => set({ isOpen: true, hasOpenedOnce: true }),
  close: () => set({ isOpen: false }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setSending: (value) => set({ isSending: value }),
}));
