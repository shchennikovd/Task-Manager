import { Filter, X } from "lucide-react";
import { TASK_COLORS } from "../../constants/colors";

interface TaskColorFilterProps {
  selectedColor: string | null;
  onChange: (color: string | null) => void;
  className?: string;
}

export function TaskColorFilter({ selectedColor, onChange, className = "mb-6" }: TaskColorFilterProps) {
  return (
    <div className={`${className} flex items-center gap-3 flex-wrap`}>
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Filter className="w-4 h-4" />
        <span>Фильтр по цвету:</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onChange(null)}
          className={`px-3 py-1.5 rounded-lg border transition-colors text-sm ${
            selectedColor === null
              ? "bg-gray-800 border-gray-600 text-gray-100"
              : "bg-[#141414] border-gray-800 text-gray-400 hover:border-gray-700"
          }`}
        >
          Все
        </button>
        {TASK_COLORS.map((taskColor) => (
          <button
            key={taskColor.value}
            onClick={() => onChange(taskColor.value)}
            className="relative w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
            style={{
              backgroundColor: taskColor.value,
              borderColor: selectedColor === taskColor.value ? taskColor.value : "transparent",
              opacity: selectedColor === taskColor.value ? 1 : 0.6,
            }}
            title={taskColor.name}
          >
            {selectedColor === taskColor.value && (
              <X className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}