import { useState, useEffect, useRef } from "react";
import { X, Search, Inbox, CalendarDays, Calendar, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { taskStore } from "../store";
import { Task } from "../types";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

interface SearchModalProps {
  onClose: () => void;
}

export function SearchModal({ onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTasks(taskStore.getTasks());
    const unsubscribe = taskStore.subscribe(() => {
      setTasks(taskStore.getTasks());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Фокус на поле поиска с задержкой, чтобы анимация Radix UI не перебила фокус
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timeout);
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleTaskClick = (task: Task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);

    if (task.status === "completed") {
      navigate("/completed");
    } else if (taskDate.getTime() === today.getTime()) {
      navigate("/today");
    } else {
      navigate("/calendar");
    }
    onClose();
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigationItems = [
    { path: "/", icon: Inbox, label: "Входящие", description: "Все предстоящие задачи" },
    { path: "/today", icon: CalendarDays, label: "Сегодня", description: "Задачи на сегодня" },
    { path: "/calendar", icon: Calendar, label: "Календарь", description: "Просмотр календаря" },
    { path: "/completed", icon: CheckCircle2, label: "Выполнено", description: "Завершенные задачи" },
  ];

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
        className="bg-[#141414] border-gray-800 p-0 overflow-hidden max-w-2xl flex flex-col !top-[10%] !translate-y-0 max-h-[80vh] [&>button]:hidden"
      >
        <DialogTitle className="sr-only">Поиск по задачам</DialogTitle>
        
        {/* Поле поиска */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск задач..."
              className="w-full pl-11 pr-10 py-3 bg-[#0f0f0f] border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-700"
            />
            <button
              onClick={onClose}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-800 rounded transition-colors text-gray-500 hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-y-auto p-4">
          {searchQuery.trim() === "" ? (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3 px-2">Навигация</h3>
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className="w-full flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-gray-800/50 transition-colors text-left group"
                  >
                    <item.icon className="w-5 h-5 text-gray-400 group-hover:text-gray-300 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-100 font-medium group-hover:text-white">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {filteredTasks.length > 0 ? (
                <>
                  <h3 className="text-sm font-medium text-gray-400 mb-3 px-2">
                    Найдено задач: {filteredTasks.length}
                  </h3>
                  <div className="space-y-2">
                    {filteredTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className="w-full flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-gray-800/50 transition-colors text-left group relative overflow-hidden"
                      >
                        {task.color && (
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1"
                            style={{ backgroundColor: task.color }}
                          />
                        )}
                        <div className="flex-1 min-w-0 pl-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-gray-100 font-medium group-hover:text-white">
                              {task.title}
                            </div>
                            <span
                              className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${
                                task.status === "completed"
                                  ? "text-green-400 bg-green-900/20"
                                  : task.status === "expired"
                                  ? "text-red-400 bg-red-900/20"
                                  : "text-blue-400 bg-blue-900/20"
                              }`}
                            >
                              {task.status === "completed"
                                ? "Выполнено"
                                : task.status === "expired"
                                ? "Просрочено"
                                : "Активно"}
                            </span>
                          </div>
                          {task.description && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {task.description}
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                            <span>
                              {task.date.toLocaleDateString("ru-RU", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span className="capitalize">{task.priority}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Задачи не найдены</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Попробуйте изменить поисковый запрос
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Хинт в футере */}
        <div className="p-3 border-t border-gray-800 bg-[#0f0f0f]">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Используйте поиск для быстрого доступа</span>
            <span>ESC для закрытия</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}