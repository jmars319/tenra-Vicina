import type { ReactNode } from "react";
import type { Metadata } from "next";
import { APP_NAME, APP_TAGLINE } from "@vicina/config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_NAME} - ${APP_TAGLINE}`,
  description: `${APP_NAME} helps nearby people coordinate local, live plans in real time.`
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
