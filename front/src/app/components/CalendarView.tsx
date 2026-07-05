import { useState, useEffect } from "react";
import { taskStore } from "../store";
import { Task } from "../types";
import { TaskCard } from "./TaskCard";
import { ChevronLeft, ChevronRight, Filter, X, List } from "lucide-react";
import { TaskColorFilter } from "./TaskColorFilter";

export function CalendarView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showAllTasks, setShowAllTasks] = useState(false);

  useEffect(() => {
    setTasks(taskStore.getTasks());
    const unsubscribe = taskStore.subscribe(() => {
      setTasks(taskStore.getTasks());
    });
    return unsubscribe;
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthName = currentDate.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.date);
      const dateMatches =
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear();
      
      const colorMatches = !selectedColor || task.color === selectedColor;
      
      return dateMatches && colorMatches;
    });
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-24" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayTasks = getTasksForDate(date);
    const isToday =
      date.getDate() === new Date().getDate() &&
      date.getMonth() === new Date().getMonth() &&
      date.getFullYear() === new Date().getFullYear();

    days.push(
      <div
        key={day}
        className={`min-h-24 border border-gray-800 p-2 ${
          isToday ? "bg-gray-900 border-gray-700" : "bg-[#0f0f0f]"
        }`}
      >
        <div className={`text-sm mb-1 ${isToday ? "text-blue-400 font-semibold" : "text-gray-400"}`}>
          {day}
        </div>
        <div className="space-y-1">
          {dayTasks.map((task) => (
            <div
              key={task.id}
              className={`text-xs px-2 py-1 rounded truncate border ${
                task.status === "completed" ? "opacity-50 line-through" : ""
              }`}
              style={{
                backgroundColor: task.color ? `${task.color}20` : undefined,
                borderColor: task.color ? `${task.color}50` : undefined,
                color: task.color || undefined,
              }}
            >
              {task.title}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const filteredTasks = tasks.filter((task) => {
    const isPending = task.status === "pending";
    const colorMatches = !selectedColor || task.color === selectedColor;
    return isPending && colorMatches;
  });

  return (
    <div className="h-full flex relative">
      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-100">{monthName}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAllTasks(!showAllTasks)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                showAllTasks
                  ? "bg-gray-800 border-gray-600 text-gray-100"
                  : "bg-[#141414] border-gray-800 text-gray-400 hover:bg-gray-800"
              }`}
            >
              <List className="w-5 h-5" />
              <span className="text-sm font-medium">Все задачи</span>
              {filteredTasks.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">
                  {filteredTasks.length}
                </span>
              )}
            </button>
            <button
              onClick={previousMonth}
              className="p-2 rounded-lg bg-[#141414] border border-gray-800 hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg bg-[#141414] border border-gray-800 hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Color filter */}
        <TaskColorFilter selectedColor={selectedColor} onChange={setSelectedColor} className="mb-4" />

        <div className="grid grid-cols-7 gap-px bg-gray-800 border border-gray-800 rounded-lg overflow-hidden">
          {["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"].map((day) => (
            <div key={day} className="bg-[#141414] p-2 text-center text-sm text-gray-400 font-medium">
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>

      {/* All Tasks Panel - slides in from right */}
      {showAllTasks && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setShowAllTasks(false)}
          />
          
          {/* Panel */}
          <div className="fixed lg:relative right-0 top-0 bottom-0 w-80 border-l border-gray-800 bg-[#0f0f0f] p-6 overflow-auto z-40 animate-slide-in-right">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-100">
                Все задачи {selectedColor && `(${filteredTasks.length})`}
              </h3>
              <button
                onClick={() => setShowAllTasks(false)}
                className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {filteredTasks
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((task) => (
                  <TaskCard key={task.id} task={task} showDate />
                ))}
              {filteredTasks.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  {selectedColor ? "Нет задач с этим цветом" : "Нет активных задач"}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}