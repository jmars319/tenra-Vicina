import { APP_NAME } from "@rally/config";
import { PILOT_VENUES, type VisibilityMode } from "@rally/domain";
import { brandTokens } from "@rally/ui";

const defaultVisibility: VisibilityMode = "local-area";
const previewVenues = PILOT_VENUES.slice(0, 3);

export default function HomePage() {
  return (
    <main
      className="shell"
      style={{
        background: brandTokens.colors.canvas,
        color: brandTokens.colors.textPrimary
      }}
    >
      <section className="hero">
        <p className="eyebrow">Rally webapp scaffold</p>
        <h1>{APP_NAME} webapp is wired.</h1>
        <p className="lede">
          This Next.js shell is connected to the shared workspace packages and
          ready for the first product surface.
        </p>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Shared package resolution</h2>
          <span className="chip">default visibility: {defaultVisibility}</span>
        </div>
        <p className="muted">
          Starter venue data was translated out of the archived Version -1
          prototype into the Rally domain package.
        </p>
        <ul className="venue-list">
          {previewVenues.map((venue) => (
            <li key={venue.id} className="venue-card">
              <strong>{venue.name}</strong>
              <span>{venue.address}</span>
              <span>{venue.neighborhood}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
