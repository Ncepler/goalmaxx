# GoalMaxx — CLAUDE.md

> Personal life-OS dashboard for Noah. Single-user app (just me). Inspired by @rowanthislebrooke's "GOALMAXXING" dashboard. Built in Next.js 15 + Supabase + Tailwind, deployed on Vercel, developed in GitHub Codespaces.

This file is the source of truth for the project. Read this in full before making changes. Do not skip features, do not invent features that aren't here.

---

## 1. Stack & environment

- **Framework:** Next.js 15 (App Router, TypeScript, Server Components by default)
- **Database / Auth:** Supabase (Postgres + Row Level Security)
- **Styling:** Tailwind CSS 4 + small set of custom CSS variables for the theme
- **Charts:** Recharts
- **Icons:** lucide-react
- **AI (later):** Anthropic API via `@anthropic-ai/sdk` — stubbed in v1, enabled when ready to pay
- **Deployment:** Vercel
- **Dev environment:** GitHub Codespaces (Linux disabled on Chromebook — DO NOT suggest local installs that require Linux/Docker)
- **Single user:** This is built for ME — Noah — and only me. There is no signup flow, no marketing page, no "tell your friends" anywhere. Use Supabase magic-link auth gated to my email only.

---

## 2. Visual design — match the video exactly

The dashboard in the reference video has a very specific look. Match it.

### 2.1 Color palette

```css
:root {
  /* Backgrounds */
  --bg-base: #0a0a0a;          /* matte black, primary background */
  --bg-elevated: #131313;      /* cards, elevated surfaces */
  --bg-hover: #1a1a1a;         /* hover state on cards */
  --bg-input: #0f0f0f;         /* inputs, search fields */

  /* Borders */
  --border-subtle: #1f1f1f;    /* default card border */
  --border-strong: #2a2a2a;    /* hover / active border */

  /* Text */
  --text-primary: #f5f5f0;     /* slightly warm white */
  --text-secondary: #8a8a85;   /* muted labels */
  --text-tertiary: #5a5a55;    /* very muted, timestamps */

  /* Accent — gold/amber, the signature color */
  --gold: #d4a85a;             /* primary gold for headline numbers */
  --gold-bright: #e8bd6c;      /* hover, focused state */
  --gold-dim: #8a6f3a;         /* progress bar fills, subdued */

  /* Status colors (used sparingly) */
  --success: #6b8e5a;          /* sage green — completed checkboxes */
  --warning: #c97a3a;          /* warm orange — priority / active task highlight */
  --danger: #a04545;           /* deep red — overdue, breaking streak */
  --info: #5a7a8e;             /* muted blue — incoming, scheduled */
}
```

### 2.2 Typography

- **Body / UI:** Inter (variable), default weight 400, slightly increased letter-spacing on labels
- **Display numbers** (the big "USD 168.43", "3/6 COMPLETE", scores): Inter at weight 700–800, wide tabular-nums, often in `--gold`
- **Section headers** (e.g. "ACTIVE SUBSCRIPTIONS", "WINS & POSITIVES", "NEXT SESSION"): UPPERCASE, letter-spacing `0.15em`, font-size 11px, color `--text-secondary`, often preceded by a thin horizontal rule (1px, `--border-subtle`, length ~24px)
- **Card titles:** weight 500, text-primary
- **Body text inside cards:** weight 400, text-secondary

### 2.3 Layout primitives

- Cards: rounded-xl (12px), `bg-elevated`, `border border-subtle`, padding 20px
- Section dividers: just a thin uppercase label with a 24px rule before it. No big hard borders.
- Bottom nav (mobile / narrow): icons + tiny labels, fixed bottom, matte black with subtle top border
- The active tab indicator is a single 1px gold underline below the icon
- Buttons: subtle. Primary action is a small pill with `bg-elevated` and gold text. No big colorful CTAs.
- Progress bars: thin (4px), `bg-input` track, `--gold-dim` fill, occasionally `--success` segments stacked together (see daily progress bar in the video)

### 2.4 The signature "vibes"

- Almost everything is dark on dark. Color is rare and meaningful.
- Big numbers in gold. Everything else is grayscale.
- A LOT of whitespace inside cards. Don't crowd.
- Section headers are uppercase, small, and far apart from their content (margin-bottom 16px).
- Transitions are 150ms ease-out. No bounces, no spring physics.

---

## 3. Page / route structure

```
app/
├── layout.tsx                  # Root layout, theme, font
├── page.tsx                    # Redirects to /main
├── (auth)/
│   └── login/page.tsx          # Magic link only, single user gate
├── main/
│   └── page.tsx                # MAIN TAB — daily dashboard
├── routine/
│   └── page.tsx                # ROUTINE PLANNER
├── workout/
│   ├── page.tsx                # Workout home (today's session)
│   ├── log/page.tsx            # Log a set
│   └── [exercise]/page.tsx     # Exercise detail (history, 1RM, trend)
├── projects/
│   ├── page.tsx                # All projects grid
│   └── [slug]/page.tsx         # Single project (PackPerfect, Decalyze, etc)
├── brand/
│   └── page.tsx                # Followers/views across accounts
├── finances/
│   └── page.tsx                # Subscriptions + income
├── sports/
│   ├── page.tsx                # My teams + playoff watch
│   ├── teams/[teamId]/page.tsx # Single team detail
│   └── my-games/page.tsx       # Games I'm playing in
├── piano/
│   └── page.tsx                # Songs to learn list
├── school/
│   ├── page.tsx                # School hub — classes & clubs grid
│   └── [slug]/page.tsx         # Single class/club detail (links, notes, HW)
├── sat/
│   └── page.tsx                # SAT prep + practice tests
├── reading/
│   └── page.tsx                # Reading log
├── calendar/
│   └── page.tsx                # All events combined
├── screen-time/
│   └── page.tsx                # Phone usage tracker
├── weekly/
│   └── page.tsx                # Sunday review
├── settings/
│   └── page.tsx                # Hydration cup size, lockdown rules, etc
└── api/
    ├── sports/
    │   ├── teams/[teamId]/route.ts     # ESPN proxy + cache
    │   ├── scoreboard/[league]/route.ts # ESPN scoreboard proxy
    │   └── playoffs/route.ts           # Combined playoff feed
    ├── github/
    │   └── commits/[repo]/route.ts     # GitHub API for project commits
    ├── health/
    │   └── shortcut/route.ts           # iOS Shortcut webhook (steps, sleep)
    └── overseer/                       # STUBBED in v1
        └── route.ts                    # Returns placeholder until Anthropic API is enabled
```

Bottom nav order (mobile): **Main · Routine · Workout · School · Sports · More**
"More" expands to: Projects, Brand, Finances, Piano, SAT, Reading, Calendar, Screen Time, Weekly, Settings.

---

## 4. Feature-by-feature specification

Every feature listed below MUST be implemented. Do not skip.

### 4.1 Main / Today tab

The home view. What you see when you open the app.

**Header strip (top of page):**
- Date, day of week (e.g. "THU, MAY 7")
- A "score" pill: 0–100, big number in gold (see scoring formula §5)
- Sleep % (last night's sleep / 8h target × 100)
- Habit streak count (longest active streak)
- Tiny status flags ("watch out — sleep below target", "streak in danger") shown only when relevant

**Daily task list:**
- Section header: "GOALMAXXING" or "TODAY — THU, MAY 7"
- Big counter: "3 / 6 COMPLETE" (gold for the numerator)
- Horizontal segmented progress bar (one segment per task, sage green when complete)
- Task rows:
  - Round checkbox on left (sage green when checked)
  - Task title
  - Optional priority highlight: the active/important task gets a 2px left border in `--warning` orange
  - Right side: a tiny lightning-bolt icon if it's a "must do today" task
  - Tap to expand → notes field, time estimate, can mark complete
- "+ Add" button at bottom of the list
- "Push remaining to tomorrow" button below the list (greys out completed, moves incomplete to tomorrow's plan)

**Hydration tracker:**
- Section header: "WATER"
- Three counters in a row, each with — and + buttons:
  1. **Home cup** (configurable mL in settings, default 500 mL) — displays count + total mL
  2. **Plastic water bottles** (configurable mL, default 500 mL)
  3. **Gatorade bottles** (configurable mL, default 591 mL = 20 oz)
- Total mL drank today, gold display number
- Daily target line (default 3000 mL, configurable)
- Thin progress bar, gold-dim fill, with a small "healthy zone" label when in range

**Sleep button:**
- Section header: "SLEEP"
- Single big button that toggles state:
  - State A (default): "Going to bed" — tapping records a `sleep_start` timestamp
  - State B (after tapping): "Just woke up" — tapping records `sleep_end`, calculates duration, stores the record, returns to State A
- Below the button: last night's duration (e.g. "7h 23m"), 7-day average, and a tiny chart
- If iOS Shortcut is set up, also displays steps from yesterday + last night's sleep from Apple Health (uses webhook data, see §6)

**Tomorrow's plan:**
- Section header: "PLAN TOMORROW — FRI, MAY 8"
- Task input list (same component as today's tasks, but writes to tomorrow's date)
- Subtitle: "Write tonight, locked until 6 AM"
- After 9 PM, prompts you with: "Plan tomorrow before you sleep"
- Between midnight and 6 AM, this section is read-only (the `locked_until_6am` flag)
- At 6 AM, the locked plan rolls into today's task list automatically

**Phone lockdown / focus toggle:**
- Section header: "FOCUS"
- A big toggle with a state label ("LOCKED IN" / "OPEN")
- When LOCKED IN: shows a countdown timer to unlock, the unlock conditions (e.g. "complete 3 tasks", "hit 6 PM", "ask accountability partner"), and a list of allowed apps
- This is a state tracker, NOT actual phone enforcement (we don't have OS-level access). Pair it with iOS Screen Time / Focus modes manually.
- Settings page lets you define unlock conditions
- Logging: every lockdown session is recorded (start, end, conditions, whether broken)

### 4.2 Routine planner

**Purpose:** every afternoon you tell it what's on your plate and it builds your evening backwards from bedtime.

**Inputs (form):**
- Bedtime target (default 11 PM, configurable in settings)
- **Pull from School tab:** an "Import today's homework" button at the top of the form. Tapping it pulls every uncompleted homework item from the School tab (§4.6) and inserts each as a routine item. You then classify each one (see below). This avoids retyping homework that's already logged per-class.
- Tonight's items, each as a card you can add:
  - **Type:** Homework / SAT prep / Piano / Workout / Game (Emirates / Islanders / etc) / Reading / Other
  - **For Homework type — additional required fields:**
    - **Length:** Short (≤20 min) / Medium (20–45 min) / Long (45+ min)
    - **Fun:** Yes / No (a "fun" assignment is one I actually want to do — a project, a creative task, something I'm into)
    - **Class:** dropdown from the School tab classes
  - Duration (minutes) — auto-prefilled by Length for Homework (Short=20, Medium=35, Long=60), editable
  - Hard time? (e.g. "Emirates game at 8 PM — fixed")
  - Priority (low / med / high) — for Homework, auto-suggests: Long+NotFun = High, Long+Fun = Med, Medium = Med, Short = Low. Override anytime.
  - Notes

**Output:**
- A vertical timeline from "now" → "bedtime"
- Each item placed as a block with start/end times
- Algorithm:
  1. Pin all hard-time items to their fixed slots
  2. Compute remaining free time
  3. Slot priority-high items first, working backwards from bedtime
  4. **For homework specifically:** schedule Long+NotFun items earliest in the evening (before fatigue), Short items as buffer fillers, Fun items as rewards near the end
  5. Pad with med, then low, until time runs out
  6. Items that don't fit go in a "couldn't fit" list with a warning
- If total duration > available time, show a red banner: "X minutes over — drop something"

**Algorithm only in v1.** No Claude calls. The "smart" version comes when API is enabled — see §10.

### 4.3 SAT prep

- List of upcoming SAT test dates (real, the official ones, manually added)
- "Schedule a practice test" → creates a calendar event with a 3-hour block, pulls from CollegeBoard's free practice tests (manual link entry per test)
- After a practice test, log:
  - Score (R/W, Math, total)
  - Date taken
  - Notes (what went wrong)
- Trend chart of scores over time
- "Days until next test" countdown on the SAT page header

### 4.4 Piano

- A list of songs you want to learn. Each row:
  - Song title
  - Artist
  - TikTok video URL (this is a tutorial link)
  - Status: `Want to learn` / `Currently learning` / `Learned`
  - Date added, date learned
- Tap the row → opens the TikTok URL in a new tab (or the TikTok app on mobile)
- Mark "currently learning" — only one song can be the current focus at a time
- "Mark as learned" → moves to bottom, dims, gold checkmark

### 4.5 Workout

The most data-rich screen. Match the layout in the video (NEXT SESSION → STATS → TREND → HISTORY → PAST WORKOUTS).

**Today's session:**
- "NEXT SESSION" header
- Big card per exercise:
  - Exercise name (e.g. "Hammer Curls")
  - Big display: target weight × reps (e.g. "20 kg × 6 reps")
  - "REPEAT" / "PROGRESS" pill — algorithm decides (see §5.3)
  - One-line coaching tip: "5 reps short of 6–8. Repeat 20kg until you hit 6+ clean."
  - Log set form: weight (kg slider/input) + reps (number stepper 1–12)
  - "Log set" button

**Per-exercise detail page:**
- "STATS" row: EST. 1RM, BEST SET, REPS (today)
- "TREND (LAST 10 SESSIONS)" mini line chart of est. 1RM over time, flat line indicates plateau
- "HISTORY" — list of past sessions with weight × reps × sets
- "PAST WORKOUTS" — link to full session log

**Schema for exercises:**
- `exercises` table: id, name, muscle_group, default_rep_range (low, high)
- `workout_sessions`: id, date, duration_min, notes
- `sets`: id, session_id, exercise_id, weight_kg, reps, set_order, rpe (optional)

**Estimated 1RM formula:** Epley — `weight × (1 + reps/30)`. Use the highest est. 1RM across the session's sets per exercise.

**Progressive overload logic:**
- Last session's top set: weight W × reps R, rep range [low, high]
- If R >= high: next session, increase weight (+2.5kg compound, +1.25kg isolation), reset reps to low
- If R >= low and R < high: same weight, push reps up
- If R < low: same weight, "REPEAT" until hitting low
- Coaching tip auto-generated from this state

### 4.6 School

**Purpose:** a hub for every class and club. Designed for the case where I keep this app open in a browser tab during the school day. One click takes me to the doc/site I always open for that class.

**Index page (`/school`):**
- Grid of cards, one per class and one per club
- Two sections, with section headers:
  - "CLASSES" — current courses (English, Honors Global History, Spanish 3H, etc.)
  - "CLUBS" — DECA, any other clubs
- Each card shows:
  - Class/club name (gold)
  - Period or meeting day/time
  - Teacher / advisor name
  - Today's assigned homework count (small chip, gold if any open)
  - Next due date among open assignments
- Tap card → class/club detail page

**Class/club detail page (`/school/[slug]`):**
- Header: name, teacher, period
- **Pinned links section:** the most-opened resources for that class. Each link has a label, URL, and an emoji/icon. Tap → opens in new tab.
  - Example: "Social Studies notes doc" → my Google Doc URL
  - Example: "Class Google Classroom" → that link
  - Example: "Spanish vocab Quizlet" → that link
- **Homework section:**
  - List of assignments for this class
  - Each row: title, due date, length (Short/Medium/Long), fun (yes/no), completed checkbox
  - "+ Add assignment" form
  - When I add HW, I classify it once here — the Routine planner reads from this same source
- **Class notes (markdown):** a freeform notes area per class — running notes, important dates, contact info
- **Recent units / topics** (optional): a list of unit titles I'm covering, useful when DECA cluster prep overlaps with a class
- For clubs: same shape, but "Homework" becomes "Action items" (e.g. DECA: roleplay practice scheduled, KPI list to memorize)

**Why this shape:**
- The pinned-links thing is the killer feature — it eliminates the friction of finding the same Drive doc 30 times a week
- Homework lives here so I only enter it once, and the Routine planner pulls from it (see §4.2)
- Each class has its own notes area so the app becomes a class-by-class second brain, not a single dumping ground

**Schema:** see §7 — `school_subjects`, `school_links`, `school_assignments`, `school_notes`.

### 4.7 Sports

**My Teams (priority):**
- Pinned: Islanders (NHL), Mets (MLB), Giants (NFL), Knicks (NBA)
- Each team card shows:
  - Team logo + name
  - Current record (e.g. "12–8")
  - Next game: opponent, date, time, home/away
  - Last result: opponent, score, W/L
  - Live score if currently playing (large gold display, auto-refreshes every 30s)
- Tap a team → full schedule + recent results page

**Playoff Watch:**
- A combined feed of all playoff games happening across NHL, NBA, MLB, NFL
- Filter pills: "All / NHL / NBA / MLB / NFL"
- My teams' playoff games pinned to top with a gold star
- Each game card: home team @ away team, score, time/quarter, status (scheduled / live / final)

**My Games (you playing):**
- Form to log: sport, date, time, location, opponent, result (after game)
- List view + integration with the Calendar tab
- Optional "I scored X / had Y assists / etc" stat field per sport

**Data source:**
- ESPN's undocumented public API: `https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/...`
- No auth, no rate limit problems for personal use
- Hit it from a Next.js API route (`/api/sports/...`), cache responses in Supabase for 5 min (table: `sports_cache` with `cache_key`, `payload`, `expires_at`)
- Endpoints we'll use:
  - `/sports/hockey/nhl/teams/ny-islanders` (and `/schedule`)
  - `/sports/baseball/mlb/teams/nym` (and `/schedule`)
  - `/sports/football/nfl/teams/nyg` (and `/schedule`)
  - `/sports/basketball/nba/teams/ny` (and `/schedule`)
  - `/sports/{sport}/{league}/scoreboard` for live scores

### 4.8 Projects

**Projects index page (grid of cards):**
- PackPerfect — Next.js + Supabase travel packing app
- Decalyze — DECA prep app
- Camp Closet — two-sided camp clothing marketplace
- GoalMaxx — this app (yes, it tracks itself)
- + ability to add new projects

**Each project card shows:**
- Project name + tagline
- Status pill: `Active / Paused / Shipped`
- GitHub repo link
- Commits in last 7 days (number, pulled from GitHub API)
- Last commit message + timestamp
- Open todo count (from a `project_tasks` table — separate from main tasks)

**Project detail page:**
- Recent commits list (last 20, from GitHub)
- Project-specific notes (markdown editor)
- Project-specific tasks
- Links: live URL, repo URL, deployment status

**GitHub integration:**
- Use `@octokit/rest` server-side
- Store a Personal Access Token in env vars (`GITHUB_PAT`)
- API route: `/api/github/commits/[repo]` returns recent commits
- Cache for 10 min in `github_cache` table

### 4.9 Brand

- Tracks follower / view counts across accounts
- Accounts to track (configurable):
  - Instagram: @packperfect.inc, personal
  - TikTok (if/when added)
  - YouTube (if/when added)
- v1: **manual entry**. Once a day you punch in the numbers.
- Schema: `brand_accounts` (id, platform, handle), `brand_snapshots` (id, account_id, date, followers, views_total, engagement)
- Display: tile per account, big follower count in gold, daily delta (+12, –3) in sage green / red, 30-day chart
- v2 (later): scrape via official APIs where possible (Instagram Graph API requires business account; TikTok API requires app review)

### 4.10 Finances

**Net summary card (top of page):**
- Big gold display: "+$X / −$Y / net $Z" for the current month
- Tiny sparkline of net by day for last 30 days
- Includes: incoming orders received this month, all subscriptions, all auto-tracked Claude API spend

**Subscriptions section:**
- "ACTIVE SUBSCRIPTIONS" header
- "MONTHLY BURN" big gold number (sum of all monthly subs, also USD/year displayed below)
- Per subscription card:
  - Service name
  - Cadence (monthly / annual / weekly)
  - Cost
  - Next charge date (in `--warning` orange if within 3 days)
- "+ Add" button: form with service, amount, currency, cadence, next charge date

**Income / incoming orders:**
- "INCOMING ORDERS" header
- List of expected income (e.g. PackPerfect sales, freelance invoices)
- Each row: source, amount, expected date, status (pending / received / overdue)
- Total expected this month in gold
- Sage green progress bar: "X received of Y expected"

**Claude API usage section ("CLAUDE SPEND"):**
- Shows API cost auto-tracked from every Overseer / Inbox / routine planner call
- Today, this week, this month — all in gold
- Token counter: input tokens used, output tokens used
- Each call is logged in `usage_costs` table when made (see schema)
- The total flows into the Net summary card above

**Claude.ai usage tracker — best-effort only:**
- Anthropic does NOT expose a public API for plan limits or remaining quota for Claude.ai or Claude Code
- What we CAN show:
  - Time until next 5-hour window reset (countdown timer, based on first message of current window if known — manual entry once)
  - Time until weekly reset
  - Estimated usage in current window for messages sent through OUR app's API key (not claude.ai or Claude Code chats — those we can't see)
- What we CANNOT show: actual remaining limit on Pro/Max plans. Display a small note: "Claude.ai limits not exposed by Anthropic — manual checks only."
- If/when Anthropic ships a usage endpoint, swap to it. Leave a `TODO(api-usage)` marker in the code.

**No crypto, no budget view.** (Explicitly cut.)

### 4.11 Calendar

- Combined view of all date-bound items:
  - Tasks with due dates
  - SAT practice tests + real test dates
  - DECA events
  - Decalyze milestones
  - Sports games (my teams' games + my own games)
  - Subscription renewal dates
- Month view (default) + week view + day view
- Tap a date → list of events for that day
- Color coding by type (task: gold, sport: red/blue per team, sub: gray, school: amber)

### 4.12 Food log

- Quick log: a single text input ("turkey sandwich, apple, water") + optional photo upload
- Photos stored in Supabase Storage (`food-photos` bucket, public reads gated by signed URL)
- Each entry: meal type (breakfast / lunch / dinner / snack — defaults to time-of-day guess), text, photo, logged_at
- Day view: chronological list of entries with thumbnails
- Quick "log again" button on past meals to copy them
- No macros, no calories — just what I ate

### 4.13 Medications

- Daily meds list (vitamins, prescriptions): name, dose, schedule (e.g. "8 AM daily", "with breakfast")
- Today's checklist on the Main tab — tiny row of pill icons, tap to mark taken
- "Taken" / "Missed" / "Skipped" log per dose
- **Reminders:** browser push notifications via the Web Push API (works on iOS Safari 16.4+ and any modern Android browser)
  - Settings page asks for notification permission once
  - Service worker registered in `app/layout.tsx`
  - Cron job (Vercel Cron, free tier: 1/hour) checks `medications` schedules every minute and sends push to subscribed devices when a dose is due
- Streak counter for "didn't miss a med this week"
- History view: 30-day grid showing taken/missed per med per day (mini heatmap, sage green = taken, dim = missed)

### 4.14 Reading log

- List of books currently reading + finished
- For each book: title, author, started date, finished date, total pages, current page, notes
- "Log a session" button: pages read + minutes spent
- Article log (separate tab inside Reading): URL, title, source, date read, time spent, key takeaway
- Stats: pages/week, books/year on track, time read this week

### 4.15 Screen time

- Manual daily log (input total screen time, social media time, productive time)
- Optional: iOS Shortcut pushes the daily Screen Time number to a webhook (see §6)
- Trend chart: 30-day rolling average
- Goal: configurable daily limit (e.g. 3h social), red bar segment when over

### 4.16 Weekly review (Sunday)

- Auto-prompted Sunday evening
- Pulls in:
  - Score average for the week
  - Tasks completed vs. attempted
  - Streaks gained / lost
  - Workouts logged
  - Hydration average
  - Sleep average
  - Reading minutes
- Free-text fields:
  - "What worked this week?"
  - "What didn't?"
  - "One thing to do differently next week"
- Saved as a `weekly_reviews` row (week_start, metrics_snapshot JSON, reflection_md)
- Past reviews accessible as a chronological list

### 4.17 Overseer (AI) — STUBBED in v1

- UI element: "Message Overseer" mic/text input at the top of the Main tab
- v1 behavior: input is captured and stored in a `overseer_messages` table (id, message, created_at, response, response_at). The "response" is a placeholder: "Overseer is sleeping. Wake him up by enabling the Anthropic API in settings."
- v2 behavior (when API enabled): the message is sent to Claude Sonnet via Anthropic API along with today's full state (tasks, score, hydration, sleep, etc.) as system context. Claude returns a response that pushes back, suggests cuts, calls out missed habits.
- Settings page has a toggle: "Wake the Overseer" — requires entering an API key + acknowledging cost
- Build the schema, the route handler, and the UI now. Just leave the API call commented with a `TODO(api)` marker.

---

## 5. Computed values & algorithms

### 5.1 Daily score (0–100)

Weighted sum, all components capped at 100% before weighting:

```
score = round(
  0.30 * (tasks_completed / tasks_planned)         +  // 30%
  0.20 * (water_ml_drunk / water_target_ml)        +  // 20%
  0.15 * (sleep_hours / 8)                         +  // 15%
  0.15 * (workout_logged_today ? 1 : 0)            +  // 15% — binary
  0.10 * (focus_minutes / focus_target_minutes)    +  // 10%
  0.10 * (tomorrow_plan_filled ? 1 : 0)               // 10% — binary
) * 100
```

If `tasks_planned == 0`, that component is excluded and weights re-normalize. Same for water/focus targets if not configured.

### 5.2 Streaks

- A habit is anything tracked daily: hydration target hit, workout done, tasks 80%+ complete, slept 7h+, no screen time over limit, etc.
- Streak = consecutive days the habit was met
- Stored per habit in `habit_logs` (habit_id, date, met)
- Display the longest active streak in the header

### 5.3 Progressive overload coaching

See §4.5 for the rule set. The "REPEAT" / "PROGRESS" decision and the coaching tip are computed on read (no need to store).

---

## 6. Apple Health integration via iOS Shortcut

Since we can't directly read HealthKit from the web, we use a workaround:

1. User creates an iOS Shortcut on their phone:
   - Trigger: "Run when I open GoalMaxx" (or daily at 7 AM via automation)
   - Actions: Get steps for yesterday, get sleep for last night, get screen time for yesterday → POST JSON to our webhook
2. Webhook endpoint: `POST /api/health/shortcut`
   - Headers: `x-shortcut-token: <SHORTCUT_TOKEN>` (env var, simple shared secret)
   - Body: `{ "date": "2026-05-09", "steps": 8421, "sleep_minutes": 443, "screen_time_minutes": 187, "social_minutes": 92 }`
3. Webhook upserts into `health_data` table (date as primary key)
4. Main tab + Screen Time tab read from this table

In the Settings page, provide a "Set up Apple Health Shortcut" walkthrough with copy-paste steps and a button to copy the webhook URL + token. Walk the user through it explicitly.

---

## 7. Database schema (Supabase)

```sql
-- Single user, but include user_id everywhere for future-proofing
-- All tables have RLS enabled; policy: user_id = auth.uid()

create table profiles (
  id uuid primary key references auth.users(id),
  display_name text,
  bedtime_target time default '23:00',
  water_target_ml int default 3000,
  cup_size_ml int default 500,
  bottle_size_ml int default 500,
  gatorade_size_ml int default 591,
  focus_target_minutes int default 240,
  shortcut_token text,                 -- for iOS Shortcut webhook
  anthropic_api_key text,              -- encrypted; null = Overseer asleep
  created_at timestamptz default now()
);

-- Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  due_date date not null,
  title text not null,
  notes text,
  est_minutes int,
  priority int default 0,              -- 0 normal, 1 high (orange highlight)
  completed boolean default false,
  completed_at timestamptz,
  rolled_from_date date,               -- if pushed from a previous day
  created_at timestamptz default now()
);
create index on tasks(user_id, due_date);

-- Hydration
create table hydration_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  date date not null,
  source text not null,                -- 'cup' | 'bottle' | 'gatorade'
  ml int not null,
  logged_at timestamptz default now()
);
create index on hydration_logs(user_id, date);

-- Sleep
create table sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  sleep_start timestamptz not null,
  sleep_end timestamptz,
  duration_minutes int,
  source text default 'manual',        -- 'manual' | 'shortcut'
  created_at timestamptz default now()
);

-- Health data (from iOS Shortcut)
create table health_data (
  user_id uuid references profiles(id) not null,
  date date not null,
  steps int,
  sleep_minutes int,
  screen_time_minutes int,
  social_minutes int,
  raw_payload jsonb,
  primary key (user_id, date)
);

-- Food log
create table food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  meal_type text,                      -- 'breakfast' | 'lunch' | 'dinner' | 'snack'
  description text not null,
  photo_url text,                      -- Supabase Storage signed URL
  logged_at timestamptz default now()
);
create index on food_logs(user_id, logged_at);

-- Medications
create table medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  name text not null,
  dose text,                           -- '500mg', '1 pill'
  schedule_times text[] not null,      -- array of HH:MM strings, e.g. ['08:00','20:00']
  notes text,                          -- 'with food', etc
  active boolean default true,
  created_at timestamptz default now()
);
create table medication_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  medication_id uuid references medications(id) on delete cascade not null,
  scheduled_for timestamptz not null,
  status text not null,                -- 'taken' | 'missed' | 'skipped'
  taken_at timestamptz,
  unique (medication_id, scheduled_for)
);
create index on medication_logs(user_id, scheduled_for);

-- Web Push subscriptions (for medication reminders)
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

-- Workouts
create table exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  name text not null,
  muscle_group text,
  rep_range_low int default 6,
  rep_range_high int default 8,
  weight_increment_kg numeric default 2.5,
  created_at timestamptz default now()
);
create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  date date not null,
  duration_minutes int,
  notes text,
  created_at timestamptz default now()
);
create table sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  session_id uuid references workout_sessions(id) not null,
  exercise_id uuid references exercises(id) not null,
  weight_kg numeric not null,
  reps int not null,
  set_order int not null,
  rpe numeric,
  logged_at timestamptz default now()
);
create index on sets(exercise_id, logged_at);

-- Routine planner
create table routine_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  date date not null,
  bedtime time not null,
  items jsonb not null,                -- [{type, duration_min, hard_time, priority, notes}]
  generated_schedule jsonb,            -- algorithm output
  created_at timestamptz default now()
);

-- SAT
create table sat_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  scheduled_for timestamptz not null,
  is_practice boolean default true,
  source_url text,
  rw_score int,
  math_score int,
  total_score int,
  taken_at timestamptz,
  notes text
);

-- Piano
create table piano_songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  title text not null,
  artist text,
  tiktok_url text,
  status text default 'want',          -- 'want' | 'learning' | 'learned'
  is_current boolean default false,    -- only one true per user
  added_at timestamptz default now(),
  learned_at timestamptz
);

-- School (classes & clubs)
create table school_subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  slug text not null,                  -- 'global-history', 'spanish-3h', 'deca'
  name text not null,                  -- 'Honors Global History'
  kind text not null,                  -- 'class' | 'club'
  teacher text,                        -- teacher name OR club advisor
  period text,                         -- '3rd period' OR 'Tuesdays 3:30-4:30'
  notes_md text,                       -- freeform notes per class/club
  sort_order int default 0,
  active boolean default true,
  created_at timestamptz default now(),
  unique (user_id, slug)
);
create table school_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  subject_id uuid references school_subjects(id) on delete cascade not null,
  label text not null,                 -- 'Notes Doc', 'Google Classroom'
  url text not null,
  icon text,                           -- emoji or lucide icon name
  sort_order int default 0,
  created_at timestamptz default now()
);
create table school_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  subject_id uuid references school_subjects(id) on delete cascade not null,
  title text not null,
  due_date date,
  length text,                         -- 'short' | 'medium' | 'long'
  fun boolean default false,           -- yes/no — assignment I actually want to do
  notes text,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);
create index on school_assignments(user_id, due_date, completed);

-- Sports
create table favorite_teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  league text not null,                -- 'nhl' | 'mlb' | 'nfl' | 'nba'
  espn_team_id text not null,
  display_name text not null,
  sort_order int default 0
);
create table my_games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  sport text not null,
  scheduled_for timestamptz not null,
  location text,
  opponent text,
  result text,                         -- 'W' | 'L' | 'T' | null
  notes text,
  stats jsonb
);
create table sports_cache (
  cache_key text primary key,
  payload jsonb not null,
  expires_at timestamptz not null
);

-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  slug text unique not null,
  name text not null,
  tagline text,
  status text default 'active',        -- 'active' | 'paused' | 'shipped'
  github_repo text,                    -- 'owner/repo'
  live_url text,
  notes_md text,
  created_at timestamptz default now()
);
create table project_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  project_id uuid references projects(id) not null,
  title text not null,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);
create table github_cache (
  cache_key text primary key,
  payload jsonb not null,
  expires_at timestamptz not null
);

-- Brand
create table brand_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  platform text not null,              -- 'instagram' | 'tiktok' | 'youtube'
  handle text not null,
  display_name text
);
create table brand_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  account_id uuid references brand_accounts(id) not null,
  date date not null,
  followers int,
  views_total bigint,
  engagement numeric
);

-- Finances
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  service text not null,
  cost numeric not null,
  currency text default 'USD',
  cadence text not null,               -- 'monthly' | 'annual' | 'weekly'
  next_charge_date date,
  created_at timestamptz default now()
);
create table incoming_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  source text not null,
  amount numeric not null,
  currency text default 'USD',
  expected_date date,
  status text default 'pending',       -- 'pending' | 'received' | 'overdue'
  received_at timestamptz,
  notes text
);

-- Claude API usage tracking
create table usage_costs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  feature text not null,               -- 'overseer' | 'inbox' | 'routine_planner'
  model text not null,                 -- 'claude-sonnet-4'
  input_tokens int not null,
  output_tokens int not null,
  cost_usd numeric not null,           -- computed at insert time from token counts
  created_at timestamptz default now()
);
create index on usage_costs(user_id, created_at);

-- Reading
create table books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  title text not null,
  author text,
  total_pages int,
  current_page int default 0,
  started_at date,
  finished_at date,
  notes_md text
);
create table reading_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  book_id uuid references books(id),
  date date not null,
  pages int,
  minutes int
);
create table articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  url text not null,
  title text,
  source text,
  read_at timestamptz default now(),
  minutes_spent int,
  takeaway text
);

-- Habits & streaks
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  name text not null,
  rule text not null,                  -- 'water_target' | 'workout_done' | 'tasks_80' | 'sleep_7h' | 'screen_under_limit' | custom
  active boolean default true
);
create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  habit_id uuid references habits(id) not null,
  date date not null,
  met boolean not null,
  unique (habit_id, date)
);

-- Focus / lockdown
create table focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  unlock_conditions jsonb,
  broken boolean default false,
  notes text
);

-- Weekly reviews
create table weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  week_start date not null,
  metrics_snapshot jsonb,
  worked_md text,
  didnt_work_md text,
  next_week_focus_md text,
  created_at timestamptz default now()
);

-- Overseer
create table overseer_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  message text not null,
  context_snapshot jsonb,              -- everything sent as context to Claude
  response text,
  responded_at timestamptz,
  created_at timestamptz default now()
);
```

Enable RLS on every table. Standard policy:
```sql
alter table <name> enable row level security;
create policy "own_data" on <name> for all using (auth.uid() = user_id);
```

---

## 8. Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-only, for admin queries

GITHUB_PAT=                         # Personal Access Token, repo:read scope
SHORTCUT_TOKEN=                     # shared secret for iOS Shortcut webhook

# Web Push (for medication reminders) — generate with: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=                      # 'mailto:your@email.com'

# v2, optional
ANTHROPIC_API_KEY=                  # leave blank in v1
```

Add a `.env.example` with these keys + comments.

---

## 9. Build order — ship in this sequence

Don't try to build it all at once. Each phase produces a usable app.

### Phase 1 — Foundation (Day 1)
- [ ] `create-next-app` with TypeScript, Tailwind, App Router
- [ ] Install deps: `@supabase/ssr`, `@supabase/supabase-js`, `recharts`, `lucide-react`, `date-fns`
- [ ] Set up Supabase project, run schema migration
- [ ] Configure theme: drop the CSS variables from §2.1 into `app/globals.css`, set Inter font in `layout.tsx`
- [ ] Build the layout shell: top header strip, bottom nav, theme applied
- [ ] Magic-link login gated to my email

### Phase 2 — Main tab (Day 1–2)
- [ ] Tasks (CRUD, push to tomorrow, segmented progress bar)
- [ ] Hydration (3 counters, total, target bar)
- [ ] Sleep button (toggle state, duration calc, last night display)
- [ ] Tomorrow's plan (write at night, locked 12am–6am)
- [ ] Daily score computation
- [ ] Streak counter
- [ ] Focus toggle (state-only, no enforcement)

### Phase 3 — School hub (Day 2)
- [ ] School subjects CRUD (seed with my actual classes + DECA)
- [ ] Class/club detail page with pinned links section
- [ ] Per-class assignments (with length + fun classification)
- [ ] Per-class notes_md editor

### Phase 4 — Workout (Day 2–3)
- [ ] Exercises CRUD
- [ ] Today's session view + log set form
- [ ] 1RM calc, progressive overload coaching
- [ ] Per-exercise detail page with trend + history

### Phase 5 — Sports (Day 3)
- [ ] ESPN proxy API routes + cache table
- [ ] Favorite teams setup (Islanders, Mets, Giants, Knicks)
- [ ] My Teams cards + live scores
- [ ] Playoff Watch combined feed
- [ ] My Games CRUD

### Phase 6 — Projects + Brand + Finances (Day 4)
- [ ] Projects index + detail, GitHub commits integration
- [ ] Brand: manual entry tiles + 30-day chart
- [ ] Finances: subscriptions + incoming orders

### Phase 7 — Routine planner + SAT + Piano + Food + Meds + Reading + Calendar (Day 4–5)
- [ ] Routine planner (algorithm v1, with "Import today's homework" pulling from School)
- [ ] SAT tests + practice scheduling
- [ ] Piano songs list with TikTok links
- [ ] Food log (text + photo upload to Supabase Storage)
- [ ] Medications CRUD + today's checklist on Main tab
- [ ] Web Push setup (VAPID keys, service worker, subscription flow)
- [ ] Vercel Cron job for medication reminders
- [ ] Reading log (books + articles)
- [ ] Combined Calendar view

### Phase 8 — Health Shortcut + Screen Time + Weekly Review (Day 5)
- [ ] iOS Shortcut webhook + Settings walkthrough
- [ ] Screen Time page (manual + Shortcut)
- [ ] Weekly review (auto-prompt Sunday, fill-in form, history)

### Phase 9 — Overseer stub + polish (Day 6)
- [ ] Overseer UI on Main tab
- [ ] Schema + route handler with placeholder response
- [ ] Settings: API key field (encrypted), "Wake the Overseer" toggle
- [ ] Animation pass: 150ms ease-out everywhere
- [ ] Mobile QA

### Phase 10 — Live with it (ongoing)
- Use it for 2 weeks before adding anything new
- Anything that bugs you, log in `notes_md` on the GoalMaxx project itself
- THEN enable Anthropic API and write the Overseer prompt

---

## 10. Overseer prompt (for v2, when API enabled)

When the user submits a message to the Overseer, send to Claude Sonnet via the Anthropic API with:

**System prompt:**
```
You are the Overseer — Noah's accountability coach. You see his entire day's
state: tasks completed, water drunk, sleep, workout, focus time, screen time,
streaks, and any notes. Your job is to be honest, not nice. Push back when he's
slipping. Call out missed habits. Suggest cuts when he's overcommitted. Be
specific — reference numbers from his day.

Tone: direct, dry, no emojis, no fluff. 2–4 sentences max unless he asks for
more. Don't open with "Hey Noah" or any greeting. Just respond.

Never be cruel, never pile on if he's already had a bad day. If he's hit
80%+ of his targets today, acknowledge it briefly then push him on the next
thing.
```

**User message:** the actual message + a JSON snapshot of today's state appended.

Use Claude Sonnet, max_tokens 400, temperature 0.7.

---

## 11. Things that are explicitly NOT in v1

Cut from the spec, do not build:
- Crypto / Coinbase integration
- Weekly / monthly budget view
- Mood / energy check-ins
- Wins & Positives log (the categorized one in the video)
- Public-facing share page
- Voice input to Overseer

---

## 12. Constraints to remember

- **Chromebook + Codespaces only.** No suggestions that require local Linux/Docker. Vercel CLI works in Codespaces.
- **Single user — this is for me, Noah, no one else.** Do NOT add multi-tenant logic, team features, sharing, onboarding flows, "create account" forms, marketing pages, pricing tables, or anything else that exists to scale to other people. If a design choice would be wrong if there were only one user ever, do it the way that's right for one user. (Schema still includes `user_id` everywhere — that's fine for future-proofing, but the UX assumes me only.)
- **A separate, future, very-low-priority project ("GoalMaxx for Others"):** if and when I want to share this with other people, that's a fork of this codebase, NOT a feature inside it. Add it as a row in the Projects tab (status: "paused", notes: "fork of GoalMaxx — multi-user version, do not start until v1 has been used daily for 3+ months"). Do not let this future project influence v1 decisions.
- **Mobile-first BUT desktop matters.** I'll have this open on my school Chromebook in a browser tab during the day, and on my phone the rest of the time. Layout must work cleanly at both. Use a responsive shell — bottom nav on narrow screens, side nav on wide screens (≥1024px).
- **No paid APIs in v1.** Overseer is stubbed. ESPN is free. GitHub PAT is free.
- **Match the visual reference.** If a design choice looks like a generic Tailwind admin dashboard, it's wrong. Re-check §2.

---

## 13. When in doubt

1. Re-read §2 (visual design). Most disagreements about how something should look are answered there.
2. Re-read §4 (features). Don't merge or skip features.
3. Match Rowan's video aesthetic: matte black + gold + sage green for completed + warm orange for priority. That's it.
4. Keep components small, composable, and named after what they show (`HydrationCounters.tsx`, not `WaterWidget.tsx`).
5. Server Components by default. Client Components only when interactive (forms, toggles, charts).

---

End of spec. Build it.
