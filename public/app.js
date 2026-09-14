/* SHUTCM international-student timetable — static front-end (no dependencies) */
"use strict";

const DATA = window.DATA;

/* ------------------------------------------------ i18n */
const I18N = {
  zh: {
    siteTitle: "国际学生课程表 · 2026–2027 第一学期",
    weekBadge: (w, range) => `第${w}周 · ${range}`,
    examBadge: "考试周",
    holidayBadge: "假期",
    breakBadge: "放假",
    intakeTab: (y) => `${y} 级`,
    intakeSub: (n) => `第${n}学年`,
    viewWeek: "周课表", viewPlan: "选课规划", viewCourses: "课程总目录", viewRoadmap: "培养计划",
    thisWeekOnly: "只看本周上课课程",
    print: "打印 / Print",
    planTitleMandatory: "必修课（固定）",
    planTitleElective: "选修课（点击勾选/取消）",
    planTitlePickOne: "任选一项（单选）",
    planTitlePractice: "实践 / 见习（固定）",
    planHintElective: "按指导性计划，本学期建议修读",
    planHintPickOne: "选择其中一项，其余将隐藏",
    planHintPractice: "随班安排，无需选择",
    planNonGrid: "本学期其他开设课程（不在周课表内）",
    creditsUnit: "学分",
    creditNow: "已选选修",
    creditTarget: "本学期建议目标",
    creditNoTarget: "选修学分要求以本专业指导性计划为准",
    pickSports: "体育俱乐部未选择",
    goWeek: "查看我的周课表",
    share: "复制分享链接",
    copied: "已复制",
    reset: "恢复推荐课表",
    scopeCohort: "本年级相关课程",
    scopeAll: "全部项目",
    trackChinese: "中文授课", trackEnglish: "English", trackThai: "泰国班", trackImu: "IMU", trackLang: "汉语言",
    searchPh: "搜索课程 / 教师 / 教室…",
    thCode: "课程编号", thName: "课程名称", thCredits: "学分", thTime: "上课时间", thTeacher: "教师", thRoom: "教室", thNote: "备注",
    roadmapPending: "该年级 / 专业的指导性教学计划（PDF）暂未提供，周课表与选课规划功能已可用。计划文本提供后将在此展示五年课程路线图。",
    roadmapCurrent: "本学期",
    mKind: "类型", mCode: "课程编号", mCredits: "学分", mHours: "学时", mTeacher: "任课教师",
    mWhen: "时间", mWeeks: "周次", mRoom: "教室", mSection: "选课序号", mNote: "备注",
    jianxiName: "（临床见习）",
    mandatory: "必修", elective: "选修", practice: "实践",
    oddWeeks: "单周", evenWeeks: "双周",
    noCourses: "没有符合条件的课程",
    legendMandatory: "必修", legendElective: "选修", legendPractice: "实践 / 见习", legendPickOne: "任选一项",
    legendDim: "淡色 = 本周无课",
    footerLegend: "图例：※ 必修课　★ 选修课　△ 实践课　·  节次时间与学期周次依据校历",
    footerSource: "数据来源：2026-2027-1国际学生推荐课程表（20260912）、国际学生教室安排（选课目录）、2024年中医学专业指导性教学计划、2026–2027学年校历。",
    weekRangeLabel: (a, b) => `第${a}–${b}周`,
    everyWeek: "每周",
    creditsOf: (c) => `${fmtCredits(c)} 学分`,
    perWeek: (n) => `${n}节/周`,
    langSwitchTo: "EN",
    selectDay: "选择星期",
    freeTBD: "待定",
  },
  en: {
    siteTitle: "International Student Timetable · AY 2026–2027 Sem 1",
    weekBadge: (w, range) => `Week ${w} · ${range}`,
    examBadge: "Exam period",
    holidayBadge: "Holiday",
    breakBadge: "Break",
    intakeTab: (y) => `Intake ${y}`,
    intakeSub: (n) => `Year ${n}`,
    viewWeek: "Weekly", viewPlan: "Plan electives", viewCourses: "All courses", viewRoadmap: "Degree roadmap",
    thisWeekOnly: "Only courses running this week",
    print: "Print",
    planTitleMandatory: "Mandatory courses (fixed)",
    planTitleElective: "Electives (click to toggle)",
    planTitlePickOne: "Pick exactly one",
    planTitlePractice: "Practice / clinical attachment (fixed)",
    planHintElective: "Suggested elective load this semester",
    planHintPickOne: "Pick one option — the others will be hidden",
    planHintPractice: "Arranged with the class — no choice needed",
    planNonGrid: "Also offered this semester (outside the weekly grid)",
    creditsUnit: "credits",
    creditNow: "Elective credits selected",
    creditTarget: "Suggested target this semester",
    creditNoTarget: "Elective credit requirements follow your program plan",
    pickSports: "No sports club chosen yet",
    goWeek: "Show my weekly timetable",
    share: "Copy share link",
    copied: "Copied!",
    reset: "Reset to recommended",
    scopeCohort: "My intake's courses",
    scopeAll: "All programs",
    trackChinese: "Chinese-taught", trackEnglish: "English", trackThai: "Thai program", trackImu: "IMU", trackLang: "Chinese language",
    searchPh: "Search course / teacher / room…",
    thCode: "Code", thName: "Course", thCredits: "Cr.", thTime: "Schedule", thTeacher: "Teacher", thRoom: "Room", thNote: "Notes",
    roadmapPending: "The guided teaching plan (PDF) for this intake / program is not available yet — the weekly timetable and elective planner already work. The 5-year roadmap will appear here once the plan is provided.",
    roadmapCurrent: "Current",
    mKind: "Type", mCode: "Course code", mCredits: "Credits", mHours: "Hours", mTeacher: "Teachers",
    mWhen: "When", mWeeks: "Weeks", mRoom: "Room", mSection: "Selection no.", mNote: "Notes",
    jianxiName: " (clinical attachment)",
    mandatory: "Mandatory", elective: "Elective", practice: "Practice",
    oddWeeks: "odd wks", evenWeeks: "even wks",
    noCourses: "No matching courses",
    legendMandatory: "Mandatory", legendElective: "Elective", legendPractice: "Practice / attachment", legendPickOne: "Pick one",
    legendDim: "Dimmed = not running this week",
    footerLegend: "Legend: ※ mandatory　★ elective　△ practice　·  Period times and week numbers follow the academic calendar",
    footerSource: "Sources: recommended timetable 2026-2027-1 (20260912), course-selection catalogue, 2024 TCM guided teaching plan, 2026–2027 academic calendar.",
    weekRangeLabel: (a, b) => `wks ${a}–${b}`,
    everyWeek: "weekly",
    creditsOf: (c) => `${fmtCredits(c)} cr.`,
    perWeek: (n) => `${n} pd/wk`,
    langSwitchTo: "中",
    selectDay: "Pick a day",
    freeTBD: "TBD",
  },
};
let LANG = localStorage.getItem("shutcm.lang") || "zh";
const t = (k, ...a) => {
  const f = I18N[LANG][k] !== undefined ? I18N[LANG][k] : I18N.zh[k];
  return typeof f === "function" ? f(...a) : f;
};

const DAYS = ["mon", "tue", "wed", "thu", "fri"];
const DAY_ZH = { mon: "一", tue: "二", wed: "三", thu: "四", fri: "五" };
const DAY_EN = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri" };
const DAY_LABEL = (d) => (LANG === "zh" ? "周" + DAY_ZH[d] : DAY_EN[d]);

/* ------------------------------------------------ rooms */
function decodeRoom(room) {
  if (!room) return null;
  const r = room.replace(/\s+/g, "");
  let m;
  if ((m = r.match(/^国教院(\d+(?:\/\d+)*)$/)))
    return { short: "IEC " + m[1], building: LANG === "zh" ? "国际教育学院教学楼" : "International Education College building" };
  if ((m = r.match(/^标(\d+(?:\/\d+)*)$/)))
    return { short: "SRC " + m[1], building: LANG === "zh" ? "标准化研究中心大楼" : "Standardization Research Center building" };
  if (r === "体育馆") return { short: "Gym", building: LANG === "zh" ? "体育馆" : "Gymnasium" };
  if (r === "博物馆") return { short: "Museum", building: LANG === "zh" ? "上海中医药博物馆" : "SHUTCM Museum" };
  if (r.startsWith("全球合作伙伴"))
    return { short: "GP Center", building: LANG === "zh" ? "全球合作伙伴中心报告厅" : "Global Partners Center lecture hall" };
  if (r === "待定") return { short: t("freeTBD"), building: null };
  if ((m = r.match(/^(\d)(\d{3})$/)))
    return { short: `${m[1]}F ${m[2]}`, building: LANG === "zh" ? `${m[1]}楼 ${m[2]}教室` : `Room ${m[2]}, level ${m[1]}` };
  if ((m = r.match(/^(\d{2})(\d{3})$/)))
    return { short: `${m[1]}F ${m[2]}`, building: LANG === "zh" ? `${m[1]}楼 ${m[2]}教室` : `Room ${m[2]}, level ${m[1]}` };
  return { short: r, building: null };
}
function roomShort(room) {
  const d = decodeRoom(room);
  return d ? d.short : "";
}

/* ------------------------------------------------ calendar helpers */
const CAL = DATA.calendar;
const S1 = CAL.semesters[0];
const PERIOD_TIMES = CAL.periodTimes;

function parseDate(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function fmtDay(d) {
  const monthsEn = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return LANG === "zh" ? `${d.getMonth() + 1}月${d.getDate()}日` : `${monthsEn[d.getMonth()]} ${d.getDate()}`;
}
function weekInfo(dateLike) {
  const now = dateLike || new Date();
  const first = parseDate(S1.firstWeekMonday);
  const days = Math.floor((now - first) / 86400000);
  const week = Math.floor(days / 7) + 1;
  const teachingWeeks = S1.teachingWeeks;
  let phase = "teaching";
  if (week < 1) phase = "before";
  else if (week > teachingWeeks && week <= S1.weeks) phase = "exam";
  else if (week > S1.weeks) phase = "after";
  const monday = new Date(first.getTime() + (week - 1) * 7 * 86400000);
  const sunday = new Date(monday.getTime() + 6 * 86400000);
  return { week, phase, monday, sunday, parity: week % 2 === 1 ? "单" : "双" };
}

/* ------------------------------------------------ state */
const groups = DATA.groups;
const intakeYears = [...new Set(groups.map((g) => g.intake))].sort((a, b) => b - a);
const YEAR_ORDER = [2024, 2023, 2025, 2026].filter((y) => intakeYears.includes(y))
  .concat(intakeYears.filter((y) => ![2024, 2023, 2025, 2026].includes(y)));

const state = {
  year: 2024,
  groupId: "24中医-1",
  view: "week",
  day: null,               // mobile day focus
  thisWeekOnly: false,
  courseScope: "cohort",
  courseQuery: "",
  selections: {},          // groupId -> { entryKey: bool }
};
try {
  Object.assign(state.selections, JSON.parse(localStorage.getItem("shutcm.sel.v1") || "{}"));
} catch (e) { /* ignore */ }

function saveSel() {
  try { localStorage.setItem("shutcm.sel.v1", JSON.stringify(state.selections)); } catch (e) { /* ignore */ }
}
function groupById(id) { return groups.find((g) => g.id === id) || groups[0]; }
function curGroup() { return groupById(state.groupId); }
function entryKey(e) { return `${e.day}|${Math.min(...e.periods)}|${e.course}|${e.weekFrom}`; }
function yearGroups(y) { return groups.filter((g) => g.intake === y); }
function currentAcadYearNum(intake) {
  return { 2023: 4, 2024: 3, 2025: 2, 2026: 1 }[intake] || 1;
}
function planFor(group) {
  const p = DATA.plans[String(group.intake)];
  if (!p) return null;
  return group.program === "中医" ? p : null;   // plan PDFs currently per-program
}
function planCurrentSemester(group) {
  const p = planFor(group);
  if (!p) return null;
  const y = p.years.find((yy) => yy.year === currentAcadYearNum(group.intake));
  return y ? y.semesters.find((s) => s.term === 1) || null : null;
}

/* visibility of an entry given user selections */
function pickOneGroups(group) {
  const map = {};
  for (const e of group.entries) {
    if (!e.pickOne) continue;
    const base = (e.course.match(/^[^（(]+/) || [e.course])[0];
    (map[base] = map[base] || []).push(e);
  }
  return map;
}
function entryVisible(group, e) {
  const sel = state.selections[group.id] || {};
  const key = entryKey(e);
  if (e.pickOne) {
    const base = (e.course.match(/^[^（(]+/) || [e.course])[0];
    let picked = null;
    for (const o of pickOneGroups(group)[base] || []) {
      if (sel[entryKey(o)] === true) picked = entryKey(o);
    }
    return picked === null || picked === key;
  }
  if (e.kind === "选修") return sel[key] !== false;
  return true;
}

/* ------------------------------------------------ rendering: chrome */
function el(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
}
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
function fmtCredits(c) {
  if (c == null) return "—";
  return (Math.round(c * 10) % 10 === 0) ? String(Math.round(c)) : c.toFixed(1);
}

function renderYearTabs() {
  const bar = document.getElementById("yearTabs");
  bar.innerHTML = "";
  const inner = el("div", "container");
  for (const y of YEAR_ORDER) {
    const btn = el("button", "year-tab" + (y === state.year ? " active" : ""));
    btn.innerHTML = `${esc(t("intakeTab", y))}<small>${esc(t("intakeSub", currentAcadYearNum(y)))} · ${LANG === "zh" ? "2026–27学年" : "AY 2026–27"}</small>`;
    btn.onclick = () => {
      state.year = y;
      const gs = yearGroups(y);
      state.groupId = gs[0].id;
      state.view = "week";
      syncHash(); renderAll();
    };
    inner.appendChild(btn);
  }
  bar.appendChild(inner);
}

function renderGroupBar() {
  const bar = document.getElementById("groupBar");
  const gs = yearGroups(state.year);
  bar.hidden = gs.length === 0;
  const pills = document.getElementById("groupPills");
  pills.innerHTML = "";
  for (const g of gs) {
    const b = el("button", "pill" + (g.id === state.groupId ? " active" : ""));
    b.textContent = LANG === "zh"
      ? `${g.programLabel}${g.group ? " " + g.group + " 班" : ""}`
      : `${g.programEn}${g.group ? " G" + g.group : ""}`;
    b.onclick = () => { state.groupId = g.id; syncHash(); renderAll(); };
    pills.appendChild(b);
  }
  const views = document.getElementById("viewTabs");
  views.innerHTML = "";
  for (const [v, label] of [["week", "viewWeek"], ["plan", "viewPlan"], ["courses", "viewCourses"], ["roadmap", "viewRoadmap"]]) {
    const b = el("button", "view-tab" + (state.view === v ? " active" : ""));
    b.textContent = t(label);
    b.onclick = () => { state.view = v; syncHash(); renderAll(); };
    views.appendChild(b);
  }
}

function renderHeaderExtras() {
  document.title = LANG === "zh" ? "SHUTCM 国际学生课程表" : "SHUTCM International Student Timetable";
  document.getElementById("langToggle").textContent = t("langSwitchTo");
  document.getElementById("semesterLine").textContent =
    (LANG === "zh" ? `${DATA.semester.label} · ${DATA.semester.start} 至 ${DATA.semester.end} · 共${DATA.semester.teachingWeeks}教学周`
      : `${DATA.semester.labelEn} · ${DATA.semester.start} – ${DATA.semester.end} · ${DATA.semester.teachingWeeks} teaching weeks`);
  const wi = weekInfo();
  const badge = document.getElementById("weekBadge");
  badge.hidden = false;
  if (wi.phase === "teaching") {
    badge.textContent = t("weekBadge", wi.week, `${fmtDay(wi.monday)} – ${fmtDay(wi.sunday)}`);
  } else if (wi.phase === "exam") {
    badge.textContent = t("examBadge") + ` · ${S1.examStart} – ${S1.examEnd}`;
  } else {
    badge.textContent = wi.phase === "before" ? (LANG === "zh" ? "开学前" : "Before semester") : (LANG === "zh" ? "学期已结束" : "Semester over");
  }
  const notes = S1.notes || [];
  const bar = document.getElementById("noticeBar");
  if (notes.length) {
    bar.hidden = false;
    bar.innerHTML = `<div class="container">📌 ${notes.map((n) => esc(LANG === "zh" ? n.label : n.labelEn)).join("　·　")}</div>`;
  }
  document.getElementById("fineprint").textContent =
    `${t("footerLegend")}　|　${t("footerSource")}　|　${LANG === "zh" ? "生成时间" : "Generated"} ${DATA.generatedAt}`;
  document.getElementById("legendNotes").innerHTML = weekLegendHTML() + `<div class="legend" style="margin-top:6px">${roomLegendHTML()}</div>`;
}

function weekLegendHTML() {
  const items = [
    ["mandatory", "legendMandatory"], ["elective", "legendElective"],
    ["practice", "legendPractice"], ["pickone", "legendPickOne"],
  ];
  return `<div class="legend">${items.map(([k, l]) =>
    `<span class="lg"><span class="swatch k-${k}"></span>${esc(t(l))}</span>`).join("")}
    <span class="lg">🕯️ ${esc(t("legendDim"))}</span></div>`;
}
function roomLegendHTML() {
  const samples = ["国教院208", "标712", "8206", "11203", "体育馆"];
  const rows = samples.map((r) => `${r} → <b>${roomShort(r)}</b>`).join("　·　");
  return `<span class="lg">🏠 ${rows}</span>`;
}

/* ------------------------------------------------ week grid */
function cardClass(e) {
  if (e.pickOne) return "pickone";
  if (e.kind === "必修") return "mandatory";
  if (e.kind === "选修") return "elective";
  return "practice";
}
function entryClock(e) {
  const p0 = Math.min(...e.periods), p1 = Math.max(...e.periods);
  const a = (PERIOD_TIMES[p0] || "").split("-")[0];
  const b = (PERIOD_TIMES[p1] || "").split("-")[1];
  return a && b ? `${a}–${b}` : "";
}
function weeksLabel(e) {
  let s;
  if (LANG === "zh") s = e.weekFrom === e.weekTo ? `第${e.weekFrom}周` : `第${e.weekFrom}–${e.weekTo}周`;
  else s = e.weekFrom === e.weekTo ? `wk ${e.weekFrom}` : `wks ${e.weekFrom}–${e.weekTo}`;
  if (e.parity) s += LANG === "zh" ? `（${e.parity === "单" ? "单周" : "双周"}）` : ` (${e.parity === "单" ? "odd" : "even"})`;
  return s;
}
function runsThisWeek(e, wi) {
  if (wi.phase !== "teaching") return true;
  if (wi.week < e.weekFrom || wi.week > e.weekTo) return false;
  if (e.parity && e.parity !== wi.parity) return false;
  return true;
}

function renderWeek() {
  const g = curGroup();
  const grid = document.getElementById("weekGrid");
  grid.innerHTML = "";
  const wi = weekInfo();
  const todayIdx = (new Date().getDay() + 6) % 7; // 0=Mon
  const isToday = (di) => wi.phase === "teaching" && todayIdx === di;

  document.getElementById("weekToolbarNote").textContent =
    LANG === "zh"
      ? `${g.intake}级 ${g.programLabel}${g.group ? " " + g.group + " 班" : ""} · 推荐课程表（学期第1–${DATA.semester.teachingWeeks}周，考试周 ${S1.examStart} 起）`
      : `Intake ${g.intake} · ${g.programEn}${g.group ? " group " + g.group : ""} · recommended timetable (teaching wks 1–${DATA.semester.teachingWeeks}, exams from ${S1.examStart})`;
  document.getElementById("thisWeekOnly").parentNode.style.display = "";

  /* mobile day picker */
  const wrap = grid.parentNode.parentNode;
  let dp = wrap.querySelector(".day-picker");
  if (!dp) { dp = el("div", "day-picker"); wrap.insertBefore(dp, wrap.querySelector(".grid-wrap")); }
  dp.innerHTML = "";
  if (state.day == null) state.day = wi.phase === "teaching" ? todayIdx : 0;
  DAYS.forEach((d, i) => {
    const b = el("button", "pill" + (i === state.day ? " active" : ""));
    b.textContent = DAY_LABEL(d);
    b.onclick = () => { state.day = i; renderWeek(); };
    dp.appendChild(b);
  });

  /* header row */
  const corner = el("div", "wg-cell wg-head corner", LANG === "zh" ? "节次" : "Period");
  grid.appendChild(corner);
  DAYS.forEach((d, i) => {
    const hd = el("div", "wg-head wg-cell" + (isToday(i) ? " today" : ""));
    hd.innerHTML = `${DAY_LABEL(d)}<small>${fmtDay(new Date(wi.monday.getTime() + i * 86400000))}</small>`;
    grid.appendChild(hd);
  });

  const blocks = CAL.blocks;
  let row = 2;
  for (const blk of blocks) {
    const bh = el("div", "wg-block", LANG === "zh" ? blk.label : blk.labelEn);
    bh.style.gridRow = String(row); bh.style.gridColumn = "1 / -1";
    grid.appendChild(bh);
    row += 1;
    for (const p of blk.periods) {
      const pc = el("div", "wg-cell wg-period");
      pc.style.gridRow = String(row); pc.style.gridColumn = "1";
      pc.innerHTML = `<b>${p}</b><small>${(PERIOD_TIMES[String(p)] || "").replace("-", "<br>–")}</small>`;
      grid.appendChild(pc);
      row += 1;
    }
  }

  /* background cells + entries per day */
  DAYS.forEach((d, di) => {
    row = 2;
    for (const blk of blocks) {
      row += 1;
      for (const p of blk.periods) {
        const cell = el("div", "wg-cell");
        cell.style.gridRow = String(row); cell.style.gridColumn = String(di + 2);
        if (blk.id === "morning") cell.style.borderTop = "none";
        grid.appendChild(cell);
        row += 1;
      }
    }
    const dayEntries = g.entries.filter((e) => e.day === d && entryVisible(g, e));
    /* lanes for overlapping entries */
    const sorted = [...dayEntries].sort((a, b) => Math.min(...a.periods) - Math.min(...b.periods) || (Math.max(...b.periods) - Math.min(...b.periods)) - (Math.max(...a.periods) - Math.min(...a.periods)));
    const lanes = [];
    for (const e of sorted) {
      const s = Math.min(...e.periods), en = Math.max(...e.periods);
      let lane = 0;
      while ((lanes[lane] || []).some((iv) => !(en < iv[0] || s > iv[1]))) lane += 1;
      (lanes[lane] = lanes[lane] || []).push([s, en]);
      e._lane = lane;
    }
    const laneCount = Math.max(1, lanes.length);
    for (const e of dayEntries) {
      const s = Math.min(...e.periods), en = Math.max(...e.periods);
      // grid rows: r1 header; morning block hdr r2, periods 1-5 -> r3-7;
      // afternoon hdr r8, periods 6-9 -> r9-12; evening hdr r13, periods 10-12 -> r14-16
      const gridRowStart = s <= 5 ? 2 + s : s <= 9 ? 3 + s : 4 + s;
      const holder = el("div");
      holder.style.cssText = `position:relative;grid-row:${gridRowStart} / span ${en - s + 1};grid-column:${di + 2};`;
      const card = el("button", `course-card ${cardClass(e)}` + (runsThisWeek(e, wi) ? "" : " dim") + (state.thisWeekOnly && !runsThisWeek(e, wi) ? " selected-off" : ""));
      card.style.left = `calc(${(e._lane * 100) / laneCount}% + 2px)`;
      card.style.width = `calc(${100 / laneCount}% - 4px)`;
      const chips = [];
      chips.push(`<span class="cc-chip">${esc(weeksLabel(e))}</span>`);
      const room = e.rooms && e.rooms[0] ? roomShort(e.rooms[0]) : "";
      if (room) chips.push(`<span class="cc-chip">📍${esc(room)}</span>`);
      if (runsThisWeek(e, wi) && wi.phase === "teaching") chips.push(`<span class="cc-chip now">${LANG === "zh" ? "本周" : "now"}</span>`);
      card.innerHTML = `<span class="cc-name">${esc(e.course)}${e.jianxi ? esc(t("jianxiName")) : ""}</span>`
        + (e.subtitle ? `<span class="cc-sub">${esc(e.subtitle)}</span>` : "")
        + `<span class="cc-meta">${esc(entryClock(e))}${e.time ? " · " + esc(e.time) : ""}</span>`
        + (e.teachers && e.teachers.length ? `<span class="cc-meta cc-teachers">👤${esc(e.teachers.join("、"))}</span>` : "")
        + `<span class="cc-chips">${chips.join("")}</span>`;
      card.onclick = () => openEntryModal(e);
      holder.appendChild(card);
      grid.appendChild(holder);
    }
  });

  document.getElementById("weekLegend").innerHTML =
    weekLegendHTML() + `<span class="lg" style="margin-left:auto">${LANG === "zh" ? "点击课程卡片查看详情" : "Click a card for details"}</span>`;
}

/* ------------------------------------------------ plan view */
function renderPlan() {
  const g = curGroup();
  const sel = state.selections[g.id] = state.selections[g.id] || {};
  const main = document.getElementById("planMain");
  const side = document.getElementById("planSide");
  main.innerHTML = "";
  side.innerHTML = "";

  const mkGroup = (title, hint) => {
    const box = el("div", "plan-group");
    const hd = el("header");
    hd.innerHTML = `<span>${esc(title)}</span>` + (hint ? `<span class="hint">${esc(hint)}</span>` : "");
    box.appendChild(hd);
    return box;
  };
  const mkItem = (e, mode) => {
    // mode: 'fixed' | 'toggle' | 'radio'
    const row = el("div", `plan-item ${mode === "fixed" ? "mandatory" : entryVisible(g, e) ? "" : "off"}`);
    const check = el("div", "pi-check");
    const input = document.createElement("input");
    input.type = mode === "radio" ? "radio" : "checkbox";
    if (mode === "radio") input.name = "po-" + e._poBase;
    const visible = entryVisible(g, e);
    if (mode === "fixed") { input.checked = true; input.disabled = true; }
    else if (mode === "toggle") input.checked = visible;
    else input.checked = e._picked === true;
    if (mode !== "fixed") {
      input.onchange = () => {
        if (mode === "toggle") {
          sel[entryKey(e)] = !input.checked ? false : true;
          if (input.checked) delete sel[entryKey(e)];   // default is on
        } else {
          const base = e._poBase;
          for (const o of pickOneGroups(g)[base] || []) sel[entryKey(o)] = false;
          if (input.checked) sel[entryKey(e)] = true;
        }
        saveSel(); renderPlan();
      };
    }
    check.appendChild(input);
    const body = el("div", "pi-body");
    body.innerHTML = `<div class="pi-name">${esc(e.course)}${e.jianxi ? esc(t("jianxiName")) : ""}${e.subtitle ? ` <small style="font-weight:500;color:var(--ink-soft)">· ${esc(e.subtitle)}</small>` : ""}</div>`
      + `<div class="pi-meta">${esc(DAY_LABEL(e.day))} ${Math.min(...e.periods)}–${Math.max(...e.periods)}节 ${esc(entryClock(e))} · ${esc(weeksLabel(e))}`
      + (e.rooms && e.rooms[0] ? ` · 📍${esc(e.rooms.map(roomShort).join("/"))}` : "")
      + (e.teachers && e.teachers.length ? ` · ${esc(e.teachers.join("、"))}` : "") + `</div>`;
    const cr = el("div", "pi-credits", e.credits != null ? `${fmtCredits(e.credits)} ${t("creditsUnit")}` : "—");
    row.append(check, body, cr);
    return row;
  };

  const fixedMand = g.entries.filter((e) => e.kind === "必修" && !e.pickOne);
  const fixedPrac = g.entries.filter((e) => e.kind === "实践" || e.jianxi);
  const electives = g.entries.filter((e) => e.kind === "选修" && !e.pickOne);
  const poGroups = pickOneGroups(g);

  if (fixedMand.length) {
    const box = mkGroup(t("planTitleMandatory"), t("planHintPractice"));
    fixedMand.forEach((e) => box.appendChild(mkItem(e, "fixed")));
    main.appendChild(box);
  }

  const poKeys = Object.keys(poGroups);
  if (poKeys.length) {
    const box = mkGroup(t("planTitlePickOne"), t("planHintPickOne"));
    for (const base of poKeys) {
      const opts = poGroups[base];
      opts.forEach((e) => { e._poBase = base; e._picked = (sel[entryKey(e)] === true); });
      opts.forEach((e) => box.appendChild(mkItem(e, "radio")));
    }
    main.appendChild(box);
  }

  if (electives.length) {
    const box = mkGroup(t("planTitleElective"), planTarget(g) != null ? `${t("planHintElective")} ${fmtCredits(planTarget(g))} ${t("creditsUnit")}` : "");
    electives.forEach((e) => box.appendChild(mkItem(e, "toggle")));
    main.appendChild(box);
  }

  if (fixedPrac.length) {
    const box = mkGroup(t("planTitlePractice"), "");
    fixedPrac.forEach((e) => box.appendChild(mkItem(e, "fixed")));
    main.appendChild(box);
  }

  /* legend-only courses (arranged outside the weekly grid) */
  const onGrid = new Set(g.entries.map((e) => e.course));
  const legendOnly = Object.entries(g.legend || {}).filter(([name]) => {
    const n = name.replace(/学$/, "");
    return ![...onGrid].some((c) => c === name || c.replace(/学$/, "") === n || c.startsWith(name) || name.startsWith(c));
  });
  if (legendOnly.length) {
    const box = mkGroup(t("planNonGrid"), "");
    const note = el("div", "plan-empty-note");
    note.innerHTML = legendOnly.map(([name, v]) =>
      `<b>${esc(name)}</b>（${esc(t("creditsOf", v.hours != null ? v.hours / 14 : null))}${v.teachers && v.teachers.length ? " · " + esc(v.teachers.join("、")) : ""}）`).join("　·　");
    box.appendChild(note);
    main.appendChild(box);
  }

  /* side panel */
  const target = planTarget(g);
  const { credits, pending } = electiveCredits(g);
  const card = el("div", "side-card");
  card.innerHTML = `<h3>${esc(t("creditNow"))}</h3>
    <div class="credit-big">${fmtCredits(credits)} <small>${t("creditsUnit")}</small></div>`
    + (target != null
      ? `<div class="meter"><div style="width:${Math.min(100, (credits / target) * 100)}%"></div></div>
         <div class="side-note">${esc(t("creditTarget"))}: ${fmtCredits(target)} ${t("creditsUnit")}${pending ? ` · ⚠️ ${esc(t("pickSports"))}` : ""}</div>`
      : `<div class="side-note" style="margin-top:8px">${esc(t("creditNoTarget"))}${pending ? ` · ⚠️ ${esc(t("pickSports"))}` : ""}</div>`);
  const actions = el("div", "side-actions");
  const go = el("button", "btn primary", t("goWeek"));
  go.onclick = () => { state.view = "week"; syncHash(); renderAll(); };
  const share = el("button", "btn", t("share"));
  share.onclick = () => {
    const url = new URL(location.href);
    url.hash = location.hash;
    url.searchParams.set("sel", encodeURIComponent(JSON.stringify(state.selections)));
    navigator.clipboard && navigator.clipboard.writeText(url.toString());
    share.textContent = t("copied");
    setTimeout(() => (share.textContent = t("share")), 1500);
  };
  const reset = el("button", "btn", t("reset"));
  reset.onclick = () => { delete state.selections[g.id]; saveSel(); renderPlan(); };
  actions.append(go, share, reset);
  card.appendChild(actions);
  side.appendChild(card);

  const info = el("div", "side-card");
  info.innerHTML = `<h3>${LANG === "zh" ? "怎么用" : "How this works"}</h3><ul class="side-list">
    <li>${LANG === "zh" ? "必修与实践课已随班固定，无需操作。" : "Mandatory and practice courses are fixed with your class group."}</li>
    <li>${LANG === "zh" ? "勾选/取消选修课、从“任选一项”中挑选，周课表会同步更新。" : "Toggle electives and pick from “choose one” groups — the weekly grid updates too."}</li>
    <li>${LANG === "zh" ? "“复制分享链接”会把你的选择编码进网址，方便发给同学或保存。" : "“Copy share link” encodes your choices into the URL."}</li>
    <li>${LANG === "zh" ? "五年课程结构见“培养计划”标签。" : "See the “Degree roadmap” tab for the 5-year structure."}</li>
  </ul>`;
  side.appendChild(info);
}

function planTarget(group) {
  const sem = planCurrentSemester(group);
  return sem ? sem.electiveCredits : null;
}
function electiveCredits(group) {
  const sel = state.selections[group.id] || {};
  let credits = 0;
  let pending = false;
  for (const e of group.entries) {
    if (e.kind !== "选修") continue;
    if (e.pickOne) {
      const base = (e.course.match(/^[^（(]+/) || [e.course])[0];
      const opts = pickOneGroups(group)[base] || [];
      const picked = opts.filter((o) => sel[entryKey(o)] === true);
      if (picked.length) credits += picked[0].credits || 0;
      else pending = true;
    } else if (sel[entryKey(e)] !== false) {
      credits += e.credits || 0;
    }
  }
  return { credits, pending };
}

/* ------------------------------------------------ courses view */
function renderCourses() {
  const g = curGroup();
  const scope = document.getElementById("courseScope");
  scope.innerHTML = "";
  const chips = [
    ["cohort", t("scopeCohort")],
    ["english", t("trackEnglish")], ["thai", t("trackThai")], ["imu", t("trackImu")], ["lang", t("trackLang")],
    ["all", t("scopeAll")],
  ];
  for (const [key, label] of chips) {
    const c = el("button", "chip" + (state.courseScope === key ? " active" : ""));
    c.textContent = label;
    c.onclick = () => { state.courseScope = key; renderCourses(); };
    scope.appendChild(c);
  }
  const q = state.courseQuery.trim().toLowerCase();
  let list = DATA.catalog;
  if (state.courseScope === "cohort") {
    const ids = new Set(g.cohortSectionIds);
    list = list.filter((s) => ids.has(s.id));
  } else if (state.courseScope !== "all") {
    list = list.filter((s) => s.track === state.courseScope);
  }
  if (q) {
    list = list.filter((s) =>
      [s.name, s.teacher, s.room, s.code, s.remark].join(" ").toLowerCase().includes(q));
  }
  const tbl = document.getElementById("courseTable");
  const thead = `<thead><tr>
    <th>${t("thCode")}</th><th>${t("thName")}</th><th>${t("thCredits")}</th>
    <th>${t("thTime")}</th><th>${t("thTeacher")}</th><th>${t("thRoom")}</th><th>${t("thNote")}</th>
  </tr></thead>`;
  const rows = list.map((s) => {
    const rd = decodeRoom(s.room);
    const time = (s.parts || []).map((p) =>
      `${DAY_LABEL(p.day)} ${p.periods && p.periods.length ? p.periods.join(".") + "节" : ""}${p.weekFrom ? ` ${LANG === "zh" ? p.weekFrom === p.weekTo ? "第" + p.weekFrom + "周" : p.weekFrom + "-" + p.weekTo + "周" : "wk" + p.weekFrom + "-" + p.weekTo}` : ""}${p.parity ? (LANG === "zh" ? "(" + p.parity + "周)" : p.parity === "单" ? "(odd)" : "(even)") : ""}`).join("<br>") || esc(s.scheduleRaw);
    return `<tr>
      <td class="ct-code">${esc(s.code)}<br><small>#${s.id}</small></td>
      <td class="ct-name">${esc(s.name)}</td>
      <td>${s.credits != null ? fmtCredits(s.credits) : "—"}</td>
      <td>${time}</td>
      <td>${esc(s.teacher)}</td>
      <td>${rd ? `<b>${esc(rd.short)}</b><br><small style="color:var(--ink-soft)">${esc(rd.building || "")}</small>` : "—"}</td>
      <td>${esc(s.remark || "")}</td>
    </tr>`;
  });
  tbl.innerHTML = thead + `<tbody>${rows.length ? rows.join("") : `<tr><td colspan="7" style="text-align:center;color:var(--ink-soft);padding:24px">${t("noCourses")}</td></tr>`}</tbody>`;
}

/* ------------------------------------------------ roadmap view */
function renderRoadmap() {
  const g = curGroup();
  const body = document.getElementById("roadmapBody");
  const plan = planFor(g);
  if (!plan) {
    body.innerHTML = `<div class="placeholder-card">📚 ${esc(t("roadmapPending"))}</div>`;
    return;
  }
  const curYear = currentAcadYearNum(g.intake);
  const d = plan.degree;
  const cards = `
    <div class="degree-cards">
      <div class="degree-card"><div class="dc-num">${d.totalCredits}</div><div class="dc-label">${LANG === "zh" ? "毕业总学分" : "Total credits for graduation"}</div></div>
      <div class="degree-card"><div class="dc-num">${d.mandatory}</div><div class="dc-label">${t("mandatory")}</div></div>
      <div class="degree-card"><div class="dc-num">${d.elective}</div><div class="dc-label">${t("elective")}（${LANG === "zh" ? `五年共开设 ${d.electiveOffered}` : `${d.electiveOffered} offered over 5 years`}）</div></div>
      <div class="degree-card"><div class="dc-num">${d.practice}</div><div class="dc-label">${t("practice")}</div></div>
      <div class="degree-card"><div class="dc-num">${d.durationYears}${LANG === "zh" ? "年" : "yrs"}</div><div class="dc-label">${d.degreeEn}</div></div>
    </div>`;
  const kindTag = (k) => `<span class="kind-tag ${k === "必修" ? "mandatory" : k === "选修" ? "elective" : "practice"}">${esc(k === "必修" ? t("mandatory") : k === "选修" ? t("elective") : t("practice"))}</span>`;
  const yearsHTML = plan.years.map((y) => {
    const isCur = y.year === curYear;
    const sums = y.semesters.map((s) => {
      const parts = [];
      if (s.mandatoryCredits) parts.push(`${t("mandatory")} ${s.mandatoryCredits}`);
      if (s.electiveCredits) parts.push(`${t("elective")} ${s.electiveCredits}`);
      if (s.practiceCredits) parts.push(`${t("practice")} ${s.practiceCredits}`);
      return parts.join(" + ");
    }).join("；");
    const sems = y.semesters.map((s) => {
      const now = isCur && s.term === 1;
      const rows = s.courses.map((c) => `<tr>
        <td class="num" style="width:90px">${esc(c.code)}</td>
        <td>${esc(c.name)} ${kindTag(c.kind)}${c.note ? `<small style="color:var(--ink-soft)"> *${esc(c.note)}</small>` : ""}</td>
        <td class="num" style="width:60px">${fmtCredits(c.credits)}</td>
        <td class="num" style="width:90px">${esc(c.hours)}</td>
      </tr>`).join("");
      return `<div class="semester-h">${LANG === "zh" ? "第" + s.term + "学期" : "Semester " + s.term}${now ? `<span class="now-badge">★ ${t("roadmapCurrent")}</span>` : ""}
        <small style="font-weight:500;color:var(--ink-soft)">${sums ? "" : ""}</small></div>
      <table class="sem-table"><tbody>${rows}</tbody></table>`;
    }).join("");
    const label = LANG === "zh" ? `第${y.year}学年` : `Year ${y.year}`;
    const labelEn = LANG === "zh" ? (y.year === curYear ? "（本学年）" : "") : (y.year === curYear ? " (current)" : "");
    return `<div class="year-block${isCur ? " current" : ""}" data-open="${isCur}">
      <header onclick="this.parentNode.classList.toggle('open')">
        <span class="yb-title">${label}${labelEn}</span><span class="yb-sums">${esc(sums)}</span>
      </header>
      <div class="yb-body">${sems}</div>
    </div>`;
  }).join("");
  body.innerHTML = cards
    + `<p style="font-size:13px;color:var(--ink-soft);margin:0 0 12px">📄 ${esc(plan.source)}${LANG === "en" ? " (in Chinese)" : ""}</p>`
    + yearsHTML;
  body.querySelectorAll(".year-block").forEach((b) => {
    if (b.dataset.open !== "true") b.classList.add("collapsed");
  });
}

/* ------------------------------------------------ modal */
function openEntryModal(e) {
  const body = document.getElementById("modalBody");
  const times = `${DAY_LABEL(e.day)} ${Math.min(...e.periods)}–${Math.max(...e.periods)}节（${entryClock(e)}）`;
  const rooms = (e.segments || []).map((s) =>
    `${t("weekRangeLabel", s.weekFrom, s.weekTo)}：📍${s.room ? roomShort(s.room) : "—"}`).join("<br>");
  body.innerHTML = `
    <h3>${esc(e.course)}${e.jianxi ? esc(t("jianxiName")) : ""}</h3>
    ${e.subtitle ? `<div class="m-sub">${esc(e.subtitle)}</div>` : ""}
    <dl>
      <dt>${t("mKind")}</dt><dd><span class="kind-tag ${e.kind === "必修" ? "mandatory" : e.kind === "选修" ? "elective" : "practice"}">${esc(e.kind === "必修" ? t("mandatory") : e.kind === "选修" ? t("elective") : t("practice"))}${e.pickOne ? " · " + t("planTitlePickOne") : ""}</span></dd>
      ${e.code ? `<dt>${t("mCode")}</dt><dd>${esc(e.code)}</dd>` : ""}
      <dt>${t("mCredits")}</dt><dd>${e.credits != null ? `${fmtCredits(e.credits)} ${t("creditsUnit")}` : "—"}${e.hours ? ` <small>(${e.hours} ${t("mHours")})</small>` : ""}</dd>
      <dt>${t("mWhen")}</dt><dd>${esc(times)}${e.time ? ` <small>实际时段 ${esc(e.time)}</small>` : ""}</dd>
      <dt>${t("mWeeks")}</dt><dd>${esc(weeksLabel(e))}</dd>
      <dt>${t("mRoom")}</dt><dd>${rooms}${e.rooms && e.rooms[0] && decodeRoom(e.rooms[0]) && decodeRoom(e.rooms[0]).building ? `<br><small style="color:var(--ink-soft)">${esc(decodeRoom(e.rooms[0]).building)}</small>` : ""}</dd>
      ${e.teachers && e.teachers.length ? `<dt>${t("mTeacher")}</dt><dd>${esc(e.teachers.join("、"))}</dd>` : ""}
      ${e.sectionId ? `<dt>${t("mSection")}</dt><dd>#${e.sectionId}</dd>` : ""}
    </dl>`;
  document.getElementById("modalBackdrop").hidden = false;
}

/* ------------------------------------------------ url + boot */
function syncHash() {
  location.hash = `/${state.year}/${state.groupId}/${state.view}`;
}
function parseHash() {
  const m = location.hash.match(/^#\/(\d+)\/([^/]+)\/(\w+)$/);
  if (m) {
    const y = parseInt(m[1], 10);
    if (intakeYears.includes(y)) state.year = y;
    const gid = decodeURIComponent(m[2]);
    if (groups.some((g) => g.id === gid)) state.groupId = gid;
    if (["week", "plan", "courses", "roadmap"].includes(m[3])) state.view = m[3];
  }
  const qs = new URLSearchParams(location.search);
  if (qs.get("sel")) {
    try {
      const shared = JSON.parse(decodeURIComponent(qs.get("sel")));
      Object.assign(state.selections, shared);
      saveSel();
    } catch (e) { /* ignore */ }
  }
}

function applyI18nStatic() {
  document.documentElement.lang = LANG === "zh" ? "zh" : "en";
  document.querySelectorAll("[data-i18n]").forEach((n) => { n.textContent = t(n.dataset.i18n); });
  const s = document.getElementById("courseSearch");
  if (s) s.placeholder = t("searchPh");
}

function renderAll() {
  renderYearTabs();
  renderGroupBar();
  for (const v of ["week", "plan", "courses", "roadmap"]) {
    document.getElementById("view-" + v).hidden = v !== state.view;
  }
  if (state.view === "week") renderWeek();
  else if (state.view === "plan") renderPlan();
  else if (state.view === "courses") renderCourses();
  else renderRoadmap();
}

function boot() {
  parseHash();
  applyI18nStatic();
  renderHeaderExtras();
  renderAll();
  document.getElementById("langToggle").onclick = () => {
    LANG = LANG === "zh" ? "en" : "zh";
    localStorage.setItem("shutcm.lang", LANG);
    applyI18nStatic(); renderHeaderExtras(); renderAll();
  };
  document.getElementById("thisWeekOnly").onchange = (ev) => { state.thisWeekOnly = ev.target.checked; renderWeek(); };
  document.getElementById("printBtn").onclick = () => window.print();
  document.getElementById("courseSearch").oninput = (ev) => { state.courseQuery = ev.target.value; renderCourses(); };
  document.getElementById("modalClose").onclick = () => { document.getElementById("modalBackdrop").hidden = true; };
  document.getElementById("modalBackdrop").addEventListener("click", (ev) => {
    if (ev.target === ev.currentTarget) ev.currentTarget.hidden = true;
  });
  window.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") document.getElementById("modalBackdrop").hidden = true;
  });
  window.addEventListener("hashchange", () => { parseHash(); renderAll(); });
}

document.addEventListener("DOMContentLoaded", boot);
