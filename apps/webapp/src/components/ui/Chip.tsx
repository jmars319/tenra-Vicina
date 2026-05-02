import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
}

export function Chip({ active = false, children, className, ...props }: ChipProps) {
  return (
    <button
      className={["chip", active ? "chip--active" : "", className].filter(Boolean).join(" ")}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
