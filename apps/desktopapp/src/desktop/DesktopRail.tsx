import type { RefObject } from "react";
import { APP_NAME } from "@vicina/config";
import { areaOptions } from "./data";
import type { VicinaDesktopBoardActions, VicinaDesktopBoardState } from "./useVicinaDesktopBoard";

interface DesktopRailProps {
  actions: VicinaDesktopBoardActions;
  importInputRef: RefObject<HTMLInputElement | null>;
  state: VicinaDesktopBoardState;
}

export function DesktopRail({ actions, importInputRef, state }: DesktopRailProps) {
  return (
    <aside className="app-rail" aria-label="Vicina desktop navigation">
      <div>
        <p className="brand-mark">V</p>
        <h1>{APP_NAME}</h1>
        <p className="rail-copy">Local coordination for nearby plans and low-pressure meetups.</p>
      </div>

      <label className="field">
        <span>Browse area</span>
        <select
          value={state.filters.areaId}
          onChange={(event) =>
            actions.setFilters({ ...state.filters, areaId: event.target.value, sort: "nearest" })
          }
        >
          {areaOptions.map((area) => (
            <option key={area.id} value={area.id}>
              {area.label}
            </option>
          ))}
        </select>
      </label>

      <form className="profile-panel" onSubmit={actions.handleSaveProfile}>
        <h3>Profile</h3>
        <label className="field">
          <span>Name</span>
          <input
            value={state.profileDraft.displayName}
            onChange={(event) =>
              actions.setProfileDraft((current) => ({ ...current, displayName: event.target.value }))
            }
          />
        </label>
        <label className="field">
          <span>Bio</span>
          <textarea
            rows={3}
            value={state.profileDraft.bio}
            onChange={(event) => actions.setProfileDraft((current) => ({ ...current, bio: event.target.value }))}
          />
        </label>
        <button type="submit">Save profile</button>
      </form>

      <section className="local-data-panel" aria-label="Local board data">
        <h3>Local data</h3>
        <div className="local-data-actions">
          <button type="button" onClick={actions.exportBoard}>
            Export board
          </button>
          <button type="button" onClick={() => importInputRef.current?.click()}>
            Import board
          </button>
        </div>
        <p className="muted">{state.boardNotice}</p>
        <input
          ref={importInputRef}
          className="hidden-file-input"
          type="file"
          accept="application/json"
          onChange={actions.importBoard}
        />
      </section>

      <div className="rail-metrics" aria-label="Signal summary">
        <div>
          <span>Active</span>
          <strong>{state.visibleSignals.length}</strong>
        </div>
        <div>
          <span>Reports</span>
          <strong>{state.reportedSignalIds.length}</strong>
        </div>
        <div>
          <span>Blocked</span>
          <strong>{state.blockedAuthorIds.length}</strong>
        </div>
      </div>

      <section className="report-review" aria-label="Reported signals">
        <h3>Report review</h3>
        {state.reportedSignals.length ? (
          <div className="report-list">
            {state.reportedSignals.map((signal) => (
              <div key={signal.id} className="report-row">
                <button type="button" onClick={() => actions.selectReportedSignal(signal)}>
                  {signal.title}
                </button>
                <button type="button" onClick={() => actions.handleClearReport(signal.id)}>
                  Clear
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No reports pending.</p>
        )}
      </section>
    </aside>
  );
}
