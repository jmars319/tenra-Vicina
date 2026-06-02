import {
  DISCOVERY_RADIUS_MILES,
  SIGNAL_CATEGORIES,
  SIGNAL_CATEGORY_LABELS,
  type DiscoveryRadiusMiles,
  type SignalCategory
} from "@vicina/domain";
import { areaOptions } from "./data";
import { formatSignalWindow, getDistanceLabel } from "./signalModel";
import type { VicinaDesktopBoardActions, VicinaDesktopBoardState } from "./useVicinaDesktopBoard";

interface SignalDetailColumnProps {
  actions: VicinaDesktopBoardActions;
  state: VicinaDesktopBoardState;
}

export function SignalDetailColumn({ actions, state }: SignalDetailColumnProps) {
  return (
    <section className="detail-column" aria-label="Selected signal">
      {state.selectedSignal ? (
        <SignalDetail actions={actions} state={state} />
      ) : (
        <div className="detail-panel empty-state">
          <strong>Select a signal.</strong>
          <span>Nearby activity will appear here.</span>
        </div>
      )}

      <SignalEditor actions={actions} state={state} />
    </section>
  );
}

function SignalDetail({ actions, state }: SignalDetailColumnProps) {
  const selectedSignal = state.selectedSignal;
  if (!selectedSignal) return null;

  return (
    <article className="detail-panel">
      <header className="detail-header">
        <div>
          <p>{SIGNAL_CATEGORY_LABELS[selectedSignal.category]}</p>
          <h2>{selectedSignal.title}</h2>
        </div>
        <span>{getDistanceLabel(selectedSignal, state.selectedArea.coordinates)}</span>
      </header>

      <p className="description">{selectedSignal.description}</p>

      <dl className="detail-list">
        <div>
          <dt>Host</dt>
          <dd>{selectedSignal.authorDisplayName}</dd>
        </div>
        <div>
          <dt>Window</dt>
          <dd>{formatSignalWindow(selectedSignal.startsAtMs, selectedSignal.expiresAtMs)}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{selectedSignal.approximateLocationLabel}</dd>
        </div>
        <div>
          <dt>Interest</dt>
          <dd>{selectedSignal.interestedUserIds.length}</dd>
        </div>
      </dl>

      {state.reportedSignalIds.includes(selectedSignal.id) ? (
        <p className="status-note">Reported for review.</p>
      ) : null}

      <div className="action-row">
        <button
          className="primary-action"
          onClick={() => actions.handleToggleInterest(selectedSignal)}
          type="button"
        >
          {selectedSignal.interestedUserIds.includes(state.localProfile.id)
            ? "Interest added"
            : "Add interest"}
        </button>
        {selectedSignal.authorId === state.localProfile.id ? (
          <>
            <button onClick={() => actions.handleEditSignal(selectedSignal)} type="button">
              Edit
            </button>
            <button onClick={() => actions.handleDeleteSignal(selectedSignal)} type="button">
              Delete
            </button>
          </>
        ) : (
          <button onClick={() => actions.handleReportSignal(selectedSignal)} type="button">
            Report
          </button>
        )}
        <button
          disabled={selectedSignal.authorId === state.localProfile.id}
          onClick={() => actions.handleBlockAuthor(selectedSignal)}
          type="button"
        >
          Block host
        </button>
      </div>

      <section className="comments" aria-label="Signal replies">
        <h3>Replies</h3>
        <div className="comment-list">
          {selectedSignal.comments.map((comment) => (
            <div className="comment" key={comment.id}>
              <strong>{comment.authorDisplayName}</strong>
              <p>{comment.body}</p>
            </div>
          ))}
          {selectedSignal.comments.length === 0 ? <p className="muted">No replies yet.</p> : null}
        </div>

        <form className="comment-form" onSubmit={actions.handleAddComment}>
          <input
            aria-label="Reply"
            onChange={(event) => actions.setCommentBody(event.target.value)}
            placeholder="Add a reply"
            value={state.commentBody}
          />
          <button type="submit">Send</button>
        </form>
      </section>
    </article>
  );
}

function SignalEditor({ actions, state }: SignalDetailColumnProps) {
  return (
    <form className="create-panel" onSubmit={actions.handleSaveSignal}>
      <header className="section-header compact">
        <div>
          <p>{state.isEditingSignal ? "Edit" : "Create"}</p>
          <h2>{state.isEditingSignal ? "Edit signal" : "New signal"}</h2>
        </div>
        {state.isEditingSignal ? (
          <button onClick={actions.handleCancelSignalEdit} type="button">
            Cancel
          </button>
        ) : null}
      </header>

      <div className="form-grid">
        <label className="field wide">
          <span>Title</span>
          <input
            onChange={(event) => actions.setDraft({ ...state.draft, title: event.target.value })}
            placeholder="Coffee, walk, study block"
            value={state.draft.title}
          />
        </label>

        <label className="field">
          <span>Area</span>
          <select
            value={state.draft.areaId}
            onChange={(event) => actions.setDraft({ ...state.draft, areaId: event.target.value })}
          >
            {areaOptions.map((area) => (
              <option key={area.id} value={area.id}>
                {area.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Category</span>
          <select
            value={state.draft.category}
            onChange={(event) =>
              actions.setDraft({ ...state.draft, category: event.target.value as SignalCategory })
            }
          >
            {SIGNAL_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {SIGNAL_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Visible radius</span>
          <select
            value={state.draft.radiusMiles}
            onChange={(event) =>
              actions.setDraft({
                ...state.draft,
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

        <label className="field">
          <span>Hours active</span>
          <input
            max="24"
            min="1"
            onChange={(event) => actions.setDraft({ ...state.draft, durationHours: event.target.value })}
            type="number"
            value={state.draft.durationHours}
          />
        </label>

        <label className="field wide">
          <span>Description</span>
          <textarea
            onChange={(event) => actions.setDraft({ ...state.draft, description: event.target.value })}
            placeholder="Add the practical details."
            rows={3}
            value={state.draft.description}
          />
        </label>
      </div>

      <button className="primary-action" type="submit">
        {state.isEditingSignal ? "Save signal" : "Create signal"}
      </button>
    </form>
  );
}
