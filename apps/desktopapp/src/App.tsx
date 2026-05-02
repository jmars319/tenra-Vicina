import { APP_NAME, APP_TAGLINE } from "@vicina/config";
import { PILOT_VENUES, type MeetupStatus } from "@vicina/domain";
import { brandTokens } from "@vicina/ui";

const initialStatus: MeetupStatus = "draft";

export default function App() {
  return (
    <main
      className="desktop-shell"
      style={{
        background: brandTokens.colors.canvas,
        color: brandTokens.colors.textPrimary
      }}
    >
      <section className="desktop-card">
        <p className="desktop-kicker">{APP_TAGLINE}</p>
        <h1>{APP_NAME} desktopapp is wired.</h1>
        <p className="desktop-copy">
          This Vite + React + Tauri shell is connected to the shared Vicina
          packages and ready for future desktop-specific work.
        </p>
        <div className="desktop-metrics">
          <div>
            <span>initial meetup status</span>
            <strong>{initialStatus}</strong>
          </div>
          <div>
            <span>translated pilot venues</span>
            <strong>{PILOT_VENUES.length}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
