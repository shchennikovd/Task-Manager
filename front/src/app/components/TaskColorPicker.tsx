import { Check } from "lucide-react";
import { TASK_COLORS } from "../../constants/colors";

interface TaskColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function TaskColorPicker({ color, onChange }: TaskColorPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        Цвет
      </label>
      <div className="flex gap-2 flex-wrap">
        {TASK_COLORS.map((tc) => (
          <button
            key={tc.value}
            type="button"
            onClick={() => onChange(tc.value)}
            className="relative w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
            style={{
              backgroundColor: tc.value,
              borderColor: color === tc.value ? tc.value : "transparent",
            }}
            title={tc.name}
          >
            {color === tc.value && (
              <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}