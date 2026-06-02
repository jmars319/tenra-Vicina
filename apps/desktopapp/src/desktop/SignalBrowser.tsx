import {
  DISCOVERY_RADIUS_MILES,
  SIGNAL_CATEGORY_LABELS,
  type DiscoveryRadiusMiles
} from "@vicina/domain";
import { categoryOptions, sortOptions, timeOptions } from "./data";
import { formatRelativeStart, getDistanceLabel, getMapPosition } from "./signalModel";
import type { CategoryFilter, SignalSort, TimeFilter } from "./types";
import type { VicinaDesktopBoardActions, VicinaDesktopBoardState } from "./useVicinaDesktopBoard";

interface SignalBrowserProps {
  actions: VicinaDesktopBoardActions;
  state: VicinaDesktopBoardState;
}

export function SignalBrowser({ actions, state }: SignalBrowserProps) {
  return (
    <section className="signal-column" aria-label="Nearby signals">
      <header className="section-header">
        <div>
          <p>Nearby signals</p>
          <h2>{state.selectedArea.label}</h2>
        </div>
        <div className="view-tools">
          <button
            className={state.viewMode === "list" ? "is-active" : ""}
            onClick={() => actions.setViewMode("list")}
            type="button"
          >
            List
          </button>
          <button
            className={state.viewMode === "map" ? "is-active" : ""}
            onClick={() => actions.setViewMode("map")}
            type="button"
          >
            Map
          </button>
          <span>{state.filters.radiusMiles} mi</span>
        </div>
      </header>

      <div className="filter-grid">
        <label className="field">
          <span>Category</span>
          <select
            value={state.filters.category}
            onChange={(event) =>
              actions.setFilters({ ...state.filters, category: event.target.value as CategoryFilter })
            }
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Time</span>
          <select
            value={state.filters.time}
            onChange={(event) =>
              actions.setFilters({ ...state.filters, time: event.target.value as TimeFilter })
            }
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Sort</span>
          <select
            value={state.filters.sort}
            onChange={(event) =>
              actions.setFilters({ ...state.filters, sort: event.target.value as SignalSort })
            }
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Radius</span>
          <select
            value={state.filters.radiusMiles}
            onChange={(event) =>
              actions.setFilters({
                ...state.filters,
                radiusMiles: Number(event.target.value) as DiscoveryRadiusMiles
              })
            }
          >
            {DISCOVERY_RADIUS_MILES.map((radius) => (
              <option key={radius} value={radius}>
                {radius} miles
              </option>
            ))}
          </select>
        </label>
      </div>

      {state.viewMode === "list" ? (
        <SignalList actions={actions} state={state} />
      ) : (
        <SignalMap actions={actions} state={state} />
      )}
    </section>
  );
}

function SignalList({ actions, state }: SignalBrowserProps) {
  return (
    <div className="signal-list">
      {state.visibleSignals.map((signal) => (
        <button
          className={`signal-row ${state.selectedSignal?.id === signal.id ? "is-selected" : ""}`}
          key={signal.id}
          onClick={() => actions.setSelectedSignalId(signal.id)}
          type="button"
        >
          <span>{SIGNAL_CATEGORY_LABELS[signal.category]}</span>
          <strong>{signal.title}</strong>
          <small>
            {formatRelativeStart(signal.startsAtMs)} ·{" "}
            {getDistanceLabel(signal, state.selectedArea.coordinates)}
          </small>
        </button>
      ))}

      {state.visibleSignals.length === 0 ? <EmptySignalState /> : null}
    </div>
  );
}

function SignalMap({ actions, state }: SignalBrowserProps) {
  return (
    <div className="signal-map" aria-label="Signal map">
      <div className="map-center">{state.selectedArea.label}</div>
      {state.visibleSignals.map((signal) => {
        const position = getMapPosition(signal, state.selectedArea.coordinates);
        return (
          <button
            key={signal.id}
            className={`map-dot ${state.selectedSignal?.id === signal.id ? "is-selected" : ""}`}
            onClick={() => actions.setSelectedSignalId(signal.id)}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            type="button"
          >
            <span>{signal.title}</span>
          </button>
        );
      })}
      {state.visibleSignals.length === 0 ? <EmptySignalState /> : null}
    </div>
  );
}

function EmptySignalState() {
  return (
    <div className="empty-state">
      <strong>No active signals in this view.</strong>
      <span>Adjust the filters or create a signal for the selected area.</span>
    </div>
  );
}
