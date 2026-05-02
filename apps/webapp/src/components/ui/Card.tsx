import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <section className={["card", className].filter(Boolean).join(" ")}>{children}</section>;
}
