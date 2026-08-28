# Making the board refresh itself (reliably)

## Why it wasn't auto-running

The board is refreshed by a GitHub Action (`Ingest campaigns`). It's set to run
hourly — but GitHub's built-in scheduler is "best effort": on free/private repos
it quietly delays or skips scheduled runs under load. That's why you saw a
5-hour-old board. It's not broken, it's GitHub deprioritising the timer.

The fix is to stop relying on GitHub's timer and trigger the job from an outside
clock that actually fires on time. Free, ~5 minutes to set up, then never again.

## Setup (one time, no coding)

### 1. Make a GitHub token that can only start this one job
1. Go to **github.com → Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**.
2. Name: `clipsy-ingest-trigger`. Expiration: **No expiration**.
3. **Resource owner:** you (ddawg16). **Repository access:** Only select
   repositories → **clipsy.club**.
4. **Permissions → Repository permissions → Actions → Read and write.**
5. Generate, and copy the token (starts `github_pat_…`).
   This token can do nothing except start this workflow. That's on purpose.

### 2. Point a free external clock at it
1. Go to **cron-job.org** and make a free account.
2. **Create cronjob.**
   - **Title:** Clipsy ingest
   - **URL:** `https://api.github.com/repos/ddawg16/clipsy.club/actions/workflows/ingest.yml/dispatches`
   - **Schedule:** Every 1 hour (or every 30 min — your call).
   - **Request method:** `POST`
   - **Advanced / Headers**, add these three:
     - `Authorization` : `Bearer github_pat_…`  (your token)
     - `Accept` : `application/vnd.github+json`
     - `Content-Type` : `application/json`
   - **Request body:** `{"ref":"main"}`
3. Save. Hit "Test run" once — then check
   github.com/ddawg16/clipsy.club/actions and you should see a fresh run start.

That's it. The board now refreshes on a clock that doesn't flake.

## Notes
- The GitHub hourly schedule is still in the workflow as a backup — if it ever
  does fire, no harm; the job has a concurrency lock so two can't overlap.
- Private-repo GitHub Actions get 2,000 free minutes/month. Hourly ingest uses
  ~720. Every 30 min uses ~1,440 — still free. Don't go tighter than that unless
  you make the repo public (then Actions minutes are unlimited).
- The token lives only in cron-job.org and can only start this workflow, so if it
  ever leaked, the worst anyone could do is refresh your campaign board.
