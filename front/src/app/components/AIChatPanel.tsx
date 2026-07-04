import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Loader2, Bot } from "lucide-react";
import { chatStore } from "../store";
import { ChatMessage } from "../types";
import { chatApi } from "../api/chat";
import { authService } from "../auth";

interface AIChatPanelProps {
  onClose: () => void;
  initialTask?: {
    id: string;
    title: string;
    description?: string;
  } | null;
}

export function AIChatPanel({ onClose, initialTask }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(chatStore.getMessages());
    const unsubscribe = chatStore.subscribe(() => {
      setMessages(chatStore.getMessages());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  useEffect(() => {
    if (initialTask) {
      const taskInfo = `Задача: ${initialTask.title}${
        initialTask.description ? `\n\nОписание: ${initialTask.description}` : ""
      }\n\nПомоги мне с этой задачей.`;

      chatStore.addMessage({
        role: "user",
        content: taskInfo,
      });
    }
  }, [initialTask]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    chatStore.addMessage({
      role: "user",
      content: userMessage,
    });

    setIsLoading(true);

    try {  const token = authService.getAccessToken();
      const res = await chatApi.sendMessage(
        {
          description: userMessage,
        },token);  
        chatStore.addMessage({
          role: "assistant",
          content: res.suggestions.map((item) => `- ${item}`).join("\n"),  });
        } catch (err) {
          console.error(err);
          chatStore.addMessage({
            role: "assistant",
            content: "Ошибка: не удалось получить ответ от сервера",  
          });
        } finally {
          setIsLoading(false);
        }
    };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
    className="fixed inset-0 z-40"
    onClick={handleBackdropClick}
    >
      <div
        style={{
          position: "fixed",
          right: 16,
          top: 16,
          zIndex: 40,
          width: 480,
          height: "calc(100vh - 32px)",
        }}
        className="bg-[#0a0a0a] border border-gray-800/50 rounded-3xl overflow-hidden flex flex-col animate-chat-from-fab shadow-2xl"
      >
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-800/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
              AI
            </div>
            <div>
              <h2 className="text-base font-medium text-gray-100">ИИ Ассистент</h2>
              <p className="text-xs text-gray-600">экспериментальный ответ нейросети</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-800/30 rounded-lg transition-all text-gray-500 hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-600/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg text-gray-300 mb-2">Привет 👋</h3>
                <p className="text-sm text-gray-600">
                  Напишите сообщение, и я отвечу через backend API
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-[#1a1a1a] border border-gray-800/70 text-gray-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-all">{message.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 bg-[#1a1a1a] border border-gray-800/70 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      <span className="text-sm text-gray-500">Думаю...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-8 py-6 border-t border-gray-800/30">
          <form onSubmit={handleSend}>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Сообщение..."
                rows={1}
                className="w-full px-4 py-3 pr-12 bg-[#141414] border border-gray-800/50 rounded-lg text-gray-200 text-sm resize-none"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 text-gray-500 hover:text-gray-300 disabled:opacity-40"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}