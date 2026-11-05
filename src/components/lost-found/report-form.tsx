'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { ImageUpload } from '@/components/lost-found/image-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CAMPUS_AREAS, CAMPUS_BUILDINGS, CATEGORY_LABELS } from '@/modules/lost-found/constants';

interface ReportFormProps {
  type: 'LOST' | 'FOUND';
}

interface UploadedImage {
  url: string;
  publicId: string;
}

export function ReportForm({ type }: ReportFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<UploadedImage[]>([]);

  const [form, setForm] = useState({
    category: '',
    name: '',
    description: '',
    color: '',
    brand: '',
    model: '',
    distinguishing: '',
    serialNumber: '',
    campusArea: '',
    building: '',
    specificLocation: '',
    locationNotes: '',
    dateOccurred: '',
    timeOccurred: '',
    itemCondition: '',
    currentHolding: '',
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));
  const buildings = form.campusArea ? CAMPUS_BUILDINGS[form.campusArea] ?? [] : [];
  const isLost = type === 'LOST';
  const totalSteps = isLost ? 3 : 4;

  const canProceed = () => {
    if (step === 1) return !!(form.category && form.name && form.description);
    if (step === 2) return !!(form.campusArea && form.dateOccurred);
    return true;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/lost-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, reportType: type, images }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Submission failed');
      }
      const item = await res.json();
      toast.success(`${isLost ? 'Lost' : 'Found'} item reported successfully!`);
      router.push(`/lost-found/${item.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="site-container py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/lost-found" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline">
              ← Back to Lost &amp; Found
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl" style={{ letterSpacing: '-0.03em' }}>
              Report {isLost ? 'Lost' : 'Found'} Item
            </h1>
            <p className="mt-2 text-[var(--muted-foreground)]">
              {isLost
                ? 'Provide details about your lost item so we can help locate and recover it.'
                : 'Thank you for reporting a found item. Your report helps us reunite items with their owners.'}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8 flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex flex-1 items-center gap-2">
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  i + 1 <= step
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--secondary)] text-[var(--muted-foreground)]'
                }`}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`h-0.5 flex-1 rounded transition-colors ${i + 1 < step ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Item Details */}
          {step === 1 && (
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader>
                <CardTitle className="text-xl text-[var(--foreground)]">Item Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label className="text-[var(--muted-foreground)]">Category *</Label>
                  <Select value={form.category} onValueChange={(v: string) => update('category', v)}>
                    <SelectTrigger className="mt-1.5 border-[var(--border)] bg-[var(--secondary)]">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[var(--muted-foreground)]">Item Name *</Label>
                  <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Student ID Card, iPhone 15, Blue Backpack" className="mt-1.5 border-[var(--border)] bg-[var(--secondary)]" />
                </div>
                <div>
                  <Label className="text-[var(--muted-foreground)]">Description *</Label>
                  <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the item in detail — color, size, distinctive marks, any identifying features..." rows={4} className="mt-1.5 border-[var(--border)] bg-[var(--secondary)]" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-[var(--muted-foreground)]">Color</Label>
                    <Input value={form.color} onChange={(e) => update('color', e.target.value)} placeholder="e.g. Black, Navy Blue" className="mt-1.5 border-[var(--border)] bg-[var(--secondary)]" />
                  </div>
                  <div>
                    <Label className="text-[var(--muted-foreground)]">Brand</Label>
                    <Input value={form.brand} onChange={(e) => update('brand', e.target.value)} placeholder="e.g. Samsung, Nike" className="mt-1.5 border-[var(--border)] bg-[var(--secondary)]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-[var(--muted-foreground)]">Model</Label>
                    <Input value={form.model} onChange={(e) => update('model', e.target.value)} placeholder="e.g. Galaxy S24, Air Max" className="mt-1.5 border-[var(--border)] bg-[var(--secondary)]" />
                  </div>
                  <div>
                    <Label className="text-[var(--muted-foreground)]">Serial Number</Label>
                    <Input value={form.serialNumber} onChange={(e) => update('serialNumber', e.target.value)} placeholder="If applicable" className="mt-1.5 border-[var(--border)] bg-[var(--secondary)]" />
                  </div>
                </div>
                <div>
                  <Label className="text-[var(--muted-foreground)]">Distinguishing Features</Label>
                  <Textarea value={form.distinguishing} onChange={(e) => update('distinguishing', e.target.value)} placeholder="Any scratches, stickers, engravings, marks that make this item unique..." rows={2} className="mt-1.5 border-[var(--border)] bg-[var(--secondary)]" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Location & Time */}
          {step === 2 && (
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader>
                <CardTitle className="text-xl text-[var(--foreground)]">Location &amp; Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label className="text-[var(--muted-foreground)]">Campus Area *</Label>
                  <Select value={form.campusArea} onValueChange={(v: string) => { update('campusArea', v); update('building', ''); }}>
                    <SelectTrigger className="mt-1.5 border-[var(--border)] bg-[var(--secondary)]">
                      <SelectValue placeholder="Select campus area" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMPUS_AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {buildings.length > 0 && (
                  <div>
                    <Label className="text-[var(--muted-foreground)]">Building</Label>
                    <Select value={form.building} onValueChange={(v: string) => update('building', v)}>
                      <SelectTrigger className="mt-1.5 border-[var(--border)] bg-[var(--secondary)]">
                        <SelectValue placeholder="Select building" />
                      </SelectTrigger>
                      <SelectContent>
                        {buildings.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label className="text-[var(--muted-foreground)]">Specific Location</Label>
                  <Input value={form.specificLocation} onChange={(e) => update('specificLocation', e.target.value)} placeholder="e.g. Second floor, near the study tables" className="mt-1.5 border-[var(--border)] bg-[var(--secondary)]" />
                </div>
                <div>
                  <Label className="text-[var(--muted-foreground)]">Additional Location Notes</Label>
                  <Textarea value={form.locationNotes} onChange={(e) => update('locationNotes', e.target.value)} placeholder="Any additional details about where the item was last seen or found..." rows={2} className="mt-1.5 border-[var(--border)] bg-[var(--secondary)]" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-[var(--muted-foreground)]">Date {isLost ? 'Last Seen' : 'Found'} *</Label>
                    <Input type="date" value={form.dateOccurred} onChange={(e) => update('dateOccurred', e.target.value)} className="mt-1.5 border-[var(--border)] bg-[var(--secondary)]" />
                  </div>
                  <div>
                    <Label className="text-[var(--muted-foreground)]">Approximate Time</Label>
                    <Input type="time" value={form.timeOccurred} onChange={(e) => update('timeOccurred', e.target.value)} className="mt-1.5 border-[var(--border)] bg-[var(--secondary)]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3 (Found only): Condition & Holding */}
          {step === 3 && !isLost && (
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader>
                <CardTitle className="text-xl text-[var(--foreground)]">Item Condition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label className="text-[var(--muted-foreground)]">Condition</Label>
                  <Select value={form.itemCondition} onValueChange={(v: string) => update('itemCondition', v)}>
                    <SelectTrigger className="mt-1.5 border-[var(--border)] bg-[var(--secondary)]">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent — No damage</SelectItem>
                      <SelectItem value="Good">Good — Minor wear</SelectItem>
                      <SelectItem value="Fair">Fair — Some damage</SelectItem>
                      <SelectItem value="Poor">Poor — Significant damage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[var(--muted-foreground)]">Where is the item now?</Label>
                  <Textarea value={form.currentHolding} onChange={(e) => update('currentHolding', e.target.value)} placeholder="e.g. I left it at the library reception desk, I have it with me" rows={3} className="mt-1.5 border-[var(--border)] bg-[var(--secondary)]" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Last Step: Images */}
          {step === totalSteps && (
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader>
                <CardTitle className="text-xl text-[var(--foreground)]">Photos &amp; Submit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label className="mb-2 text-[var(--muted-foreground)]">Upload Images (optional but recommended)</Label>
                  <ImageUpload images={images} onChange={setImages} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : router.push('/lost-found')} className="text-[var(--muted-foreground)]">
              {step > 1 ? '← Previous' : '← Cancel'}
            </Button>
            {step < totalSteps ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="bg-[var(--primary)] font-bold text-white hover:bg-[var(--primary-hover)]">
                Continue →
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting || !canProceed()} className="bg-[var(--primary)] px-8 font-bold text-white hover:bg-[var(--primary-hover)]">
                {submitting ? 'Submitting...' : `Submit ${isLost ? 'Lost' : 'Found'} Report`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
