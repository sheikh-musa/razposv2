import React from "react";
import { cx } from "@/utils/cx";

interface ButtonUtilityProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "tertiary";
  tooltip?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  className?: string;
}

export const ButtonUtility: React.FC<ButtonUtilityProps> = ({
  size = "md",
  color = "primary",
  tooltip,
  icon: Icon,
  onClick,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={cx(
        "inline-flex items-center justify-center rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        size === "sm" && "h-8 w-8",
        size === "md" && "h-10 w-10",
        size === "lg" && "h-12 w-12",
        color === "primary" && "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
        color === "secondary" && "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-blue-500",
        color === "tertiary" && "border-transparent bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:ring-blue-500",
        className
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
};
