"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { VicinaStateResponse, VicinaVenueState } from "@vicina/api-contracts";
import { APP_NAME, APP_TAGLINE } from "@vicina/config";
import {
  CHECK_IN_DURATION_MINUTES,
  type CheckInIntent,
  type VicinaCheckIn
} from "@vicina/domain";
import {
  CalendarClock,
  Check,
  Clock3,
  LogOut,
  MapPin,
  RefreshCw,
  Send,
  UserRound
} from "lucide-react";

interface LocalSession {
  userId: string;
  displayName: string;
}

type LoadState = "idle" | "loading" | "ready" | "error";

const SESSION_KEY = "vicina.web.session.v1";

const intentLabels: Record<CheckInIntent, string> = {
  available: "Available",
  "open-to-chat": "Open to chat",
  "looking-for-group": "Looking for group"
};

const intentDescriptions: Record<CheckInIntent, string> = {
  available: "Present and reachable",
  "open-to-chat": "Easy casual conversation",
  "looking-for-group": "Trying to gather people"
};

export default function HomePage() {
  const [state, setState] = useState<VicinaStateResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [selectedVenueId, setSelectedVenueId] = useState<string>("krankies-factory");
  const [session, setSession] = useState<LocalSession | null>(null);
  const [displayNameDraft, setDisplayNameDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [intent, setIntent] = useState<CheckInIntent>("open-to-chat");
  const [messageDraft, setMessageDraft] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadVicinaState = useCallback(async () => {
    setLoadState((current) => (current === "idle" ? "loading" : current));

    try {
      const response = await fetch("/api/vicina/state", {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Unable to load Vicina state");
      }

      const nextState = (await response.json()) as VicinaStateResponse;
      setState(nextState);
      setLoadState("ready");
      setErrorMessage(null);
    } catch (error) {
      setLoadState("error");
      setErrorMessage(error instanceof Error ? error.message : "Unable to load Vicina state");
    }
  }, []);

  useEffect(() => {
    const existingSession = readSession();
    setSession(existingSession);
    setDisplayNameDraft(existingSession.displayName);
    void loadVicinaState();

    const intervalId = window.setInterval(() => {
      void loadVicinaState();
    }, 12000);

    return () => window.clearInterval(intervalId);
  }, [loadVicinaState]);

  const selectedVenue = useMemo(() => {
    if (!state) {
      return null;
    }

    return (
      state.venues.find((venue) => venue.id === selectedVenueId) ?? state.venues[0] ?? null
    );
  }, [selectedVenueId, state]);

  const myCheckIn = useMemo(() => {
    if (!state || !session) {
      return null;
    }

    return state.venues
      .flatMap((venue) => venue.activeCheckIns)
      .find((checkIn) => checkIn.userId === session.userId) ?? null;
  }, [session, state]);

  useEffect(() => {
    if (!state?.venues.length) {
      return;
    }

    const venueStillExists = state.venues.some((venue) => venue.id === selectedVenueId);

    if (!venueStillExists) {
      const firstVenue = state.venues[0];

      if (firstVenue) {
        setSelectedVenueId(firstVenue.id);
      }
    }
  }, [selectedVenueId, state]);

  function saveDisplayName(nextDisplayName = displayNameDraft) {
    if (!session) {
      return;
    }

    const trimmedName = nextDisplayName.trim() || session.displayName;
    const nextSession = { ...session, displayName: trimmedName };
    setSession(nextSession);
    setDisplayNameDraft(trimmedName);
    writeSession(nextSession);
  }

  async function handleCheckIn() {
    if (!selectedVenue || !session) {
      return;
    }

    setPendingAction("check-in");
    saveDisplayName();

    try {
      const response = await fetch("/api/vicina/check-ins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          venueId: selectedVenue.id,
          userId: session.userId,
          displayName: displayNameDraft.trim() || session.displayName,
          note: noteDraft.trim() || undefined,
          intent
        })
      });

      if (!response.ok) {
        throw new Error("Check-in failed");
      }

      setNoteDraft("");
      await loadVicinaState();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Check-in failed");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleLeave() {
    if (!session) {
      return;
    }

    setPendingAction("leave");

    try {
      const response = await fetch(
        `/api/vicina/check-ins?userId=${encodeURIComponent(session.userId)}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Unable to leave venue");
      }

      await loadVicinaState();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to leave venue");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleSendMessage() {
    if (!selectedVenue || !session || !messageDraft.trim()) {
      return;
    }

    setPendingAction("message");
    saveDisplayName();

    try {
      const response = await fetch("/api/vicina/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          venueId: selectedVenue.id,
          userId: session.userId,
          displayName: displayNameDraft.trim() || session.displayName,
          body: messageDraft.trim()
        })
      });

      if (!response.ok) {
        throw new Error("Message failed");
      }

      setMessageDraft("");
      await loadVicinaState();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Message failed");
    } finally {
      setPendingAction(null);
    }
  }

  const totalActive = state?.venues.reduce(
    (sum, venue) => sum + venue.activeCheckIns.length,
    0
  ) ?? 0;

  return (
    <main className="app-shell">
      <aside className="left-rail" aria-label="Vicina workspace">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            V
          </div>
          <div>
            <strong>{APP_NAME}</strong>
            <span>{APP_TAGLINE}</span>
          </div>
        </div>

        <section className="profile-panel" aria-label="Current profile">
          <div className="profile-avatar" aria-hidden="true">
            <UserRound size={18} />
          </div>
          <label htmlFor="displayName">Display name</label>
          <input
            id="displayName"
            value={displayNameDraft}
            onBlur={() => saveDisplayName()}
            onChange={(event) => setDisplayNameDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
          />
        </section>

        <nav className="venue-nav" aria-label="Venues">
          {state?.venues.map((venue) => (
            <button
              key={venue.id}
              className={venue.id === selectedVenueId ? "venue-nav-item active" : "venue-nav-item"}
              type="button"
              onClick={() => setSelectedVenueId(venue.id)}
            >
              <span>{venue.name}</span>
              <small>{venue.activeCheckIns.length}</small>
            </button>
          ))}
        </nav>

        <button
          className="ghost-button full-width"
          type="button"
          onClick={() => void loadVicinaState()}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </aside>

      <section className="main-board" aria-label="Nearby venue board">
        <header className="top-bar">
          <div>
            <h1>Nearby right now</h1>
            <p>{totalActive} active check-ins across {state?.venues.length ?? 0} venues</p>
          </div>
          {myCheckIn ? (
            <button
              className="danger-button"
              disabled={pendingAction === "leave"}
              type="button"
              onClick={() => void handleLeave()}
            >
              <LogOut size={16} />
              Leave current venue
            </button>
          ) : (
            <button
              className="primary-button"
              disabled={!selectedVenue || pendingAction === "check-in"}
              type="button"
              onClick={() => void handleCheckIn()}
            >
              <Check size={16} />
              Check in here
            </button>
          )}
        </header>

        {errorMessage ? (
          <div className="error-strip" role="alert">
            {errorMessage}
          </div>
        ) : null}

        <section className="venue-grid" aria-label="Venue list">
          {loadState === "loading" ? <SkeletonVenueList /> : null}
          {state?.venues.map((venue) => (
            <VenueRow
              key={venue.id}
              active={venue.id === selectedVenueId}
              myCheckIn={myCheckIn?.venueId === venue.id}
              nowMs={state.serverNowMs}
              venue={venue}
              onSelect={() => setSelectedVenueId(venue.id)}
            />
          ))}
        </section>
      </section>

      <aside className="detail-panel" aria-label="Selected venue detail">
        {selectedVenue && state ? (
          <>
            <VenueDetailHeader venue={selectedVenue} />

            <section className="check-in-panel" aria-label="Check in form">
              <div className="section-heading">
                <h2>{myCheckIn?.venueId === selectedVenue.id ? "Your check-in" : "Check in"}</h2>
                <span>{CHECK_IN_DURATION_MINUTES} min</span>
              </div>

              {myCheckIn?.venueId === selectedVenue.id ? (
                <ActiveCheckIn checkIn={myCheckIn} nowMs={state.serverNowMs} />
              ) : (
                <>
                  <div className="intent-grid" role="radiogroup" aria-label="Check-in intent">
                    {(Object.keys(intentLabels) as CheckInIntent[]).map((option) => (
                      <button
                        key={option}
                        className={option === intent ? "intent-option active" : "intent-option"}
                        type="button"
                        onClick={() => setIntent(option)}
                      >
                        <strong>{intentLabels[option]}</strong>
                        <span>{intentDescriptions[option]}</span>
                      </button>
                    ))}
                  </div>

                  <label className="field-label" htmlFor="checkInNote">
                    Status note
                  </label>
                  <textarea
                    id="checkInNote"
                    maxLength={140}
                    placeholder="Table, timing, or who should join"
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                  />

                  <button
                    className="primary-button full-width"
                    disabled={pendingAction === "check-in"}
                    type="button"
                    onClick={() => void handleCheckIn()}
                  >
                    <Check size={16} />
                    Start 90-minute check-in
                  </button>
                </>
              )}
            </section>

            <section className="presence-panel" aria-label="Active check-ins">
              <div className="section-heading">
                <h2>Active now</h2>
                <span>{selectedVenue.activeCheckIns.length}</span>
              </div>
              <div className="presence-list">
                {selectedVenue.activeCheckIns.length > 0 ? (
                  selectedVenue.activeCheckIns.map((checkIn) => (
                    <PresenceRow
                      key={checkIn.id}
                      checkIn={checkIn}
                      nowMs={state.serverNowMs}
                    />
                  ))
                ) : (
                  <p className="empty-state">No active check-ins here.</p>
                )}
              </div>
            </section>

            <section className="chat-panel" aria-label="Venue chat">
              <div className="section-heading">
                <h2>Venue chat</h2>
                <span>{selectedVenue.messages.length}</span>
              </div>
              <div className="message-list">
                {selectedVenue.messages.length > 0 ? (
                  selectedVenue.messages.map((message) => (
                    <article
                      key={message.id}
                      className={
                        message.userId === session?.userId ? "message mine" : "message"
                      }
                    >
                      <div>
                        <strong>{message.displayName}</strong>
                        <span>{formatRelativeTime(message.createdAtMs, state.serverNowMs)}</span>
                      </div>
                      <p>{message.body}</p>
                    </article>
                  ))
                ) : (
                  <p className="empty-state">No messages yet.</p>
                )}
              </div>
              <form
                className="message-composer"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSendMessage();
                }}
              >
                <input
                  aria-label="Message"
                  maxLength={280}
                  placeholder="Message this venue"
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                />
                <button
                  className="icon-button"
                  disabled={!messageDraft.trim() || pendingAction === "message"}
                  type="submit"
                  aria-label="Send message"
                >
                  <Send size={17} />
                </button>
              </form>
            </section>
          </>
        ) : (
          <div className="empty-state">Loading Vicina venues.</div>
        )}
      </aside>
    </main>
  );
}

function VenueRow({
  active,
  myCheckIn,
  nowMs,
  onSelect,
  venue
}: {
  active: boolean;
  myCheckIn: boolean;
  nowMs: number;
  onSelect: () => void;
  venue: VicinaVenueState;
}) {
  const nextExpiry = venue.activeCheckIns[0]?.expiresAtMs;

  return (
    <button
      className={active ? "venue-row active" : "venue-row"}
      type="button"
      onClick={onSelect}
    >
      <div className="venue-row-main">
        <div>
          <h2>{venue.name}</h2>
          <p>{venue.summary}</p>
        </div>
        {myCheckIn ? <span className="you-pill">You</span> : null}
      </div>
      <div className="venue-meta-row">
        <span>
          <MapPin size={14} />
          {venue.type}
        </span>
        <span>
          <UserRound size={14} />
          {venue.activeCheckIns.length} active
        </span>
        {nextExpiry ? (
          <span>
            <Clock3 size={14} />
            next expires {formatRelativeTime(nextExpiry, nowMs)}
          </span>
        ) : null}
      </div>
    </button>
  );
}

function VenueDetailHeader({ venue }: { venue: VicinaVenueState }) {
  return (
    <section className="venue-detail-header">
      <div className="map-panel" aria-hidden="true">
        <span className="map-grid-line vertical" />
        <span className="map-grid-line horizontal" />
        <span className="map-pin primary-pin" />
        <span className="map-pin secondary-pin one" />
        <span className="map-pin secondary-pin two" />
      </div>
      <div className="detail-title-row">
        <div>
          <h2>{venue.name}</h2>
          <p>{venue.address}</p>
        </div>
        <span>{venue.type}</span>
      </div>
    </section>
  );
}

function ActiveCheckIn({
  checkIn,
  nowMs
}: {
  checkIn: VicinaCheckIn;
  nowMs: number;
}) {
  return (
    <div className="active-check-in">
      <div>
        <Check size={16} />
        <strong>{intentLabels[checkIn.intent]}</strong>
      </div>
      {checkIn.note ? <p>{checkIn.note}</p> : null}
      <span>
        <CalendarClock size={14} />
        Expires {formatRelativeTime(checkIn.expiresAtMs, nowMs)}
      </span>
    </div>
  );
}

function PresenceRow({
  checkIn,
  nowMs
}: {
  checkIn: VicinaCheckIn;
  nowMs: number;
}) {
  return (
    <article className="presence-row">
      <div className="presence-avatar" aria-hidden="true">
        {checkIn.displayName.slice(0, 1).toUpperCase()}
      </div>
      <div>
        <div className="presence-title">
          <strong>{checkIn.displayName}</strong>
          <span>{intentLabels[checkIn.intent]}</span>
        </div>
        {checkIn.note ? <p>{checkIn.note}</p> : null}
        <small>{formatRelativeTime(checkIn.expiresAtMs, nowMs)}</small>
      </div>
    </article>
  );
}

function SkeletonVenueList() {
  return (
    <>
      <div className="venue-skeleton" />
      <div className="venue-skeleton" />
      <div className="venue-skeleton" />
    </>
  );
}

function readSession(): LocalSession {
  const existing = window.localStorage.getItem(SESSION_KEY);

  if (existing) {
    return JSON.parse(existing) as LocalSession;
  }

  const session = {
    userId: `local_${crypto.randomUUID()}`,
    displayName: `Guest ${Math.floor(100 + Math.random() * 900)}`
  };
  writeSession(session);
  return session;
}

function writeSession(session: LocalSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function formatRelativeTime(targetMs: number, nowMs: number) {
  const deltaMinutes = Math.round((targetMs - nowMs) / 60000);
  const absoluteMinutes = Math.abs(deltaMinutes);

  if (absoluteMinutes < 1) {
    return deltaMinutes >= 0 ? "now" : "just now";
  }

  if (deltaMinutes > 0) {
    return `in ${absoluteMinutes}m`;
  }

  return `${absoluteMinutes}m ago`;
}
