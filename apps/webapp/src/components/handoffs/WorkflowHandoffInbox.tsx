"use client";

import { useState } from "react";
import {
  type ParsedVicinaWorkflowHandoff,
  vicinaWorkflowHandoffSchema
} from "@vicina/validation";

export function WorkflowHandoffInbox() {
  const [handoffJson, setHandoffJson] = useState("");
  const [handoff, setHandoff] = useState<ParsedVicinaWorkflowHandoff | null>(null);
  const [message, setMessage] = useState("Paste a Vicina workflow handoff to review the route.");

  async function sendToNextApp(target: ParsedVicinaWorkflowHandoff["targetApps"][number]) {
    if (!handoff) return;

    const payload =
      target === "proxy"
        ? {
            clientApp: "vicina",
            surface: "operator-brief",
            profileId: "profile:default",
            purpose: `Shape Vicina ${handoff.workflow} context for operator review.`,
            draftText: [handoff.signal?.title, handoff.signal?.description, handoff.operatorNote].filter(Boolean).join("\n\n"),
            hardConstraints: ["Preserve local context", "Do not invent venue or participant details"],
            traceId: `vicina-${handoff.workflow}-${handoff.exportedAtMs}`
          }
        : target === "guardrail"
          ? {
              schema: "tenra-guardrail.external-action-review.v1",
              exportedAt: new Date().toISOString(),
              sourceApp: "vicina",
              actionKind: "moderation-action",
              actorLabel: "Vicina workflow inbox",
              targetLabel: handoff.signal?.title ?? handoff.workflow,
              summary: handoff.operatorNote,
              evidence: [
                { label: "Workflow", value: handoff.workflow },
                { label: "Targets", value: handoff.targetApps.join(", ") }
              ],
              recommendedDecision: "review",
              traceId: `vicina-${handoff.workflow}-${handoff.exportedAtMs}-guardrail`
            }
          : handoff;

    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setMessage(`Prepared ${target} handoff JSON.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Could not prepare ${target} handoff.`);
    }
  }

  function importHandoff() {
    if (!handoffJson.trim()) {
      setMessage("Paste a Vicina workflow handoff before importing.");
      return;
    }

    try {
      const parsed = vicinaWorkflowHandoffSchema.safeParse(JSON.parse(handoffJson));

      if (!parsed.success) {
        setHandoff(null);
        setMessage(parsed.error.issues[0]?.message ?? "Workflow handoff import failed.");
        return;
      }

      setHandoff(parsed.data);
      setMessage(`Imported ${parsed.data.schema} for ${parsed.data.targetApps.join(", ")}.`);
    } catch (error) {
      setHandoff(null);
      setMessage(error instanceof Error ? error.message : "Workflow handoff import failed.");
    }
  }

  return (
    <section className="workflow-inbox" aria-label="Workflow handoff inbox">
      <div className="workflow-inbox__header">
        <span>Suite inbox</span>
        <h2>Workflow handoff</h2>
      </div>
      <label>
        <span>Handoff JSON</span>
        <textarea
          rows={6}
          value={handoffJson}
          onChange={(event) => setHandoffJson(event.target.value)}
        />
      </label>
      <div className="workflow-inbox__actions">
        <button type="button" onClick={importHandoff}>
          Import handoff
        </button>
        <p>{message}</p>
      </div>
      {handoff ? (
        <dl className="workflow-inbox__summary">
          <div>
            <dt>Workflow</dt>
            <dd>{handoff.workflow}</dd>
          </div>
          <div>
            <dt>Targets</dt>
            <dd>{handoff.targetApps.join(", ")}</dd>
          </div>
          <div>
            <dt>Signal</dt>
            <dd>{handoff.signal?.title ?? "No signal attached"}</dd>
          </div>
          <div>
            <dt>Operator note</dt>
            <dd>{handoff.operatorNote}</dd>
          </div>
          <div>
            <dt>Send next</dt>
            <dd>
              {handoff.targetApps.map((target) => (
                <button key={target} type="button" onClick={() => void sendToNextApp(target)}>
                  Send {target}
                </button>
              ))}
            </dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
