'use client';

import Link from 'next/link';

import { getOptimizedUrl } from '@/lib/utils/cloudinary-url';
import { CATEGORY_ICONS, CATEGORY_LABELS, STATUS_LABELS } from '@/modules/lost-found/constants';

interface ItemImage {
  url: string;
  publicId: string;
}

interface ItemCardProps {
  id: string;
  reportType: 'LOST' | 'FOUND';
  status: string;
  category: string;
  name: string;
  description: string;
  campusArea: string;
  building?: string | null;
  dateOccurred: string;
  images?: ItemImage[] | unknown;
  referenceCode?: string | null;
}

export function ItemCard({ id, reportType, status, category, name, description, campusArea, building, dateOccurred, images, referenceCode }: ItemCardProps) {
  const imageList = Array.isArray(images) ? (images as ItemImage[]) : [];
  const primaryImage = imageList[0];
  const categoryLabel = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category;
  const categoryIcon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] ?? '📦';
  const statusLabel = STATUS_LABELS[status] ?? status;

  const date = new Date(dateOccurred);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Link href={`/lost-found/${id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all duration-300 hover:border-[var(--ring)] hover:shadow-lg hover:shadow-black/20 hover:-translate-y-1">
        {/* Image area */}
        <div className="relative h-48 overflow-hidden bg-[var(--secondary)]">
          {primaryImage ? (
            <img
              src={getOptimizedUrl(primaryImage.url, { width: 400, height: 240 })}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl opacity-40">
              {categoryIcon}
            </div>
          )}
          {/* Type badge */}
          <div className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
            reportType === 'LOST'
              ? 'bg-red-500/90 text-white'
              : 'bg-emerald-500/90 text-white'
          }`}>
            {reportType}
          </div>
          {/* Status badge */}
          <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {statusLabel}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-bold text-[var(--foreground)]">
                {name}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-[var(--muted-foreground)]">
                {categoryIcon} {categoryLabel}
              </p>
            </div>
          </div>

          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {description}
          </p>

          <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {building || campusArea}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {dateStr}
            </span>
          </div>

          {referenceCode && (
            <div className="mt-3 rounded-lg bg-[var(--secondary)] px-3 py-1.5 text-center text-xs font-mono font-bold text-[var(--accent)] tracking-widest">
              {referenceCode}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
      <div className="h-48 animate-pulse bg-[var(--secondary)]" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-[var(--secondary)]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--secondary)]" />
        <div className="h-10 animate-pulse rounded bg-[var(--secondary)]" />
        <div className="flex gap-3">
          <div className="h-3 w-20 animate-pulse rounded bg-[var(--secondary)]" />
          <div className="h-3 w-16 animate-pulse rounded bg-[var(--secondary)]" />
        </div>
      </div>
    </div>
  );
}
