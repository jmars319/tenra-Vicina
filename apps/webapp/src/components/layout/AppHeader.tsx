import Link from "next/link";
import { VicinaBrand } from "../branding/VicinaBrand";

const navItems = [
  { href: "/nearby", label: "Nearby" },
  { href: "/create", label: "Create" },
  { href: "/profile", label: "Profile" }
] as const;

export function AppHeader() {
  return (
    <header className="app-header">
      <Link aria-label="Vicina home" className="app-header__brand" href="/">
        <VicinaBrand mode="wordmark" />
      </Link>
      <nav aria-label="Primary navigation" className="app-header__nav">
        {navItems.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
