import { useMemo } from "react";
import { Check, X } from "lucide-react";
import clsx from "clsx";

interface Requirement {
  label: string;
  test: (value: string) => boolean;
}

const requirements: Requirement[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
  { label: "One special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function PasswordStrengthMeter({ password }: { password: string }) {
  const passedCount = useMemo(
    () => requirements.filter((r) => r.test(password)).length,
    [password]
  );

  const strength = passedCount <= 2 ? "weak" : passedCount <= 4 ? "medium" : "strong";
  const barColor = {
    weak: "bg-red-500",
    medium: "bg-kesho-orange-500",
    strong: "bg-kesho-green-500",
  }[strength];

  return (
    <div className="mt-2 space-y-2" aria-live="polite">
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={clsx("h-1.5 rounded-full transition-all duration-300", barColor)}
          style={{ width: `${(passedCount / requirements.length) * 100}%` }}
        />
      </div>
      <ul className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
        {requirements.map((req) => {
          const passed = req.test(password);
          return (
            <li
              key={req.label}
              className={clsx(
                "flex items-center gap-1.5",
                passed ? "text-kesho-green-600 dark:text-kesho-green-300" : "text-gray-500 dark:text-gray-400"
              )}
            >
              {passed ? <Check size={14} /> : <X size={14} />}
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
