'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';

import { ImageUpload } from '@/components/lost-found/image-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ReportFormProps {
  type: 'LOST' | 'FOUND';
}

interface UploadedImage {
  url: string;
  publicId: string;
}

interface SubmittedReport {
  id: string;
  referenceCode?: string | null;
  status: string;
}

type FormValues = {
  name: string;
  location: string;
  dateOccurred: string;
  description: string;
  currentHolding: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialForm: FormValues = {
  name: '',
  location: '',
  dateOccurred: '',
  description: '',
  currentHolding: '',
};

export function ReportForm({ type }: ReportFormProps) {
  const router = useRouter();
  const isLost = type === 'LOST';
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<SubmittedReport | null>(null);

  const update = (field: keyof FormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError('');
  };

  const validate = (): FieldErrors => {
    const nextErrors: FieldErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Item name is required.';
    if (!form.location.trim())
      nextErrors.location = `Please enter where you ${isLost ? 'last saw' : 'found'} the item.`;
    if (!form.dateOccurred)
      nextErrors.dateOccurred = `Please select the date you ${isLost ? 'last saw' : 'found'} the item.`;
    if (!isLost && !form.currentHolding.trim())
      nextErrors.currentHolding = 'Please enter where the item is now.';
    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const response = await fetch('/api/lost-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: type,
          name: form.name,
          location: form.location,
          dateOccurred: form.dateOccurred,
          description: form.description,
          ...(isLost ? {} : { currentHolding: form.currentHolding }),
          images,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors as FieldErrors);
        }
        throw new Error(result.error || 'We could not submit your report. Please try again.');
      }

      setSubmittedReport(result);
      toast.success(`${isLost ? 'Lost' : 'Found'} report submitted successfully.`);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'We could not submit your report. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedReport) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <div className="site-container py-12 sm:py-20">
          <section className="mx-auto max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-sm sm:p-10">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl text-emerald-400"
              aria-hidden="true"
            >
              ✓
            </div>
            <h1 className="mt-5 text-2xl font-extrabold text-[var(--foreground)]">
              {isLost
                ? 'Lost report submitted successfully.'
                : 'Found item report submitted successfully.'}
            </h1>
            <p className="mt-3 text-[var(--muted-foreground)]">
              Keep this reference ID for future updates.
            </p>
            <div className="mt-6 rounded-xl bg-[var(--secondary)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Reference ID
              </p>
              <p className="mt-1 font-mono text-lg font-bold text-[var(--foreground)]">
                {submittedReport.referenceCode ?? submittedReport.id}
              </p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Status: {submittedReport.status.replaceAll('_', ' ')}
              </p>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                asChild
                className="bg-[var(--primary)] font-bold text-white hover:bg-[var(--primary-hover)]"
              >
                <Link href={`/lost-found/${submittedReport.id}`}>View report</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/lost-found')}
                className="border-[var(--border)]"
              >
                Back to Lost &amp; Found
              </Button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="site-container py-8 sm:py-14">
        <div className="mx-auto max-w-xl">
          <Link
            href="/lost-found"
            className="mb-5 inline-flex text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            ← Back to Lost &amp; Found
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Report {isLost ? 'a lost item' : 'a found item'}
          </h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Share the essentials. You can add more information later if needed.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
            <div>
              <Label htmlFor="name">
                {isLost ? 'What did you lose?' : 'What did you find?'}{' '}
                <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                placeholder={
                  isLost ? 'e.g. Phone, Student ID, Backpack' : 'e.g. Wallet, Keys, Laptop'
                }
                aria-invalid={Boolean(errors.name)}
                className="mt-2 h-12"
              />
              {errors.name && <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="location">
                {isLost ? 'Where did you last see it?' : 'Where did you find it?'}{' '}
                <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="location"
                value={form.location}
                onChange={(event) => update('location', event.target.value)}
                placeholder="e.g. Main Library, Student Centre"
                aria-invalid={Boolean(errors.location)}
                className="mt-2 h-12"
              />
              {errors.location && <p className="mt-1.5 text-sm text-red-400">{errors.location}</p>}
            </div>

            <div>
              <Label htmlFor="dateOccurred">
                {isLost ? 'When did you last see it?' : 'When did you find it?'}{' '}
                <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="dateOccurred"
                type="date"
                value={form.dateOccurred}
                onChange={(event) => update('dateOccurred', event.target.value)}
                aria-invalid={Boolean(errors.dateOccurred)}
                className="mt-2 h-12"
              />
              {errors.dateOccurred && (
                <p className="mt-1.5 text-sm text-red-400">{errors.dateOccurred}</p>
              )}
            </div>

            {!isLost && (
              <div>
                <Label htmlFor="currentHolding">
                  Where is the item now? <span aria-hidden="true">*</span>
                </Label>
                <Input
                  id="currentHolding"
                  value={form.currentHolding}
                  onChange={(event) => update('currentHolding', event.target.value)}
                  placeholder="e.g. Security Office, Main Reception, With me"
                  aria-invalid={Boolean(errors.currentHolding)}
                  className="mt-2 h-12"
                />
                {errors.currentHolding && (
                  <p className="mt-1.5 text-sm text-red-400">{errors.currentHolding}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="description">
                Anything that can help identify it?{' '}
                <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(event) => update('description', event.target.value)}
                placeholder={
                  isLost
                    ? 'e.g. black backpack with a blue stripe'
                    : 'e.g. black wallet with a small scratch'
                }
                rows={3}
                className="mt-2 resize-none"
              />
            </div>

            <div>
              <Label className="mb-2 block">
                Add a photo{' '}
                <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
              </Label>
              <ImageUpload images={images} onChange={setImages} />
            </div>

            {submitError && (
              <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                {submitError}
              </p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="h-12 w-full bg-[var(--primary)] font-bold text-white hover:bg-[var(--primary-hover)]"
            >
              {submitting ? 'Submitting report...' : `Submit ${isLost ? 'Lost' : 'Found'} Report`}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
