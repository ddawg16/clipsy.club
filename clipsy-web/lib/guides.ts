/**
 * The Learn & Earn library.
 *
 * Everything here is written from scratch for Clipsy. We deliberately do not
 * republish other platforms' guides: duplicated content gets buried by search
 * engines, and the whole reason a clipper trusts this board is that we tell
 * them things the networks would rather not say.
 */

export type CategoryId = 'start' | 'platform' | 'earnings' | 'resources';

export const CATEGORIES: Array<{ id: CategoryId; title: string; note: string }> = [
  { id: 'start', title: 'Getting Started', note: 'Read these two first' },
  { id: 'platform', title: 'Platform Guides', note: 'Master each platform' },
  { id: 'earnings', title: 'Earnings & Income', note: 'How much can you make?' },
  { id: 'resources', title: 'More Resources', note: 'Tools, jobs and going pro' },
];

export type Section = { h: string; body: string[]; list?: string[] };

export type Guide = {
  slug: string;
  title: string;
  dek: string;
  category: CategoryId;
  minutes: number;
  sections: Section[];
};

export const GUIDES: Guide[] = [
  /* ------------------------------------------------------------ start */
  {
    slug: 'how-to-become-a-clipper',
    title: 'How to Become a Clipper: Complete Beginner Guide',
    dek: 'What the job actually is, what you need on day one, and how to get your first payout without wasting three weeks on the wrong campaign.',
    category: 'start',
    minutes: 11,
    sections: [
      {
        h: 'What a clipper actually does',
        body: [
          'A clipper takes long footage somebody else made — a stream, a podcast, a launch video, an interview — cuts the best 20 to 60 seconds out of it, and posts it as a short. A brand or a creator funds a pool of money, and you get paid a rate per hundred thousand views your clip earns.',
          'That is the whole job. You are not building an audience, you are not making original content, and nobody cares how many followers you have. What you are being paid for is judgment about which moment is worth cutting, and the speed to cut it before forty other people cut the same one.',
        ],
      },
      {
        h: 'What you need before your first clip',
        body: [
          'Less than people assume. A phone genuinely works for the first month. What you cannot skip is an editor you know well enough to work fast in, and accounts on the platforms your chosen campaign actually accepts.',
        ],
        list: [
          'An editor — CapCut on a phone or desktop is free and enough to start',
          'Accounts on at least two platforms, ideally TikTok plus one other',
          'Somewhere to store source footage, because you will re-cut the same VOD repeatedly',
          'A way to get paid — most campaigns run on PayPal, some on crypto',
        ],
      },
      {
        h: 'Picking your first campaign',
        body: [
          'This is where most beginners lose their first month, and it is almost always the same mistake: chasing the highest rate on the board. A campaign paying $300 per 100k with a 100,000-view minimum will pay you nothing at all until a clip breaks six figures, which for a new account is rare. A campaign paying $30 per 100k with a 2,000-view minimum pays you on your third clip.',
          'The number that matters most when you are starting is the view minimum, second is how full the pool already is. A pool at 90% claimed is a campaign that may run out of money before your clip is even reviewed.',
        ],
        list: [
          'Low view minimum — under 10,000 if you can find it',
          'Pool under half claimed, so there is budget behind the rate',
          'Platforms you already post on, not ones you would have to build from zero',
          'A brief you can actually read and follow in one sitting',
        ],
      },
      {
        h: 'Read the brief. Actually read it.',
        body: [
          'Every campaign has rules: which footage you may use, claims you must not make, whether you have to tag an account, where the clip must be posted, and how to submit it. Clips get rejected far more often for brief violations than for being bad clips.',
          'Two minutes on the brief before you start editing is the highest-value two minutes in this entire job. If a rule is ambiguous, ask in the campaign’s Discord before you post rather than after.',
        ],
      },
      {
        h: 'Your first ten clips',
        body: [
          'Treat the first ten as calibration, not income. You are learning which hooks hold, how the platform treats reposted footage, and how fast that particular campaign reviews submissions. Post them across at least two campaigns so a single strict reviewer does not skew your read.',
          'Track four things per clip: campaign, hook used, views at 48 hours, and whether it was approved. After ten clips you will see a pattern that no guide can tell you in advance, because it is specific to your editing and your accounts.',
        ],
      },
      {
        h: 'What good looks like after a month',
        body: [
          'A realistic first month is a few hundred dollars, not a few thousand. The clippers earning serious money have usually spent six months learning which moments travel and building enough account history that the platforms stop throttling their reposts.',
          'The people who quit in week three almost always quit because they picked one high-rate campaign, made eight clips, cleared the minimum on none of them, and concluded the whole thing was a scam. It is not a scam — it is a volume game with a learning curve, and the curve is front-loaded.',
        ],
      },
    ],
  },
  {
    slug: 'stream-clipper-guide',
    title: 'Stream Clipper Guide: Clip Any Live Stream for Money',
    dek: 'Finding the moment in a six-hour VOD, cutting it fast, and staying on the right side of the streamer while you do it.',
    category: 'start',
    minutes: 10,
    sections: [
      {
        h: 'Why streams are the best source footage',
        body: [
          'A six-hour stream contains maybe eight genuinely clippable moments and a hundred people who will never watch it to find them. That gap is the entire opportunity. Unlike a podcast or a launch video, streams generate fresh material every single day, and the good moments are unscripted enough that nobody can predict which ones will travel.',
          'The trade-off is time. Scrubbing a VOD is the slowest part of the job, and it is where the difference between a $200 month and a $2,000 month usually lives.',
        ],
      },
      {
        h: 'Finding moments without watching six hours',
        body: [
          'Almost nobody watches the full VOD. There are reliable shortcuts, and learning them is the actual skill.',
        ],
        list: [
          'Twitch and Kick both mark chat activity spikes — a wall of chat is a moment, nearly every time',
          'The streamer’s own clips tab is a shortlist somebody else already made for you',
          'Subreddits and Discord highlight channels surface moments within an hour of them happening',
          'Scrub at 2x with the audio on — you will hear a reaction before you see one',
        ],
      },
      {
        h: 'The first three seconds decide everything',
        body: [
          'Short-form watch time is won or lost before a viewer has decided they are watching. Start the clip mid-action, never on setup. If the moment needs context, put the context on screen as text rather than spending four seconds of audio explaining it.',
          'A common beginner error is including the build-up because it makes the payoff funnier. It does — for someone already watching. For someone scrolling, the build-up is the reason they scrolled past.',
        ],
      },
      {
        h: 'Cutting for each platform',
        body: [
          'The same moment usually wants a different cut per platform. Vertical crop that keeps the streamer’s face and the game feed both readable is worth more effort than any transition or effect. Captions are not optional — a large share of views are muted.',
        ],
        list: [
          'TikTok: 15–35 seconds, hard cut in, captions burned in',
          'Reels: similar length, but the first frame doubles as the cover — pick it deliberately',
          'Shorts: tolerates slightly longer, 30–55 seconds, and rewards a clear payoff',
          'X: shortest of all, and the caption text you write matters as much as the clip',
        ],
      },
      {
        h: 'Do not burn the streamer',
        body: [
          'Clipping is a permission business even when the campaign says you may use the footage. Cutting a moment to make someone look worse than they were, ragebait titling, or clipping something the streamer has asked not to be clipped will get you removed from campaigns and remembered by the people who run them.',
          'It is also bad economics. The clippers who last are the ones streamers and campaign managers actively want on the roster, because that is who gets told about the next campaign before it goes on an open board.',
        ],
      },
      {
        h: 'Speed is the moat',
        body: [
          'For a big moment, the first ten clips take most of the views and everything after is fighting for scraps. If you can get a clip out within two hours of it happening, you are competing with a handful of people. At twelve hours you are competing with everyone.',
          'Build a template project in your editor — caption style, crop, outro — so that the only work per clip is the cut itself.',
        ],
      },
    ],
  },

  /* --------------------------------------------------------- platform */
  {
    slug: 'tiktok-clipper-guide',
    title: 'TikTok Clipper Guide: Maximize Your Earnings on TikTok',
    dek: 'How the feed actually decides, what gets a repost throttled, and the posting habits that separate a dead account from a working one.',
    category: 'platform',
    minutes: 10,
    sections: [
      {
        h: 'What TikTok is actually optimising for',
        body: [
          'Watch time as a percentage of clip length, then rewatches, then shares. Follower count is close to irrelevant, which is exactly why clipping works here at all — a brand-new account can out-perform one with 200,000 followers on the same day.',
          'The practical consequence: a 20-second clip watched to the end beats a 45-second clip watched halfway, even though the longer one accrued more raw seconds. Cut ruthlessly.',
        ],
      },
      {
        h: 'The repost problem',
        body: [
          'TikTok can detect reused footage, and heavily-reposted source material gets suppressed. This is the single biggest reason a clipper’s numbers collapse without warning.',
        ],
        list: [
          'Re-encode rather than uploading the same file twice',
          'Change the framing — crop, zoom, reposition — so it is not a frame-identical match',
          'Add your own captions rather than relying on burned-in ones from the source',
          'Never re-upload a clip that already flopped; make a different cut instead',
        ],
      },
      {
        h: 'Hooks that survive the scroll',
        body: [
          'The hook is the first frame plus the first line of on-screen text, working together. Text that states the stakes outperforms text that teases them — "he just lost $40,000 on one hand" beats "wait for it".',
          'Avoid text that gives away the payoff. The job of the hook is to make the next three seconds feel mandatory, not to summarise the clip.',
        ],
      },
      {
        h: 'Posting cadence',
        body: [
          'Three to five clips a day is the range where most working clippers land. Below that you do not generate enough samples for a hit; above it, quality drops and the account starts looking like spam to both the algorithm and the reviewer.',
          'Spread posts across the day rather than dumping them at once. Consecutive posts compete with each other for the same initial test audience.',
        ],
      },
      {
        h: 'When a clip is dead',
        body: [
          'TikTok gives most clips their real answer within about four hours. If a clip is under a few hundred views at that point it is very unlikely to recover, and waiting on it is time you are not spending on the next cut.',
          'The exception is genuinely evergreen footage, which occasionally gets picked back up days later. Do not build a strategy around it.',
        ],
      },
    ],
  },
  {
    slug: 'youtube-shorts-clipper-guide',
    title: 'YouTube Shorts Clipper Guide: Maximize Your Earnings',
    dek: 'Shorts behaves differently from every other short-form feed, and clippers who treat it like TikTok leave most of the money on the table.',
    category: 'platform',
    minutes: 9,
    sections: [
      {
        h: 'Shorts has a much longer tail',
        body: [
          'A TikTok is usually finished within a week. A Short can sit at nothing for two weeks and then find an audience, and clips that connect with a YouTube channel’s existing audience keep accruing views for months.',
          'For a clipper paid per view, that tail is real money — but it means judging performance at 48 hours will mislead you. Give Shorts a longer window before you write a cut off.',
        ],
      },
      {
        h: 'The audience already knows the creator',
        body: [
          'Shorts surfaces heavily to people who already watch related long-form content. That changes what works: context-heavy clips that would die on TikTok can do well here, because the viewer already knows who these people are and why the moment matters.',
          'It also means using the creator’s name in the title is an advantage rather than clutter.',
        ],
      },
      {
        h: 'Practical rules',
        body: [],
        list: [
          'Under 60 seconds, but do not pad — Shorts rewards completion the same as anywhere',
          'Titles are searchable here in a way TikTok captions are not; write them like a search result',
          'Loud, clean audio matters more on Shorts, where more viewers watch with sound',
          'A deliberate first frame doubles as your thumbnail in feeds and on channel pages',
        ],
      },
      {
        h: 'Where clippers lose money on Shorts',
        body: [
          'Two mistakes recur. The first is cross-posting the exact TikTok export, watermark included — Shorts demotes it and the campaign may reject it. The second is giving up too early because the first day was flat, which on this platform tells you almost nothing.',
        ],
      },
    ],
  },
  {
    slug: 'instagram-reels-clipper-guide',
    title: 'Instagram Reels Clipper Guide: Earn Money on Instagram',
    dek: 'Reels rewards saves and sends more than any other feed, which changes what you should be cutting for.',
    category: 'platform',
    minutes: 8,
    sections: [
      {
        h: 'Sends are the currency',
        body: [
          'Instagram weights sharing to another person more heavily than watch time. That makes Reels the best home for clips somebody would forward to a specific friend: an argument, a wild take, something absurd enough to warrant a "look at this".',
          'Clips that are merely satisfying to watch do worse here than they do on TikTok. Clips that provoke a reaction do better.',
        ],
      },
      {
        h: 'The format details that matter',
        body: [],
        list: [
          'Keep text out of the bottom fifth — the UI covers it and the campaign reviewer will see the crop, not your intent',
          'Cover frame is chosen separately from the first frame; set it deliberately',
          'Audio matters: an original audio track that catches on brings a second wave of reach',
          'Under 30 seconds outperforms longer on this feed more reliably than on the others',
        ],
      },
      {
        h: 'Account health',
        body: [
          'Instagram is the least forgiving of the four about visible watermarks from other platforms and about accounts that post nothing but reposted footage. Mixing in occasional original posts and keeping exports clean measurably helps reach.',
        ],
      },
    ],
  },
  {
    slug: 'x-twitter-clipper-guide',
    title: 'X / Twitter Clipper Guide: Make Money Clipping on X',
    dek: 'The one platform where what you type matters as much as what you cut — and where campaign rates are often quietly the best.',
    category: 'platform',
    minutes: 8,
    sections: [
      {
        h: 'The post is half the clip',
        body: [
          'On every other platform the video carries itself. On X, the text above it does a large share of the work. The same clip with a flat caption and with a sharp one can differ by an order of magnitude in reach.',
          'Write the caption as a claim or a reaction, not a description. "This is the worst call I have ever seen" outperforms "clip of a bad call".',
        ],
      },
      {
        h: 'Why clippers underrate X',
        body: [
          'Fewer clippers post here, which means less competition for the same campaign pool. Rates are frequently as good as TikTok and the field is thinner. If a campaign accepts X and you are ignoring it, you are ignoring the easiest share of that pool.',
        ],
      },
      {
        h: 'What performs',
        body: [],
        list: [
          'Short — 15 to 30 seconds is the sweet spot, shorter than anywhere else',
          'Sports, politics, gaming drama and finance travel furthest',
          'Quote-posting the original source often outperforms posting cold',
          'Timing matters more here than elsewhere; the feed is genuinely real-time',
        ],
      },
      {
        h: 'Getting views counted',
        body: [
          'X counts a view fast and loose compared to the other platforms, which is a benefit — until a campaign applies its own verification and rejects inflated numbers. Do not assume a big X view count converts one-to-one into a payout; read how that specific campaign verifies before you plan around it.',
        ],
      },
    ],
  },

  /* --------------------------------------------------------- earnings */
  {
    slug: 'how-much-do-clippers-make',
    title: 'How Much Do Clippers Make? An Honest Breakdown',
    dek: 'What the maths actually says, why the screenshots you have seen are misleading, and the three numbers that decide your income.',
    category: 'earnings',
    minutes: 10,
    sections: [
      {
        h: 'The formula, plainly',
        body: [
          'Your earnings are views divided by 100,000, times the campaign rate, times the number of clips that clear the minimum and pass review. That last clause is where most estimates fall apart, because people calculate on clips posted rather than clips paid.',
          'A clipper posting 100 clips a month with a 30% approval-and-minimum rate is being paid for 30 clips, not 100. Model that honestly and the numbers get realistic fast.',
        ],
      },
      {
        h: 'Three realistic tiers',
        body: [
          'These are ranges seen across working clippers, not promises, and they assume consistent posting rather than a good week.',
        ],
        list: [
          'Learning — first one to three months: roughly $50 to $400 a month',
          'Consistent — a steady cadence and campaigns you understand: roughly $400 to $2,000',
          'Full-time — high volume, multiple campaigns, occasional viral clips: $2,000 upward, with real variance',
        ],
      },
      {
        h: 'Why the screenshots lie',
        body: [
          'Payout screenshots circulate because they are the best month somebody ever had, and because a screenshot of a bad month has no audience. They are real numbers presented without the denominator: how many months of nothing came first, and how many clips produced them.',
          'Assume any screenshot you see is the top few percent of that person’s results and the top few percent of people. Both filters are running at once.',
        ],
      },
      {
        h: 'The three numbers that decide your income',
        body: [
          'Not the rate. The rate is the number everybody optimises and it is the third most important.',
        ],
        list: [
          'Approval rate — how often your clips actually get paid. Fixing this is free and doubles income.',
          'Volume — how many clips you can produce without quality collapsing',
          'Rate — worth optimising only once the first two are stable',
        ],
      },
      {
        h: 'The pool problem',
        body: [
          'A campaign’s rate is only good while there is budget behind it. Pools empty, sometimes weeks before the stated end date, and a clip submitted into an exhausted pool earns nothing regardless of its views. Checking how claimed a pool is before you spend a night editing is the least glamorous habit in this job and one of the most profitable.',
        ],
      },
    ],
  },
  {
    slug: 'podcast-clipping-guide',
    title: 'Podcast Clipping Guide: Turn Podcasts into Viral Clips',
    dek: 'Podcasts are the most underworked source in clipping, because finding the moment is harder and almost nobody bothers.',
    category: 'earnings',
    minutes: 9,
    sections: [
      {
        h: 'Why podcasts pay well',
        body: [
          'Two hours of two people talking has no visual spikes to scan for and no chat reacting, so the shortcuts that work on streams do not apply. That friction keeps the field small — and podcast campaigns often carry higher rates precisely because they are harder to fill.',
        ],
      },
      {
        h: 'Finding the moment',
        body: [
          'Run the episode through a transcript tool and read rather than listen. You can scan a two-hour transcript in ten minutes, and the moments announce themselves in text: a specific number, a confession, a disagreement, a story with a turn in it.',
        ],
        list: [
          'Any sentence starting "the thing nobody tells you" or similar',
          'Concrete numbers — money, timelines, counts',
          'The point where one host disagrees with the other',
          'A short complete story with a beginning and a punchline inside 45 seconds',
        ],
      },
      {
        h: 'Making talking heads watchable',
        body: [
          'Two people in chairs is visually static, so the edit has to carry it. Cut between speakers on every exchange, use large readable captions, and add a b-roll or on-screen text beat wherever a concrete noun is mentioned.',
          'Zoom punches on emphasis look cheap in isolation and work extremely well in aggregate. Use them.',
        ],
      },
      {
        h: 'Length',
        body: [
          'Podcast clips tolerate more length than stream clips because the payoff is an idea rather than a moment — 45 to 60 seconds is normal. But the first line still has to be the most interesting sentence in the clip, which usually means cutting into the middle of the answer and dropping the question entirely.',
        ],
      },
    ],
  },
  {
    slug: 'best-clipping-platforms',
    title: 'Best Clipping Platforms: How to Compare Them',
    dek: 'What actually differs between networks, and the five questions to ask before you spend a night editing for one.',
    category: 'earnings',
    minutes: 9,
    sections: [
      {
        h: 'They are more alike than they look',
        body: [
          'Nearly every clipping network runs the same core model: a brand funds a pool, clippers submit, views are verified, payouts come out of the pool at a rate per hundred thousand views. The marketing differs far more than the mechanics do.',
          'So comparing them on branding is a waste of time. Compare them on the five things below, which are the things that actually change what lands in your account.',
        ],
      },
      {
        h: 'The five questions',
        body: [],
        list: [
          'View minimum — the single biggest filter on whether a beginner ever gets paid',
          'Payout speed and method — how long from approval to money, and whether you can actually receive it',
          'Rejection transparency — do you find out why a clip was rejected, or does it just vanish?',
          'Pool visibility — can you see how much budget is left before you commit a night?',
          'Platform coverage — does it accept the platforms you already post on?',
        ],
      },
      {
        h: 'Rate is a trap on its own',
        body: [
          'The highest advertised rate on any board is almost always attached to the highest view minimum, and often to the fullest pool. Rate multiplied by your realistic approval rate is the number to compare — and that is a number the network will never print for you.',
        ],
      },
      {
        h: 'Run more than one',
        body: [
          'There is no reason to be loyal to a single network. Campaigns end, pools empty, and a strong month on one is frequently a dead month on another. Working across several is how experienced clippers smooth their income — which is the entire reason this site indexes all of them in one place rather than running a single program.',
        ],
      },
    ],
  },

  /* -------------------------------------------------------- resources */
  {
    slug: 'best-editing-tools-for-clippers',
    title: 'Best Editing Tools for Clippers: Free and Paid',
    dek: 'What to actually use at each stage, and why upgrading your editor is almost never the thing holding you back.',
    category: 'resources',
    minutes: 8,
    sections: [
      {
        h: 'Start free, and stay free longer than you think',
        body: [
          'CapCut does everything a clipper needs for the first several months: vertical crop, auto-captions, zoom punches, speed ramps, and a template system so your look stays consistent. It is free, it runs on a phone, and plenty of people earning real money never move off it.',
          'The instinct to buy a better editor early is almost always a way of avoiding the harder problem, which is finding better moments.',
        ],
      },
      {
        h: 'When to move up',
        body: [
          'The genuine reason to upgrade is throughput. Once you are producing enough clips that batching, proxies and keyboard-driven editing save you real hours, a desktop NLE pays for itself.',
        ],
        list: [
          'DaVinci Resolve — free, extremely capable, steepest learning curve',
          'Premiere Pro — subscription, best-in-class if you already know it',
          'Final Cut — one-time purchase, very fast on Apple silicon',
        ],
      },
      {
        h: 'The supporting tools that matter more',
        body: [
          'These move your numbers more than the editor does.',
        ],
        list: [
          'A transcript tool, for finding moments in podcasts and long VODs fast',
          'A VOD downloader that preserves quality, so your source is not already degraded',
          'A simple spreadsheet tracking clip, campaign, views and approval — this is your real feedback loop',
          'Cloud storage, because you will re-cut the same footage many times',
        ],
      },
      {
        h: 'Captions',
        body: [
          'Auto-captions are good enough now that hand-typing them is wasted time, but they are not good enough to ship unread. Names, slang and numbers are where they fail, and those are exactly the words that carry the clip. Read them once before export, every time.',
        ],
      },
    ],
  },
  {
    slug: 'clipping-side-hustle',
    title: 'Clipping as a Side Hustle: Making It Fit Around a Job',
    dek: 'How to run this on eight hours a week without it quietly becoming a second full-time job that pays badly.',
    category: 'resources',
    minutes: 8,
    sections: [
      {
        h: 'It suits a side hustle unusually well',
        body: [
          'There is no client, no schedule, no minimum commitment, and nobody notices if you disappear for a week. You can do it at 11pm. The work splits cleanly into finding moments and cutting them, and the finding half can happen on a phone during downtime.',
        ],
      },
      {
        h: 'Eight hours a week, realistically',
        body: [
          'The failure mode is scattering those hours into fifteen-minute fragments, which is enough to open the editor and not enough to finish anything.',
        ],
        list: [
          'One 2-hour block: scan VODs, save timestamps, decide what you are cutting this week',
          'Two 2-hour blocks: batch-edit and export everything from that list',
          'The remaining hours: post on a schedule and log results',
        ],
      },
      {
        h: 'Pick one campaign, not five',
        body: [
          'With limited hours, depth beats breadth. Knowing one campaign’s brief, reviewer and audience well produces a far better approval rate than spreading thin across five and understanding none of them. Add a second only once the first is boring.',
        ],
      },
      {
        h: 'Be honest about the ramp',
        body: [
          'At eight hours a week you should expect the learning phase to take two to three months rather than one. That is fine — but decide up front that you are giving it that long, because the most common outcome for side-hustle clippers is quitting in week four with a real skill half-built and nothing to show for it.',
        ],
      },
    ],
  },
  {
    slug: 'remote-clipping-jobs',
    title: 'Remote Clipping Jobs: Working With Creators Directly',
    dek: 'The step past campaign boards — retainers, in-house roles, and how to spot the offers that are not real.',
    category: 'resources',
    minutes: 8,
    sections: [
      {
        h: 'Two different things get called a clipping job',
        body: [
          'The first is campaign work: open pools, paid per view, no relationship required. The second is a direct arrangement with a creator or agency — a monthly retainer or an hourly rate for a set number of clips, paid whether or not they go viral.',
          'The second is more stable and usually less lucrative at the top end. Most people who go full-time run both.',
        ],
      },
      {
        h: 'How direct work actually gets offered',
        body: [
          'Almost always because somebody saw your clips. Creators notice who is clipping them well, and campaign managers keep informal lists of clippers who never cause problems. This is the practical argument for following briefs precisely even when nobody would catch you: the roster you want to be on is not one you apply to.',
        ],
      },
      {
        h: 'What to charge',
        body: [
          'Work out what a comparable volume of campaign clips earned you in a good month and price against that, not against a freelance-editor rate. You are being paid for judgment about what to cut, which is scarcer than the editing.',
        ],
      },
      {
        h: 'Offers that are not real',
        body: [
          'The scams in this space are consistent enough to list.',
        ],
        list: [
          'Any request for payment to access work, a "clipper programme" fee, or an equipment deposit',
          'Payment promised only after a vaguely defined "trial" of unpaid clips',
          'Requests for account passwords rather than posting the clip yourself',
          'Rates far above the market with no brand, no brief and no contract',
        ],
      },
    ],
  },
  {
    slug: 'freelance-clipper-guide',
    title: 'Freelance Clipper Guide: Building a Clipping Business',
    dek: 'Turning clip income into something that survives a campaign ending — pricing, systems, and the thing that actually compounds.',
    category: 'resources',
    minutes: 9,
    sections: [
      {
        h: 'The problem with campaign-only income',
        body: [
          'Campaigns end without notice, pools empty early, and a platform algorithm change can halve your month. Every clipper who has done this a while has had a month where their best campaign simply stopped existing.',
          'The move from clipper to business is mostly about making that survivable: several income sources, at least one of which is not paid per view.',
        ],
      },
      {
        h: 'What to build',
        body: [],
        list: [
          'Two or three campaigns running simultaneously, across different networks',
          'One retainer client, even a small one, for a floor under the month',
          'A reusable system — templates, transcript workflow, tracked results — so output does not depend on motivation',
          'A public reel of your best clips, because every direct offer starts with somebody watching your work',
        ],
      },
      {
        h: 'Track like a business',
        body: [
          'Clip, campaign, hours spent, views, approved or rejected, paid. Four weeks of that data tells you your real hourly rate per campaign, and it is frequently not the campaign you assumed. This one spreadsheet has changed more clippers’ income than any editing upgrade.',
        ],
      },
      {
        h: 'The thing that actually compounds',
        body: [
          'Not your follower count, and not your editing. It is your judgment about which moment will travel — and your reputation with the handful of people who decide who gets on a roster. Both build slowly, neither can be bought, and together they are why some clippers get told about a campaign a week before it appears on any board.',
        ],
      },
    ],
  },
];

export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function guidesIn(category: CategoryId): Guide[] {
  return GUIDES.filter((g) => g.category === category);
}
