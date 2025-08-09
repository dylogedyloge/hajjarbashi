"use client";
import { create } from "zustand";
import type { Conversation, Message } from "@/types/chat";

type ChatState = {
  isOpen: boolean;
  selected: Conversation | null;
  messages: Message[];
  loadingChats: boolean;
  loadingMessages: boolean;
  setOpen: (v: boolean) => void;
  setSelected: (c: Conversation | null) => void;
  setMessages: (m: Message[]) => void;
  appendMessage: (m: Message) => void;
  setLoadingChats: (v: boolean) => void;
  setLoadingMessages: (v: boolean) => void;
  reset: () => void;
};

const initial: Omit<ChatState, "setOpen" | "setSelected" | "setMessages" | "appendMessage" | "setLoadingChats" | "setLoadingMessages" | "reset"> = {
  isOpen: false,
  selected: null,
  messages: [],
  loadingChats: false,
  loadingMessages: false,
};

export const useChatStore = create<ChatState>((set) => ({
  ...initial,
  setOpen: (v) => set({ isOpen: v }),
  setSelected: (c) => set({ selected: c, messages: [] }),
  setMessages: (m) => set({ messages: m }),
  appendMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setLoadingChats: (v) => set({ loadingChats: v }),
  setLoadingMessages: (v) => set({ loadingMessages: v }),
  reset: () => set({ ...initial }),
}));


