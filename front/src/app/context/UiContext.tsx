import React, { createContext, useContext, useState } from 'react';
import { Task } from '../types';

interface UiContextType {
  isAiChatOpen: boolean;
  aiChatTask: Task | null;
  openAiChat: (task?: Task) => void;
  closeAiChat: () => void;
}

const UiContext = createContext<UiContextType | null>(null);

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiChatTask, setAiChatTask] = useState<Task | null>(null);

  const openAiChat = (task?: Task) => {
    if (task) setAiChatTask(task);
    setIsAiChatOpen(true);
  };

  const closeAiChat = () => {
    setIsAiChatOpen(false);
    setAiChatTask(null);
  };

  return (
    <UiContext.Provider value={{ isAiChatOpen, aiChatTask, openAiChat, closeAiChat }}>
      {children}
    </UiContext.Provider>
  );
}

export const useUi = () => {
  const context = useContext(UiContext);
  if (!context) throw new Error('useUi must be used within UiProvider');
  return context;
};