import type { CategoryId, Guide } from '@/lib/guides';

type VisualPlan = {
  outcome: string;
  steps: [string, string, string];
  focus: [string, string, string];
};

const CATEGORY_PLANS: Record<CategoryId, VisualPlan> = {
  start: {
    outcome: 'From source footage to a tracked submission',
    steps: ['Choose a low-minimum campaign', 'Cut one clear moment', 'Post, submit and log the result'],
    focus: ['Brief first', 'Hook in 3 seconds', 'Track at 48 hours'],
  },
  platform: {
    outcome: 'One clean master cut, adapted for the feed',
    steps: ['Build the strongest first frame', 'Keep captions inside the safe zone', 'Export a clean platform-specific version'],
    focus: ['No watermark', 'Readable crop', 'Native caption'],
  },
  earnings: {
    outcome: 'Judge the opportunity before spending the hours',
    steps: ['Check the minimum and pool', 'Estimate paid clips, not posted clips', 'Compare the real hourly return'],
    focus: ['Approval rate', 'Budget left', 'Paid views'],
  },
  resources: {
    outcome: 'A repeatable clipping system, not a one-off win',
    steps: ['Collect source moments', 'Batch the edit and export', 'Review results every week'],
    focus: ['Templates', 'Clean files', 'Simple tracker'],
  },
};

const GUIDE_OVERRIDES: Partial<Record<string, VisualPlan>> = {
  'stream-clipper-guide': {
    outcome: 'Find the moment without watching the whole VOD',
    steps: ['Scan chat and clip spikes', 'Open five candidate moments', 'Publish the strongest one fast'],
    focus: ['Chat spike', 'Mid-action start', 'Two-hour window'],
  },
  'tiktok-clipper-guide': {
    outcome: 'Build for completion, rewatches and shares',
    steps: ['State the stakes immediately', 'Cut every dead second', 'Post a fresh, watermark-free export'],
    focus: ['First frame', 'Under 35 sec', 'Fresh encode'],
  },
  'youtube-shorts-clipper-guide': {
    outcome: 'Give a strong clip time to find its audience',
    steps: ['Cut a complete payoff', 'Write a searchable title', 'Measure over weeks, not hours'],
    focus: ['Clear payoff', 'Clean thumbnail', 'Long tail'],
  },
  'instagram-reels-clipper-guide': {
    outcome: 'Make a clip somebody has to send to a friend',
    steps: ['Choose a reaction-worthy moment', 'Protect the UI safe zones', 'Set the cover separately'],
    focus: ['Share trigger', 'Top safe zone', 'Clean cover'],
  },
  'x-twitter-clipper-guide': {
    outcome: 'Pair a sharp post with a fast-moving clip',
    steps: ['Write the claim first', 'Cut to the essential reaction', 'Post while the topic is moving'],
    focus: ['Caption hook', '15–30 sec', 'Real-time'],
  },
  'how-much-do-clippers-make': {
    outcome: 'Estimate income with the denominator included',
    steps: ['Count clips that clear minimum', 'Apply approval rate', 'Compare payout against hours'],
    focus: ['Paid clips', 'Real rate', 'Hourly return'],
  },
};

function planFor(guide: Guide) {
  return GUIDE_OVERRIDES[guide.slug] ?? CATEGORY_PLANS[guide.category];
}

export function GuideThumbnail({ category }: { category: CategoryId }) {
  const label: Record<CategoryId, string> = {
    start: 'Start',
    platform: 'Publish',
    earnings: 'Measure',
    resources: 'Systemize',
  };

  return (
    <div className={`guide-thumb guide-thumb-${category}`} aria-hidden="true">
      <div className="guide-thumb-window">
        <span className="guide-thumb-dot" />
        <span className="guide-thumb-line guide-thumb-line-long" />
        <span className="guide-thumb-line" />
        <span className="guide-thumb-line guide-thumb-line-short" />
      </div>
      <div className="guide-thumb-phone">
        <span className="guide-thumb-play">▶</span>
        <span className="guide-thumb-caption" />
      </div>
      <span className="guide-thumb-label">{label[category]}</span>
    </div>
  );
}

export function GuideHeroVisual({ guide }: { guide: Guide }) {
  const plan = planFor(guide);
  return (
    <figure className="guide-hero-visual">
      <img
        src="/learn/clipsy-guide-workstation.jpg"
        alt="A clip editor turning long-form creator footage into short vertical videos at a desktop workstation"
        width="1280"
        height="853"
      />
      <figcaption>
        <span>Visual guide</span>
        <strong>{plan.outcome}</strong>
      </figcaption>
    </figure>
  );
}

export function GuideQuickPath({ guide }: { guide: Guide }) {
  const plan = planFor(guide);
  return (
    <aside className="guide-quick-path" aria-labelledby="quick-path-heading">
      <div className="guide-quick-path-head">
        <span className="eyebrow">The quick path</span>
        <h2 id="quick-path-heading">See the whole workflow before you start</h2>
      </div>
      <ol>
        {plan.steps.map((step, index) => (
          <li key={step}>
            <span className="guide-step-number">{index + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}

export function GuideScreenshotWalkthrough({ guide }: { guide: Guide }) {
  const plan = planFor(guide);
  return (
    <section className="guide-walkthrough" aria-labelledby="walkthrough-heading">
      <div className="guide-walkthrough-head">
        <span className="eyebrow">Screenshot walkthrough</span>
        <h2 id="walkthrough-heading">What the process should look like</h2>
        <p>These are simplified screen examples. Always follow the live campaign brief when its rules differ.</p>
      </div>

      <div className="guide-screen-grid">
        <figure className="guide-screen-card">
          <div className="guide-screen-bar"><i /><i /><i /><span>Campaign brief</span></div>
          <div className="guide-screen-body brief-screen">
            <span className="screen-kicker">Before editing</span>
            <strong>Check the rules that decide payment</strong>
            <div className="screen-check"><b>✓</b><span>Allowed source footage</span></div>
            <div className="screen-check"><b>✓</b><span>Minimum views and deadline</span></div>
            <div className="screen-check"><b>✓</b><span>Required tags and platforms</span></div>
          </div>
          <figcaption><span>1</span><strong>{plan.focus[0]}</strong><small>Do this before opening the editor.</small></figcaption>
        </figure>

        <figure className="guide-screen-card">
          <div className="guide-screen-bar"><i /><i /><i /><span>Vertical edit</span></div>
          <div className="guide-screen-body edit-screen">
            <div className="phone-preview">
              <span className="safe-zone safe-zone-top">Hook stays here</span>
              <span className="preview-face" />
              <span className="caption-line caption-line-one" />
              <span className="caption-line caption-line-two" />
              <span className="safe-zone safe-zone-bottom">Keep clear</span>
            </div>
            <div className="edit-timeline">
              <span className="timeline-playhead" />
              <span className="timeline-track timeline-video" />
              <span className="timeline-track timeline-captions" />
              <span className="timeline-track timeline-audio" />
            </div>
          </div>
          <figcaption><span>2</span><strong>{plan.focus[1]}</strong><small>Make the first frame understandable on mute.</small></figcaption>
        </figure>

        <figure className="guide-screen-card">
          <div className="guide-screen-bar"><i /><i /><i /><span>Result tracker</span></div>
          <div className="guide-screen-body tracker-screen">
            <span className="screen-kicker">After posting</span>
            <strong>Log the result, not the feeling</strong>
            <div className="tracker-row"><span>Clip status</span><b>Submitted</b></div>
            <div className="tracker-row"><span>48-hour views</span><b>8,420</b></div>
            <div className="tracker-row"><span>Brief check</span><b>Passed</b></div>
            <div className="tracker-progress"><span /></div>
          </div>
          <figcaption><span>3</span><strong>{plan.focus[2]}</strong><small>Use the result to improve the next cut.</small></figcaption>
        </figure>
      </div>
    </section>
  );
}
