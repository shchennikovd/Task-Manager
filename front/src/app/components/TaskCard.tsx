import { Task } from "../types";
import { Circle, CheckCircle2, Clock, AlertCircle, Edit2, Trash2, Sparkles, MoreVertical } from "lucide-react";
import { taskStore } from "../store";
import { useState } from "react";
import { EditTaskModal } from "./EditTaskModal";
import { PRIORITY_LABELS, priorityColors } from "../../constants/priority";
import { useUi } from "../context/UiContext";

interface TaskCardProps {
  task: Task;
  showDate?: boolean;
}

export function TaskCard({ task, showDate = false }: TaskCardProps) {
  const { openAiChat } = useUi();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showEditModal, setShowEditModal] = useState(false);

  const priorityColors = {
    low: "text-blue-400",
    medium: "text-yellow-400",
    high: "text-red-400",
  };

  const statusIcons = {
    pending: <Circle className="w-5 h-5 text-gray-400" />,
    completed: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    expired: <AlertCircle className="w-5 h-5 text-red-400" />,
  };

  const handleToggleStatus = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    if (task.status !== "expired") {
      void taskStore.toggleTaskStatus(task.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleEdit = () => {
    setShowContextMenu(false);
    setShowEditModal(true);
  };

  const handleDelete = () => {
    // if (window.confirm("Вы уверены, что хотите удалить эту задачу?")) {
    void taskStore.deleteTask(task.id);
    // }
    setShowContextMenu(false);
  };

  const handleAddToAI = () => {
    setShowContextMenu(false);
    openAiChat(task);
  };

  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <>
      <div
        className="bg-[#141414] border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors cursor-pointer relative overflow-hidden group"
        onClick={handleToggleStatus}
        onContextMenu={handleContextMenu}
      >
        {/* Color indicator */}
        {task.color && (
          <div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ backgroundColor: task.color }}
          />
        )}
        <div className="flex items-center gap-3">
          <div>{statusIcons[task.status]}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`text-gray-100 ${
                  task.status === "completed" ? "line-through text-gray-500" : ""
                }`}
              >
                {task.title}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${priorityColors[task.priority]} bg-opacity-10 whitespace-nowrap`}
                >
                  {PRIORITY_LABELS[task.priority]}
                </span>
                {/* Edit button - visible on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-800 rounded transition-all text-gray-400 hover:text-gray-100"
                  title="Редактировать"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {/* More options button - visible on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setContextMenuPosition({ x: rect.left, y: rect.bottom + 4 });
                    setShowContextMenu(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-800 rounded transition-all text-gray-400 hover:text-gray-100"
                  title="Больше опций"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-1">{task.description}</p>
            {showDate && (
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {task.date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            )}
            {totalSubtasks > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Subtasks: {completedSubtasks}/{totalSubtasks}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowContextMenu(false)}
          />
          <div
            className="fixed z-50 bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-xl py-1 min-w-[180px]"
            style={{
              left: `${contextMenuPosition.x}px`,
              top: `${contextMenuPosition.y}px`,
            }}
          >
            <button
              onClick={handleEdit}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-3 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Редактировать
            </button>
            <button
              onClick={handleAddToAI}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-3 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Добавить в чат с ИИ
            </button>
            <div className="my-1 border-t border-gray-800" />
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-3 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Удалить
            </button>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditTaskModal task={task} onClose={() => setShowEditModal(false)} />
      )}
    </>
  );
}