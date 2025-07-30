import React from "react";
import { cx } from "@/utils/cx";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Input: React.FC<InputProps> = ({ icon: Icon, shortcut, size = "md", className, ...props }) => {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />}
      <input
        {...props}
        className={cx(
          "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-gray-300 focus:outline-none",
          Icon && "pl-10",
          shortcut && "pr-16",
          size === "sm" && "py-1.5 text-xs",
          size === "lg" && "py-3 text-base",
          className
        )}
      />
      {shortcut && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-gray-200 bg-gray-50 px-1 text-[10px] font-medium text-gray-500">
            ⌘
          </kbd>
          <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-gray-200 bg-gray-50 px-1 text-[10px] font-medium text-gray-500">
            K
          </kbd>
        </div>
      )}
    </div>
  );
};
