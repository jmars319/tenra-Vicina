import type { ReactNode } from "react";
import type { Metadata } from "next";
import { APP_NAME } from "@rally/config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_NAME} Web`,
  description: "Rally webapp scaffold"
};

export default function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
