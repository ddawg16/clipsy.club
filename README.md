# Clipping Home Base — How This Folder Works

This is the persistent memory for the clipping/captioning work. Read this file at the start of any session before doing caption or strategy work.

## Setup

- 2 niches, each running 4 platforms (TikTok, Instagram, YouTube, X) = 8 accounts total.
  - **Meme page** — see `brand-profiles/meme-page.md`
  - **Streamer/clips page** — see `brand-profiles/streamer-clips-page.md`
- Posting is manual (DS posts himself). Claude's job is captions, editing/hook guidance, and page review — not auto-publishing.
- DS is in a friendly competition with friends/coworkers to grow pages fastest — see `competition-tracker.md`.
- DS has paid resources specifically about clipping (including furtherclipping.net, which he's a paying/earning member of). Claude should never log into or scrape gated/paid resources on his behalf — DS pastes takeaways himself into `resources/`.

## The caption workflow (when DS sends a video)

1. **Figure out which page/niche it's for.** If it's not obvious, ask. Then read that niche's brand profile for voice, hashtag sets, and content rules. **If the clip is tied to a paid campaign (see `campaigns/`), check that campaign's file first** — required watermark/tags and content-mix ratio rules override general niche style and are compliance requirements, not suggestions.
2. **Understand the clip.** Watch/read what's actually happening — the hook, the payoff, who's in it. If it's a longer raw clip (3-10 min) that still needs cutting, suggest where to cut using the same bar as a real clipper: hook in the first 1-2 seconds, one clear payoff, 15-45s ideal, 60s ceiling unless the bit truly needs it.
3. **Give platform-specific options, not one caption reused everywhere** — they reward different things:
   - **TikTok** — casual voice, hook as the first line, 1-3 relevant hashtags (not stuffing), can tease something not shown on-screen to build curiosity.
   - **Instagram Reels** — similar to TikTok but 3-5 hashtags is normal, and the first line before "...more" gets cut off, so the hook has to land before that.
   - **YouTube Shorts** — the *title* does the work TikTok's caption does (Shorts are searchable/keyword-driven) — think title first, description second, hashtags matter less.
   - **X** — the caption is the whole post, punchy one-liner, works with sound off (autoplay is muted), 0-1 hashtags, no stuffing.
4. **If the clip is already edited**, just caption it per above.
5. **If it needs editing help**, give concrete cut points / pacing notes, not generic advice — reference the brand profile's "what's worked before" section if it has entries.
6. **Log what worked.** When DS tells you a caption/edit style performed well, add it to that niche's "what's worked" section in the brand profile so future captions build on real data, not guesses.

## Folder layout

```
Apex Media Clipping Personal/
  README.md                          <- this file
  brand-profiles/
    meme-page.md
    streamer-clips-page.md
  campaigns/                         <- paid clip-bounty campaigns (rates, watermark/tag requirements, content-mix rules, violations)
    README.md
    john-malek.md
    skylar-mae.md
  competition-tracker.md
  resources/
    notes-template.md                <- DS's paid-resource takeaways go here (pasted by him)
  Meme Page/
    Incoming/                        <- raw/edited clips DS sends for this niche
    Captioned/                       <- caption docs / notes per clip
  Streamer Clips Page/
    Incoming/
    Captioned/
```

## Still needed from DS

- Account handles for all 8 accounts (fill into brand profiles)
- Friends'/coworkers' handles for the competition tracker
- A few examples of captions/clips that already performed well, per niche (or "none yet" — we start logging from here)
- Key takeaways from paid resources, pasted into `resources/notes-template.md` in his own words
