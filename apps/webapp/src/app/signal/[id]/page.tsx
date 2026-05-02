"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SIGNAL_CATEGORY_LABELS } from "@vicina/domain";
import { MessageCircle, ShieldAlert, UserX } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import {
  LOCAL_USER,
  findSignal,
  getDistanceLabel,
  getInterestCount,
  updateSignal,
  type SignalRecord
} from "@/lib/mock/signals";
import { formatSignalWindow } from "@/lib/utils/time";

export default function SignalDetailPage() {
  const params = useParams<{ id: string }>();
  const [signal, setSignal] = useState<SignalRecord | null>(() => findSignal(params.id) ?? null);
  const [reply, setReply] = useState("");
  const [notice, setNotice] = useState("");

  if (!signal) {
    return (
      <PageShell>
        <div className="empty-state">
          <h1>Signal not found</h1>
          <p>This signal may have expired or been removed.</p>
          <Link className="button button--secondary" href="/nearby">
            Back to nearby
          </Link>
        </div>
      </PageShell>
    );
  }

  function save(nextSignal: SignalRecord, nextNotice?: string) {
    updateSignal(nextSignal);
    setSignal(nextSignal);
    setNotice(nextNotice ?? "");
  }

  function markInterested() {
    if (!signal || signal.interestedUserIds.includes(LOCAL_USER.id)) {
      return;
    }

    save(
      {
        ...signal,
        interestedUserIds: [...signal.interestedUserIds, LOCAL_USER.id]
      },
      "Marked interested."
    );
  }

  function postReply() {
    if (!signal || !reply.trim()) {
      return;
    }

    const nowMs = Date.now();
    save(
      {
        ...signal,
        comments: [
          ...signal.comments,
          {
            id: `web-comment-${nowMs}`,
            signalId: signal.id,
            authorId: LOCAL_USER.id,
            authorDisplayName: LOCAL_USER.displayName,
            body: reply.trim(),
            contentStatus: "visible",
            createdAtMs: nowMs,
            updatedAtMs: nowMs
          }
        ]
      },
      "Reply posted."
    );
    setReply("");
  }

  function reportSignal() {
    if (!signal) {
      return;
    }

    save({ ...signal, contentStatus: "reported" }, "Report saved for review.");
  }

  function blockUser() {
    setNotice("User blocked in this browser session.");
  }

  return (
    <PageShell>
      <section className="signal-detail">
        <div className="signal-detail__main">
          <div className="detail-heading">
            <span className="tag">{SIGNAL_CATEGORY_LABELS[signal.category]}</span>
            <h1>{signal.title}</h1>
            <p>{signal.description}</p>
          </div>

          <Card className="detail-card">
            <div className="detail-grid">
              <DetailItem label="Area" value={signal.approximateLocationLabel} />
              <DetailItem label="Distance" value={getDistanceLabel(signal)} />
              <DetailItem
                label="Time"
                value={formatSignalWindow(signal.startsAtMs, signal.expiresAtMs)}
              />
              <DetailItem label="Interest" value={`${getInterestCount(signal)} interested`} />
            </div>
            <Button onClick={markInterested}>{"I'm interested"}</Button>
          </Card>

          <Card className="thread-card">
            <div className="section-title">
              <MessageCircle aria-hidden="true" size={18} />
              <h2>Thread</h2>
            </div>
            <div className="comment-list">
              {signal.comments.map((comment) => (
                <article className="comment" key={comment.id}>
                  <strong>{comment.authorDisplayName}</strong>
                  <p>{comment.body}</p>
                </article>
              ))}
              {signal.comments.length === 0 ? (
                <p className="muted-copy">No replies yet.</p>
              ) : null}
            </div>
            <Textarea
              label="Reply"
              onChange={(event) => setReply(event.target.value)}
              placeholder="Coordinate the next detail."
              value={reply}
            />
            <Button onClick={postReply} variant="secondary">
              Post reply
            </Button>
          </Card>
        </div>

        <aside className="safety-panel">
          <Card>
            <div className="section-title">
              <ShieldAlert aria-hidden="true" size={18} />
              <h2>Safety</h2>
            </div>
            <p className="muted-copy">
              Reports and blocks stay private and do not create public scores.
            </p>
            <Button onClick={reportSignal} variant="danger">
              Report signal
            </Button>
            <Button onClick={blockUser} variant="secondary">
              <UserX aria-hidden="true" size={16} />
              Block user
            </Button>
            {notice ? <p className="form-message">{notice}</p> : null}
          </Card>
        </aside>
      </section>
    </PageShell>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
