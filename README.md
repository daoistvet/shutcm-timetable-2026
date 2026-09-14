# SHUTCM 国际学生课程表 · International Student Timetable

An interactive, fully static website showing the recommended timetables for
international students at Shanghai University of Traditional Chinese Medicine
(SHUTCM), organised by **intake year** (年级) and **class group**, with an
elective planner, a course catalogue, and the 5-year degree roadmap.
No backend, no build step on the server — plain HTML/CSS/JS + one data file.

**Live views per intake year (tabs: 2026 / 2025 / 2024 / 2023):**

1. **周课表 Weekly timetable** — Mon–Fri × 12 periods grid for the selected
   class group, colour-coded 必修 / 选修 / 实践·见习 / 任选一项, with week
   ranges, rooms, and a "current week" highlight (dimmed cards are not running
   this week). Period clock times and semester weeks come from the official
   2026–2027 academic calendar.
2. **选课规划 Elective planner** — mandatory courses are fixed; electives are
   toggles and “任选一项” groups are single-choice (e.g. sports clubs).
   A credit counter compares the selection against the semester target from
   the guided teaching plan (8 elective credits for 2024-intake TCM, Year 3
   Sem 1). Choices persist in `localStorage` and can be shared via URL.
3. **课程总目录 All courses** — the full course-selection catalogue (course
   code, credits, schedule, teacher, room, notes), filterable by cohort /
   English-track / 泰国班 / IMU / 汉语言, with search.
4. **培养计划 Degree roadmap** — the complete 5-year guided teaching plan
   (currently the 2024 TCM-intake plan) with the current year/semester
   highlighted and credit requirements (280 = 163.5 必修 + 34.5 选修 + 82 实践).

Room codes are decoded: `国教院208` → IEC 208, `标712` → SRC 712
(标准化研究中心大楼), 4-digit rooms → x楼 (e.g. `8206` → 8F 206),
5-digit rooms → xx楼 (e.g. `11203` → 11F 203), plus 体育馆 / 博物馆 /
全球合作伙伴中心报告厅.

## Project layout

```
input/                 source files (xls timetables + catalogue, plan PDFs, calendar image)
data/
  calendar.json        academic calendar + period times (transcribed from the official calendar)
  plans.json           curated 5-year teaching plans (transcribed from the plan PDFs)
scripts/build.py       parser: xls sheets + catalogue -> public/data.js / public/data.json
public/                the deployable static site (index.html, styles.css, app.js, data.js)
vercel.json            static deployment config (output directory = public)
```

## Regenerating for a new semester

1. Drop the new semester's two `.xls` files into `input/` and update
   `TIMETABLE_XLS` / `CATALOG_XLS` at the top of `scripts/build.py`.
2. Update `data/calendar.json` if the academic calendar changed.
3. Run:

   ```bash
   python scripts/build.py     # needs pandas + xlrd (pip install pandas xlrd)
   ```

4. Commit the regenerated `public/data.js` (and `data.json`).

## Adding degree plans for other cohorts

`data/plans.json` currently holds the 2024 TCM (中医) intake plan transcribed
from `2024年中医学专业指导性教学计划.pdf`. To add e.g. the 针推 (Acupuncture &
Tuina) plan or another intake year, add a top-level key keyed by intake year in
the same shape — the roadmap tab and the planner's elective-credit target pick
it up automatically. The weekly timetable and elective planner already work for
every group without a plan.

## Deploying to Vercel

The site is fully static; `public/` is all that gets served.

**Option A — dashboard:** import the repository at vercel.com, framework
preset "Other". `vercel.json` already sets the output directory to `public`.

**Option B — CLI:**

```bash
npm i -g vercel
vercel           # from the repository root; accept the defaults
vercel --prod    # deploy to production
```

No environment variables, no serverless functions.

## Local preview

```bash
cd public
python -m http.server 8741
# open http://localhost:8741
```
