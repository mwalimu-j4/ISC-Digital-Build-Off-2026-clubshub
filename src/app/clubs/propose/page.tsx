'use client';

import { FormEvent, useState } from 'react';

export default function ProposeClubPage() {
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/clubs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        description: form.get('description'),
        purpose: form.get('purpose'),
        category: form.get('category'),
        activities: String(form.get('activities'))
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    });
    setMessage(
      response.ok
        ? 'Proposal submitted for review.'
        : ((await response.json()).error ?? 'Unable to submit proposal.'),
    );
  }
  return (
    <main className="site-container" style={{ paddingBlock: '4rem', maxWidth: 720 }}>
      <p className="eyebrow">Start a club</p>
      <h1>Submit a club proposal</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: '1rem' }}>
        <input name="name" placeholder="Club name" required />
        <input name="category" placeholder="Category" required />
        <textarea name="description" placeholder="Description" required />
        <textarea name="purpose" placeholder="Purpose" required />
        <input name="activities" placeholder="Activities, separated by commas" required />
        <button className="button button-primary" type="submit">
          Submit proposal
        </button>
        {message ? <p role="status">{message}</p> : null}
      </form>
    </main>
  );
}
