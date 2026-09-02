# SGNL [Test] — Launch runbook

The first real campaign. clipsy.club is already built for it. This is the short list
to go from "queued" to "live."

## What's already done (on the site)
- **Brief hub page:** https://clipsy.club/sgnl — full guidelines, the **6 Nevers**
  (impossible to miss, "break one = no pay"), per-platform newsletter CTAs, daily
  reporting format, and the payout/compliance note. Live the moment you push + Vercel deploys.
- **Board:** SGNL sits at **#1 as a team pick**, shown as **"Opening soon"** until priced.
  Clicking it goes to the brief hub. Appears after the next ingest run.
- Native-campaign "Submit your clips" wiring, so it points at Whop once the link is set.

## The ONLY 5 values left to fill (do this LAST, when SGNL gives numbers)
Easiest + safest: **send them to me and I'll input + verify.** Or edit
`clipsy-engine/data/direct-campaigns.json`, the `sgnl-test` entry, and change only these:

| field         | set to                                             |
|---------------|----------------------------------------------------|
| `rateCpm`     | dollars per 100k views (number, e.g. `150`)        |
| `budgetTotal` | the pool in dollars (number, e.g. `5000`)          |
| `minViews`    | the view minimum / MVR (number, e.g. `10000`)      |
| `endsAt`      | deadline, ISO string (e.g. `"2026-09-30T00:00:00Z"`) or leave `null` |
| `url`         | the Whop Content Rewards submit link (string)      |

Change `null` → the value (keep the quotes on `endsAt`/`url`, no quotes on the numbers).
The moment those are set, the card flips from "Opening soon" to a full priced #1 campaign.

## What only you can do
### 1. Whop — the money engine (tracking + payouts + budget cap)
1. Whop dashboard → Content Rewards → create a campaign for SGNL.
2. Set the rate ($/100k), the pool (fund it), the view minimum, platforms (IG/TikTok/YT/FB), deadline.
3. Paste the SGNL brief rules into the campaign so approvals check them.
4. Copy the campaign's **submission link** → that's the `url` value above.
   (I can drive this with you in the browser — just say when.)

### 2. Discord
1. Create a **#content-rewards** channel (payout updates) and a **ticket** system for daily reports.
2. Give clippers a role/access on join.
3. Post the drop announcement (below).

### 3. Push the code
Commit + push in GitHub Desktop (safe now — SGNL shows as "Opening soon" until priced).

## Drop announcement (Discord)
> 🚨 **NEW CAMPAIGN — SGNL (test run)**
> Our first paid campaign is live. Clip a free news-email, get paid per 100k views once your
> clip hits the minimum and gets approved. Payouts run hourly through Content Rewards.
> **Platforms:** TikTok · Instagram · YouTube · Facebook — USA audience, clips 10s+, dedicated SGNL page required.
> ⚠️ **Read the full brief AND the "6 Nevers" before you post — breaking one = no pay, no exceptions.**
> It's a news email, not stock advice. Full brief → https://clipsy.club/sgnl
> 📋 Report daily by 9 PM in your ticket: today's clip links + current views. No message = those views don't count.
> Questions? Ask before you post.

## Safety note
This is a financial-adjacent newsletter. The 6 Nevers are legal guardrails. Make sure your
agreement with SGNL says who owns final compliance review and who's liable if a clip goes
off-script, before you fund the pool. (Not legal advice.)
