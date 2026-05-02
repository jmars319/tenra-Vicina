import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main className={["page-shell", className].filter(Boolean).join(" ")}>
      <AppHeader />
      {children}
    </main>
  );
}
