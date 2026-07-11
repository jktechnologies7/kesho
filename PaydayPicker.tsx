import { Controller, Control } from "react-hook-form";
import clsx from "clsx";

interface Props {
  name: string;
  control: Control<any>;
}

export function PaydayPicker({ name, control }: Props) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Payday (day of month)
            </label>
            {field.value != null && (
              <button
                type="button"
                onClick={() => field.onChange(null)}
                className="text-xs text-kesho-green-600 hover:underline"
              >
                Clear — set later
              </button>
            )}
          </div>
          <div className="grid grid-cols-7 gap-1.5" role="listbox" aria-label="Select payday">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                role="option"
                aria-selected={field.value === day}
                onClick={() => field.onChange(day)}
                className={clsx(
                  "rounded-md py-1.5 text-sm transition-colors",
                  field.value === day
                    ? "bg-kesho-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-kesho-green-50 dark:bg-gray-800 dark:text-gray-200"
                )}
              >
                {day}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            You can skip this and set it later from your profile.
          </p>
        </div>
      )}
    />
  );
}
