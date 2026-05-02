"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { SignalCard } from "@/components/signal/SignalCard";
import { Card } from "@/components/ui/Card";
import { LOCAL_USER, loadSignals } from "@/lib/mock/signals";

export default function ProfilePage() {
  const [signals] = useState(() => loadSignals());
  const mySignals = useMemo(
    () =>
      signals.filter(
        (signal) => signal.authorId === LOCAL_USER.id && signal.status === "active"
      ),
    [signals]
  );

  return (
    <PageShell>
      <section className="page-hero page-hero--compact">
        <div>
          <h1>{LOCAL_USER.displayName}</h1>
          <p>{LOCAL_USER.bio}</p>
        </div>
      </section>
      <Card className="profile-summary">
        <div className="profile-avatar">J</div>
        <div>
          <h2>{LOCAL_USER.displayName}</h2>
          <p>{LOCAL_USER.bio}</p>
        </div>
      </Card>
      <section className="profile-signals">
        <h2>Your active signals</h2>
        <div className="signal-list">
          {mySignals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
          {mySignals.length === 0 ? (
            <div className="empty-state">
              <h3>No active signals yet.</h3>
              <p>Create a signal when there is something nearby and time-sensitive.</p>
            </div>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}
