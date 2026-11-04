'use client';

import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

const categories = ['Academic', 'Arts & Culture', 'Sports', 'Technology', 'Community', 'Other'];

export default function ProposeClubPage() {
  const [activities, setActivities] = useState<string[]>([]);
  const [activity, setActivity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function addActivity() {
    const value = activity.trim();
    if (!value) return;
    if (activities.includes(value)) {
      toast.error('That activity has already been added.');
      return;
    }
    setActivities((current) => [...current, value]);
    setActivity('');
  }

  function removeActivity(value: string) {
    setActivities((current) => current.filter((item) => item !== value));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activities.length === 0) {
      toast.error('Add at least one proposed activity.');
      return;
    }

    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          description: form.get('description'),
          purpose: form.get('purpose'),
          category: form.get('category'),
          activities,
        }),
      });

      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(body.error ?? 'Unable to submit proposal.');
        return;
      }

      toast.success('Proposal submitted for review.', {
        description: 'You can track its status from My clubs.',
      });
      event.currentTarget.reset();
      setActivities([]);
    } catch {
      toast.error('Unable to reach ClubsHub. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="proposal-page site-container">
      <section className="proposal-intro">
        <p className="eyebrow">Start a club</p>
        <h1>Bring your community to life.</h1>
        <p>
          Share the idea with campus. Our team will review your proposal and let you know when your
          club is ready to welcome members.
        </p>
        <div className="proposal-steps" aria-label="Proposal steps">
          <span>
            <strong>01</strong> Tell us about it
          </span>
          <span>
            <strong>02</strong> We review it
          </span>
          <span>
            <strong>03</strong> Build your community
          </span>
        </div>
      </section>

      <form className="proposal-card" onSubmit={submit}>
        <div className="proposal-card-heading">
          <div>
            <p className="eyebrow">Club details</p>
            <h2>Make it memorable</h2>
          </div>
          <span className="proposal-required">All fields required</span>
        </div>

        <div className="proposal-grid">
          <label>
            Club name
            <input name="name" placeholder="e.g. Campus Creative Lab" required />
          </label>
          <label>
            Category
            <select defaultValue="" name="category" required>
              <option disabled value="">
                Choose a category
              </option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Short description
          <textarea
            name="description"
            placeholder="What should students know about this club?"
            required
            rows={4}
          />
        </label>

        <label>
          Club purpose
          <textarea
            name="purpose"
            placeholder="What will members learn, create, or experience together?"
            required
            rows={4}
          />
        </label>

        <fieldset>
          <legend>Proposed activities</legend>
          <div className="activity-entry">
            <input
              aria-label="New activity"
              onChange={(event) => setActivity(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addActivity();
                }
              }}
              placeholder="e.g. Weekly workshops"
              value={activity}
            />
            <button className="button button-secondary" onClick={addActivity} type="button">
              Add activity
            </button>
          </div>
          <div className="activity-tags" aria-live="polite">
            {activities.map((item) => (
              <button
                className="activity-tag"
                key={item}
                onClick={() => removeActivity(item)}
                title={`Remove ${item}`}
                type="button"
              >
                {item} <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
          <small>Add activities one at a time. Press Enter or click Add activity.</small>
        </fieldset>

        <div className="proposal-submit">
          <p>Every proposal is reviewed by the ClubsHub team before it goes public.</p>
          <button
            className="button button-primary button-large"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Submitting…' : 'Submit proposal'}
          </button>
        </div>
      </form>
    </main>
  );
}
