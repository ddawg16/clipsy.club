// Every campaign is sorted into exactly one niche so a clipper who only does,
// say, edits or gambling can filter the board down to their lane. Classification
// is keyword/category based and runs at read time, so future campaigns are
// classified automatically with no extra data entry.

export const NICHE_ORDER = [
  'Clipping',
  'Edits',
  'UGC',
  'Music',
  'Movies & TV',
  'Gaming',
  'Streamers & IRL',
  'Sports',
  'Gambling',
  'Podcasts',
  'Brands',
  'Other',
] as const;

export type Niche = (typeof NICHE_ORDER)[number];

// clipping.net publishes a category tag per campaign — map it straight through.
const CATEGORY_MAP: Record<string, Niche> = {
  'irl-content': 'Streamers & IRL',
  irl: 'Streamers & IRL',
  music: 'Music',
  gaming: 'Gaming',
  gambling: 'Gambling',
  casino: 'Gambling',
  sports: 'Sports',
  podcasts: 'Podcasts',
  podcast: 'Podcasts',
  brands: 'Brands',
  brand: 'Brands',
  movies: 'Movies & TV',
  movie: 'Movies & TV',
  tv: 'Movies & TV',
  clipping: 'Clipping',
  edits: 'Edits',
  edit: 'Edits',
  ugc: 'UGC',
};

// When name/category say nothing, fall back on what the source itself is about.
const SOURCE_FALLBACK: Record<string, Niche> = {
  clipmarket: 'Movies & TV', // ClipMarket is premium TV/movie clipping
  clippingnet: 'Clipping',
  clipster: 'Clipping',
};

export function deriveNiche(name: string, category?: string | null, sourceId?: string | null): Niche {
  const cat = (category ?? '').trim().toLowerCase();
  const s = `${name} ${cat}`.toLowerCase();
  const has = (re: RegExp) => re.test(s);

  // Explicit format tags in the name win over a generic category — a music
  // campaign labelled [EDITS] is an Edits campaign to the clipper who wants it.
  if (has(/\bugc\b/)) return 'UGC';
  if (has(/\bedits?\b/)) return 'Edits';

  // Otherwise trust the source's own category tag when it maps cleanly.
  if (cat && CATEGORY_MAP[cat]) return CATEGORY_MAP[cat];
  if (has(/gambl|casino|\bstake\b|roobet|\bbetr\b|igaming|sportsbook|\bbet\b|\bduel\b/)) return 'Gambling';
  if (has(/podcast/)) return 'Podcasts';
  if (has(/\bnba\b|\bnfl\b|\bufc\b|football|soccer|basketball|\bsports?\b/)) return 'Sports';
  if (has(/gaming|esports|csgo|\bcs2\b|valorant|fortnite|roblox|minecraft|\bgame\b/)) return 'Gaming';
  if (has(/\bmovie|\bfilm\b|cinema/)) return 'Movies & TV';
  if (has(/\btv\b|drag race|netflix|\bshow\b|\bseries\b|episode|\bseason\b/)) return 'Movies & TV';
  if (has(/\bmusic\b|\bsong\b|\bedm\b|hardstyle|afrobeat|\bremix\b|\balbum\b|\brecords?\b/)) return 'Music';
  if (has(/\birl\b|stream|vlog|creator|influencer/)) return 'Streamers & IRL';
  if (has(/\bbrand\b|\bproduct\b|\bgfuel\b/)) return 'Brands';
  if (has(/\bclip/)) return 'Clipping';

  const sid = (sourceId ?? '').toLowerCase();
  return SOURCE_FALLBACK[sid] ?? 'Other';
}
