'use client';

import { useState } from 'react';

type Proposal = {
  id: string;
  name: string;
  category: string;
  description: string;
  purpose: string;
  activities: string[];
  status: string;
};

export function AdminReviewList({ proposals }: { proposals: Proposal[] }) {
  const [items, setItems] = useState(proposals);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function review(id: string, decision: 'approve' | 'reject' | 'request-changes') {
    const reason =
      decision === 'approve'
        ? undefined
        : window
            .prompt(decision === 'reject' ? 'Reason for rejection' : 'Changes required')
            ?.trim();

    if (decision !== 'approve' && !reason) return;

    setBusyId(id);
    setMessage('');
    const response = await fetch(`/api/clubs/${id}/review`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ decision, ...(reason ? { reason } : {}) }),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setMessage(body.error ?? 'Unable to update the proposal.');
      setBusyId(null);
      return;
    }

    setItems((current) => current.filter((proposal) => proposal.id !== id));
    setMessage(
      decision === 'approve'
        ? 'Club approved and its proposer is now the club administrator.'
        : 'Proposal review decision saved.',
    );
    setBusyId(null);
  }

  if (items.length === 0) {
    return (
      <p className="admin-empty" role="status">
        There are no proposals waiting for review.
      </p>
    );
  }

  return (
    <div className="admin-review-list">
      {message ? (
        <p className="admin-feedback" role="status">
          {message}
        </p>
      ) : null}
      {items.map((proposal) => (
        <article className="admin-review-card" key={proposal.id}>
          <span className="admin-initial">{proposal.name.charAt(0)}</span>
          <div className="admin-review-copy">
            <p className="admin-eyebrow">{proposal.category}</p>
            <h2>{proposal.name}</h2>
            <p>{proposal.description}</p>
            <p>
              <strong>Purpose:</strong> {proposal.purpose}
            </p>
            <p>
              <strong>Activities:</strong> {proposal.activities.join(', ')}
            </p>
            <div className="header-actions">
              <button
                className="button button-primary"
                disabled={busyId === proposal.id}
                onClick={() => review(proposal.id, 'approve')}
                type="button"
              >
                Approve
              </button>
              <button
                className="button"
                disabled={busyId === proposal.id}
                onClick={() => review(proposal.id, 'request-changes')}
                type="button"
              >
                Request changes
              </button>
              <button
                className="button"
                disabled={busyId === proposal.id}
                onClick={() => review(proposal.id, 'reject')}
                type="button"
              >
                Reject
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
