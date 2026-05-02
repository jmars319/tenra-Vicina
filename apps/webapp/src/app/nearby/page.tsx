"use client";

import { useMemo, useState } from "react";
import { DEFAULT_DISCOVERY_RADIUS_MILES } from "@vicina/domain";
import { PageShell } from "@/components/layout/PageShell";
import { SignalCard } from "@/components/signal/SignalCard";
import { SignalFilters } from "@/components/signal/SignalFilters";
import {
  filterSignals,
  loadSignals,
  type SignalFilters as SignalFiltersValue
} from "@/lib/mock/signals";

const defaultFilters: SignalFiltersValue = {
  category: "all",
  radiusMiles: DEFAULT_DISCOVERY_RADIUS_MILES,
  sort: "nearest",
  time: "all"
};

export default function NearbyPage() {
  const [filters, setFilters] = useState<SignalFiltersValue>(defaultFilters);
  const [signals] = useState(() => loadSignals());

  const visibleSignals = useMemo(
    () => filterSignals(signals, filters),
    [filters, signals]
  );

  return (
    <PageShell>
      <section className="page-hero page-hero--compact">
        <div>
          <h1>Nearby signals</h1>
          <p>Active local plans, sorted only by distance or time.</p>
        </div>
      </section>
      <SignalFilters filters={filters} onChange={setFilters} />
      <section className="signal-list" aria-label="Active nearby signals">
        {visibleSignals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
        {visibleSignals.length === 0 ? (
          <div className="empty-state">
            <h2>No active signals in this view.</h2>
            <p>Try a wider radius or a different category.</p>
          </div>
        ) : null}
      </section>
    </PageShell>
  );
}
