'use client';

import { useState } from 'react';
import { dollars, views as fmtViews } from '@/lib/format';

/**
 * Deliberately an estimator, not a promise. Every campaign sets its own rate,
 * so the sliders show a range and the fine print says so — a calculator that
 * implies guaranteed income is the fastest way to lose a clipper's trust the
 * first time a payout lands lower.
 */
const PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'X'] as const;

export function EarningsCalculator() {
  const [platform, setPlatform] = useState<string>('TikTok');
  const [viewsPerClip, setViewsPerClip] = useState(1_000_000);
  const [ratePer100k, setRatePer100k] = useState(40);
  const [clipsPerMonth, setClipsPerMonth] = useState(8);

  const perClip = (viewsPerClip / 100_000) * ratePer100k;
  const monthly = perClip * clipsPerMonth;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Field label="Platform">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PLATFORMS.map((p) => {
              const on = p === platform;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  aria-pressed={on}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 999,
                    fontFamily: 'var(--font-display), sans-serif',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    minHeight: 44,
                    border: `1.5px solid ${on ? 'var(--ink)' : 'var(--cream-line)'}`,
                    background: on ? 'var(--ink)' : 'transparent',
                    color: on ? 'var(--cream)' : 'var(--ink-soft)',
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </Field>

        <Slider
          label="Views per clip"
          value={fmtViews(viewsPerClip)}
          min={50_000}
          max={5_000_000}
          step={50_000}
          raw={viewsPerClip}
          onChange={setViewsPerClip}
          minLabel="50K"
          maxLabel="5M"
        />

        <Slider
          label="Campaign rate"
          value={`$${ratePer100k} /100k`}
          min={10}
          max={100}
          step={1}
          raw={ratePer100k}
          onChange={setRatePer100k}
          minLabel="$10/100k"
          maxLabel="$100/100k"
        />

        <Slider
          label="Clips per month"
          value={String(clipsPerMonth)}
          min={1}
          max={30}
          step={1}
          raw={clipsPerMonth}
          onChange={setClipsPerMonth}
          minLabel="1"
          maxLabel="30"
        />
      </div>

      <div className="card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="eyebrow" style={{ fontSize: 11.5 }}>
            Estimated monthly earnings
          </span>
          <span className="display tabular" style={{ fontSize: 'clamp(38px, 7vw, 54px)', fontWeight: 700, lineHeight: 1 }}>
            {dollars(monthly)}
          </span>
          <span style={{ fontSize: 14, color: 'var(--ink-faint)' }}>
            {clipsPerMonth} {clipsPerMonth === 1 ? 'clip' : 'clips'} on {platform} &middot; {fmtViews(viewsPerClip)} average
            views each
          </span>
        </div>

        <div style={{ borderTop: '1px solid var(--cream-line)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Row label="Per clip" value={dollars(perClip)} />
          <Row label="Views per clip" value={fmtViews(viewsPerClip)} />
          <Row label="Rate" value={`$${ratePer100k} / 100k`} />
          <Row label="Clips per month" value={String(clipsPerMonth)} />
          <div style={{ borderTop: '1px solid var(--cream-line)', paddingTop: 12 }}>
            <Row label="Monthly total" value={dollars(monthly)} strong />
          </div>
        </div>

        <p style={{ fontSize: 12.5, color: 'var(--ink-faint)', margin: 0, lineHeight: 1.5 }}>
          An estimate, not a promise. What you actually take home depends on the campaign&rsquo;s rate, whether your
          clips clear its view minimum, and whether they pass review. Campaign pools also run out — a rate is only good
          while there is budget left behind it.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{label}</span>
      {children}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  raw,
  onChange,
  minLabel,
  maxLabel,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  raw: number;
  onChange: (n: number) => void;
  minLabel: string;
  maxLabel: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
        <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{label}</span>
        <span className="display tabular" style={{ fontSize: 19, fontWeight: 700 }}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={raw}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent)', height: 28, cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-faint)' }}>
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
      <span style={{ fontSize: 14.5, color: strong ? 'var(--ink)' : 'var(--ink-soft)', fontWeight: strong ? 600 : 400 }}>
        {label}
      </span>
      <span className="display tabular" style={{ fontSize: 15, fontWeight: strong ? 700 : 600 }}>
        {value}
      </span>
    </div>
  );
}
