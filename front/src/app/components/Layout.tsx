import { Outlet, NavLink } from "react-router";
import { Inbox, Calendar, CheckCircle2, LogOut, Sparkles, CalendarDays, Search, Plus } from "lucide-react";
import { authService } from "../auth";
import { useState, useEffect } from "react";
import type { User } from "../auth";
import { SearchModal } from "./SearchModal";
import { AddTaskModal } from "./AddTaskModal";
import { AIChatPanel } from "./AIChatPanel";
import type { Task } from "../types";

export function Layout() {
  const [user, setUser] = useState<User | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [selectedTaskForAI, setSelectedTaskForAI] = useState<{
    id: string;
    title: string;
    description?: string;
  } | null>(null);

  console.log("AI CHAT STATE:", showAIChat);

  useEffect(() => {
    setUser(authService.getCurrentUser());
    const unsubscribe = authService.subscribe(() => {
      setUser(authService.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Глобальная комбинация клавиш для поиска (Ctrl+K или Cmd+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Отслеживайте пользовательское событие для добавления задачи в чат ИИ
  useEffect(() => {
    const handleAddToAI = (e: CustomEvent<Task>) => {
      setSelectedTaskForAI({
        id: e.detail.id,
        title: e.detail.title,
        description: e.detail.description,
      });
      setShowAIChat(true);
    };

    window.addEventListener("addTaskToAI" as any, handleAddToAI);
    return () => window.removeEventListener("addTaskToAI" as any, handleAddToAI);
  }, []);

  const handleLogout = () => {
    void authService.logout();
  };

  const navItems = [
    { to: "/", icon: Inbox, label: "Входящие", end: true },
    { to: "/today", icon: CalendarDays, label: "Сегодня" },
    { to: "/calendar", icon: Calendar, label: "Календарь" },
    { to: "/completed", icon: CheckCircle2, label: "Выполнено" },
  ];

  const handleCloseAIChat = () => {
    setShowAIChat(false);
    setSelectedTaskForAI(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="border-b border-gray-800 bg-[#0f0f0f]">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-100">DevFlow AI</h1>
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-100">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-[#141414] border border-gray-800 hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-100"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <nav className="w-64 border-r border-gray-800 bg-[#0f0f0f] p-4">
            <div className="space-y-1">
              {/* Search button */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors text-gray-400 hover:bg-gray-800/50 hover:text-gray-100 group"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5" />
                  <span className="font-medium">Поиск</span>
                </div>
                <div className="text-xs text-gray-600 group-hover:text-gray-500 font-mono">
                  ⌘K
                </div>
              </button>

              {/* Кнопка "Добавить задачу" — теперь идеально вписывается в стиль */}
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-400 hover:bg-gray-800/50 hover:text-gray-100 group mt-1"
              >
                <Plus className="w-5 h-5 transition-colors" />
                <span className="font-medium">Добавить задачу</span>
              </button>

              {/* Divider */}
              <div className="py-2">
                <div className="border-t border-gray-800" />
              </div>

              {/* Navigation items */}
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-gray-800 text-gray-100"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-100"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Content area */}
          <main className="flex-1 overflow-auto relative">
            <Outlet />
            
            {/* AI Chat Floating Button */}
            <button
              onClick={() => setShowAIChat(true)}
              className="fixed right-6 bottom-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center group z-30"
              title="AI Ассистент"
            >
              <Sparkles className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
          </main>
        </div>
      </div>

      {/* Search Modal */}
      {showSearchModal && <SearchModal onClose={() => setShowSearchModal(false)} />}

      {/* Add Task Modal */}
      {showAddTaskModal && <AddTaskModal onClose={() => setShowAddTaskModal(false)} />}
      
      {/* AI Chat Panel */}
      {showAIChat && (
        <AIChatPanel 
          onClose={handleCloseAIChat} 
          initialTask={selectedTaskForAI}
        />
      )}
    </div>
  );
}