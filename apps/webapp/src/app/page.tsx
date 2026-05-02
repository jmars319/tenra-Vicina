import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@vicina/config";
import { ArrowRight } from "lucide-react";
import { VicinaBrand } from "@/components/branding/VicinaBrand";
import { AppHeader } from "@/components/layout/AppHeader";

const principles = [
  "Show up, not scroll",
  "Nearby and time-sensitive",
  "No likes, followers, or popularity ranking"
];

export default function HomePage() {
  return (
    <main className="landing-shell">
      <AppHeader />
      <section className="hero">
        <div className="hero__copy">
          <VicinaBrand mode="lockup" />
          <h1>{APP_NAME} helps nearby people coordinate what is happening now.</h1>
          <p>
            A calm web-first foundation for lightweight real-world plans: coffee,
            walks, study blocks, games, help, and local moments that expire when
            they stop being useful.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" href="/nearby">
              Open nearby
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link className="button button--secondary" href="/create">
              Create signal
            </Link>
          </div>
        </div>
        <div className="hero__panel" aria-label={`${APP_NAME} preview`}>
          <div className="hero__panel-map">
            <span className="map-line map-line--one" />
            <span className="map-line map-line--two" />
            <span className="map-dot map-dot--one" />
            <span className="map-dot map-dot--two" />
            <span className="map-dot map-dot--three" />
            <VicinaBrand mode="icon" />
          </div>
          <div className="hero__panel-row">
            <span>near Downtown</span>
            <strong>{APP_TAGLINE}</strong>
          </div>
        </div>
      </section>
      <section className="principles" aria-label="Product principles">
        {principles.map((principle) => (
          <div className="principle" key={principle}>
            {principle}
          </div>
        ))}
      </section>
    </main>
  );
}
