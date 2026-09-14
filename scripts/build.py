# -*- coding: utf-8 -*-
"""
Build script for the SHUTCM international-student timetable site.

Reads:
  input/2026-2027-1国际学生推荐课程表20260912.xls  weekly grid, one sheet per class group
  input/2026-2027-1国际学生教室安排.xls            course-section catalog (code/credits/teacher/room)
  data/plans.json                                  curated 5-year teaching plans (from PDFs)
  data/calendar.json                               academic calendar + period times (from official calendar image)

Writes:
  public/data.js   (window.DATA = {...})  and  public/data.json (same payload, for debugging)

Re-run after dropping in a new semester's xls files:  python scripts/build.py
"""
import json
import re
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

import xlrd

ROOT = Path(__file__).resolve().parent.parent
INPUT = ROOT / "input"
DATA = ROOT / "data"
PUBLIC = ROOT / "public"

TIMETABLE_XLS = INPUT / "2026-2027-1国际学生推荐课程表20260912.xls"
CATALOG_XLS = INPUT / "2026-2027-1国际学生教室安排.xls"

DAY_KEYS = ["mon", "tue", "wed", "thu", "fri"]
DAY_CN = ["一", "二", "三", "四", "五"]
# body rows -> period numbers (row 10 is the morning/afternoon separator)
ROW2PERIOD = {5: 1, 6: 2, 7: 3, 8: 4, 9: 5, 11: 6, 12: 7, 13: 8, 14: 9, 15: 10, 16: 11, 17: 12}

UNITS = {"mon": "周一", "tue": "周二", "wed": "周三", "thu": "周四", "fri": "周五"}


def norm(s):
    """normalise a course name for matching"""
    if s is None:
        return ""
    s = str(s)
    s = s.replace("\n", "").replace("\r", "").replace(" ", "").replace("\u3000", "")
    s = s.replace("(", "（").replace(")", "）")
    return s


# ---------------------------------------------------------------- text tokens

RE_WEEKS = re.compile(r"(\d{1,2})\s*[-–—~～]\s*(\d{1,2})\s*周")
RE_WEEK1 = re.compile(r"(?<![\d])(\d{1,2})\s*周")
RE_PARITY = re.compile(r"[（(]\s*([单双])\s*[)）]")
RE_PERIODS = re.compile(r"[（(]\s*(\d{1,2})\s*[-–]\s*(\d{1,2})\s*节\s*[)）]")
RE_TIME = re.compile(r"[（(]\s*(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})\s*[)）]")
RE_ROOM_CN = re.compile(r"(国教院\s*\d+|标\s*\d+(?:\s*/\s*\d+)*|全球合作伙伴中心报告厅|体育馆|博物馆)")
RE_ROOM_NUM = re.compile(r"(?<![\d])(\d{4,5})(?![\d])")


def extract_tokens(line):
    """pull weeks/parity/periods/time/room tokens out of one line of a cell.
    returns (tokens_dict, leftover_text)"""
    t = {"weeks": [], "parity": None, "periods": None, "time": None, "rooms": []}
    for m in RE_WEEKS.finditer(line):
        t["weeks"].append((int(m.group(1)), int(m.group(2))))
    rest = RE_WEEKS.sub("", line)
    if not t["weeks"]:
        m = RE_WEEK1.search(rest)
        if m:
            w = int(m.group(1))
            t["weeks"].append((w, w))
            rest = RE_WEEK1.sub("", rest, count=1)
    m = RE_PARITY.search(rest)
    if m:
        t["parity"] = m.group(1)
        rest = RE_PARITY.sub("", rest, count=1)
    m = RE_PERIODS.search(rest)
    if m:
        t["periods"] = (int(m.group(1)), int(m.group(2)))
        rest = RE_PERIODS.sub("", rest, count=1)
    m = RE_TIME.search(rest)
    if m:
        t["time"] = m.group(1) + "-" + m.group(2)
        rest = RE_TIME.sub("", rest, count=1)
    for m in RE_ROOM_CN.finditer(rest):
        t["rooms"].append(re.sub(r"\s+", "", m.group(1)))
    rest = RE_ROOM_CN.sub("", rest)
    for m in RE_ROOM_NUM.finditer(rest):
        t["rooms"].append(m.group(1))
    rest = RE_ROOM_NUM.sub("", rest)
    rest = rest.replace("/", " ").replace("／", " ")
    rest = re.sub(r"[（(]\s*[)）]", "", rest)
    rest = re.sub(r"\s+", " ", rest).strip(" 、,，.;；-")
    return t, rest


def looks_like_name(text):
    """does a leftover line look like (part of) a course name?"""
    if not text:
        return False
    if text in ("见习", "上", "下", "晚"):
        return False
    if RE_WEEKS.search(text) and len(RE_WEEKS.sub("", text).strip()) < 2:
        return False
    return True


# ---------------------------------------------------------------- cell reader

def cell_text(sh, r, c, datemode):
    """return the text content of a cell, or ''. Handles xlrd date artifacts
    (a typed '1-14周' that Excel mangled into a date) and numeric rooms."""
    try:
        ct = sh.cell_type(r, c)
        v = sh.cell_value(r, c)
    except Exception:
        return ""
    if ct == xlrd.XL_CELL_EMPTY or ct == xlrd.XL_CELL_BLANK or v is None:
        return ""
    if ct == xlrd.XL_CELL_DATE:
        # two known mangle modes: a room number (e.g. 8202) typed into a
        # date-formatted cell, or a weeks token ('1-13') auto-converted to a date
        try:
            tup = xlrd.xldate.xldate_as_tuple(v, datemode)
        except Exception:
            return ""
        iv = int(v) if float(v).is_integer() else None
        if iv is not None and 1000 <= iv <= 99999:
            return str(iv)
        if tup[0] in (0, 1) and 1 <= tup[1] <= 12 and 1 <= tup[2] <= 20 and tup[3] == 0:
            return f"{tup[1]}-{tup[2]}周"
        return ""
    if ct == xlrd.XL_CELL_NUMBER:
        if float(v).is_integer():
            return str(int(v))
        return str(v)
    if ct == xlrd.XL_CELL_TEXT:
        return str(v).replace("\r\n", "\n").replace("\r", "\n")
    return str(v)


# ---------------------------------------------------------------- legend

def parse_legend(sh, datemode):
    """teacher rows: find '任课教师' row, collect ※/★/△ course entries until 注： row"""
    start = None
    end = None
    for r in range(sh.nrows):
        c0 = cell_text(sh, r, 0, datemode)
        if "任课教师" in c0:
            start = r
        if start is not None and "注：" in cell_text(sh, r, 1, datemode) + c0:
            end = r
            break
    if start is None:
        return {}
    end = end if end is not None else sh.nrows
    blob = []
    for r in range(start, end):
        for c in range(1, sh.ncols):
            blob.append(cell_text(sh, r, c, datemode))
    text = " ".join(blob)
    entries = {}
    for m in re.finditer(r"([※★△])([^※★△]+)", text):
        seg = m.group(2)
        seg = re.sub(r"注：.*", "", seg)
        kind = {"※": "必修", "★": "选修", "△": "实践"}[m.group(1)]
        mm = re.match(r"\s*([^(※★△:：]+?)\s*[（(]([\d.]+)[)）]\s*(?:[:：]\s*(.*))?$", seg.strip())
        if mm:
            name, hours, teachers = mm.group(1), float(mm.group(2)), mm.group(3) or ""
        else:
            mm = re.match(r"\s*([^(※★△:：]+?)\s*[:：]([^※★△]*)", seg)
            if not mm:
                continue
            name, hours, teachers = mm.group(1), None, mm.group(2)
        name = norm(name)
        teachers = [t.strip() for t in re.split(r"[/、,，\s]+", teachers or "") if t.strip()]
        teachers = [t for t in teachers if t not in ("任选一项", "任选其一", "任选")]
        pick_one = "任选一项" in seg or "任选其一" in seg
        if name and name not in entries:
            entries[name] = {
                "kind": kind, "hours": hours, "teachers": teachers, "pickOne": pick_one,
            }
        else:
            if name in entries:
                entries[name]["pickOne"] = entries[name]["pickOne"] or pick_one
    return entries


# ---------------------------------------------------------------- catalog

def parse_catalog_schedule(s):
    """parse a schedule string like '1-14周一6.7.8周三3.4.5,5-11周二6.7.8(单)'
    into a list of parts: {weekFrom,weekTo,day,periods,parity}.
    A weeks prefix binds to the day right after it; parts without their own
    weeks inherit from the previous part."""
    parts = []
    seg_re = re.compile(
        r"(?:(\d{1,2})\s*[-–]\s*(\d{1,2})|(?<![\d])(\d{1,2}))?\s*(?=周[一二三四五六日])"
        r"周([一二三四五六日])\s*([0-9.\s]+?)"
        r"(?=\s*周[一二三四五六日]|$|[,，;；]|[（(][单双][)）])"
        r"\s*(?:[（(]([单双])[)）])?")
    prev_wf, prev_wt = None, None
    for m in seg_re.finditer(s or ""):
        wf = wt = None
        if m.group(1):
            wf, wt = int(m.group(1)), int(m.group(2))
        elif m.group(3):
            wf = wt = int(m.group(3))
        if wf is None:
            wf, wt = prev_wf, prev_wt
        prev_wf, prev_wt = wf, wt
        daycn = m.group(4)
        if daycn not in DAY_CN:
            continue
        periods = []
        for p in re.findall(r"\d{1,2}", m.group(5) or ""):
            p = int(p)
            if 1 <= p <= 12:
                periods.append(p)
        parts.append({
            "weekFrom": wf, "weekTo": wt,
            "day": DAY_KEYS[DAY_CN.index(daycn)],
            "periods": sorted(set(periods)),
            "parity": m.group(6),
        })
    return parts


def load_catalog():
    wb = xlrd.open_workbook(str(CATALOG_XLS))
    sh = wb.sheet_by_index(0)
    sections = []
    for r in range(1, sh.nrows):
        def g(c):
            return cell_text(sh, r, c, wb.datemode).strip()
        name = g(2)
        if not name:
            continue
        sched = g(4)
        room, room_note = g(6), ""
        remark = g(7)
        if room == "见备注" and remark:
            first = re.split(r"[，,；;]", remark)[0].strip()
            if "周" not in first and len(first) < 30:
                room_note = remark
        try:
            credits = float(g(3))
        except ValueError:
            credits = None
        sections.append({
            "id": int(float(g(0) or 0)),
            "code": g(1),
            "name": name,
            "credits": credits,
            "scheduleRaw": sched,
            "parts": parse_catalog_schedule(sched),
            "teacher": g(5),
            "room": room,
            "roomNote": room_note,
            "remark": remark,
            "track": classify_track(name, remark),
        })
    return sections


def classify_track(name, remark):
    if re.search(r"[A-Za-z]{3}", name):
        return "english"
    if "泰国班" in remark:
        return "thai"
    if "IMU" in remark:
        return "imu"
    if "汉语言" in remark:
        return "lang"
    return "chinese"


# ---------------------------------------------------------------- sheet grid

def parse_sheet(wb, sheet_name, catalog_by_name, plan_kinds):
    sh = wb.sheet_by_name(sheet_name)
    datemode = wb.datemode
    title = cell_text(sh, 2, 0, datemode)

    legend = parse_legend(sh, datemode)

    # --- gather body entries per day column, block by block (morning/afternoon/
    # evening). Block boundaries reset the "current entry" so a repeated course
    # header in a new block opens a fresh option instead of merging.
    BLOCKS = [(5, 9), (11, 14), (15, 17)]
    entries = []
    for ci, day in enumerate(DAY_KEYS):
        col = ci + 2
        for blk, (r0, r1) in enumerate(BLOCKS):
            cur = None
            for r in range(r0, r1 + 1):
                txt = cell_text(sh, r, col, datemode).strip()
                if not txt:
                    continue
                cell_lines = [ln.strip() for ln in txt.split("\n") if ln.strip()]
                for li, ln in enumerate(cell_lines):
                    tokens, leftover = extract_tokens(ln)
                    structural = bool(tokens["weeks"] or tokens["rooms"] or tokens["time"])
                    name_like = looks_like_name(leftover)
                    if ln == "见习" or (leftover == "见习" and not name_like):
                        if cur is not None:
                            cur["jianxi"] = True
                            cur["rows"].append(r)
                        else:
                            cur = new_entry(day, blk)
                            entries.append(cur)
                        continue
                    first_of_cell = (li == 0)
                    # complete = has both weeks and rooms already
                    cur_complete = cur is not None and cur["weeks"] and cur["rooms"]
                    if (first_of_cell and name_like
                            and (not structural or cur is None or cur_complete)):
                        # repeated course header (same name again) -> ignore
                        if cur is not None and norm("".join(cur["nameParts"])) == norm(leftover):
                            cur["rows"].append(r)
                            continue
                        cur = new_entry(day, blk)
                        cur["nameParts"] = [leftover]
                        cur["rows"] = [r]
                        merge_tokens(cur, tokens)
                        entries.append(cur)
                    else:
                        if cur is None:
                            continue
                        # a cell that opens with week/room data right after a
                        # complete entry starts a parallel option of that course
                        if first_of_cell and structural and cur_complete:
                            cur = new_entry(day, blk)
                            entries.append(cur)
                        cur["rows"].append(r)
                        merge_tokens(cur, tokens)
                        if leftover:
                            if cur["weeks"] or cur["rooms"] or cur["time"]:
                                cur.setdefault("subtitles", []).append(leftover)
                            else:
                                cur["nameParts"].append(leftover)

    # --- normalize course names before post-processing
    for e in entries:
        e["course"] = re.sub(r"\s+", "", "".join(e["nameParts"])).strip().rstrip("：:")
        if e["course"].endswith("见习"):
            e["course"] = e["course"][:-2]
            e["jianxi"] = True

    # --- post-process: nameless parallel options inherit the preceding named
    # entry's course; entries that never got weeks/room/time fold into the
    # previous entry as variant subtitles (same day + block only)
    cleaned = []
    for e in entries:
        if not e["nameParts"] and cleaned:
            prev = cleaned[-1]
            if prev["course"] and prev["day"] == e["day"] and prev["blk"] == e["blk"]:
                e["nameParts"] = list(prev["nameParts"])
        if (not e["nameParts"]) or (
                not e["weeks"] and not e["rooms"] and not e["time"] and not e["periodNote"]
                and cleaned and cleaned[-1]["day"] == e["day"]
                and cleaned[-1]["blk"] == e["blk"]
                and (cleaned[-1]["weeks"] or cleaned[-1]["rooms"])):
            if (cleaned and cleaned[-1]["day"] == e["day"]
                    and cleaned[-1]["blk"] == e["blk"]):
                cleaned[-1].setdefault("subtitles", []).extend(
                    e["nameParts"] or ["（未注明）"])
                cleaned[-1]["jianxi"] = cleaned[-1]["jianxi"] or e["jianxi"]
                continue
        cleaned.append(e)
    entries = cleaned

    # --- recompute names after inheritance, then merge consecutive entries of
    # the same course in the same day+block with disjoint weeks into segments
    # (e.g. 中医导引学 wk1-7 @国教院216 + wk8-12 @11103)
    for e in entries:
        e["course"] = re.sub(r"\s+", "", "".join(e["nameParts"])).strip().rstrip("：:")
        if e["course"].endswith("见习"):
            e["course"] = e["course"][:-2]
            e["jianxi"] = True
    merged = []
    for e in entries:
        if merged:
            p = merged[-1]
            if (p["course"] and p["course"] == e["course"] and p["day"] == e["day"]
                    and p["blk"] == e["blk"] and not e["jianxi"]
                    and p["weeks"] and e["weeks"]
                    and max(w[1] for w in p["weeks"]) < min(w[0] for w in e["weeks"])):
                p["weeks"].extend(e["weeks"])
                for (a, b) in e["weeks"]:
                    p["segmentRooms"][(a, b)] = e["rooms"][0] if e["rooms"] else None
                p["rows"].extend(e["rows"])
                continue
        merged.append(e)
    entries = merged

    # --- finalize each entry: type, teachers, credits, periods, weeks
    for e in entries:
        lg = match_legend(legend, e["course"])
        pc = plan_kinds.get(norm(e["course"]))
        e["kind"] = lg["kind"] if lg else (pc["kind"] if pc else ("实践" if e["jianxi"] else None))
        e["teachers"] = lg["teachers"] if lg else []
        e["hours"] = lg["hours"] if lg else None
        e["pickOne"] = lg["pickOne"] if lg else False
        e["credits"] = round(lg["hours"] / 14.0, 1) if (lg and lg["hours"]) else None
        if pc and pc.get("credits"):
            e["credits"] = pc["credits"]

        # join with catalog section
        sec, part = join_catalog(catalog_by_name, e, day=e["day"])
        if sec:
            e["sectionId"] = sec["id"]
            e["code"] = sec["code"]
            if sec["credits"] is not None:
                e["credits"] = sec["credits"]
            if not e["teachers"] and sec["teacher"]:
                e["teachers"] = [t for t in re.split(r"[、,，/]", sec["teacher"]) if t.strip()]
            if part:
                if part["periods"]:
                    e["periods"] = list(part["periods"])
                if not e["weeks"] and part["weekFrom"]:
                    e["weeks"] = [(part["weekFrom"], part["weekTo"])]
                if part["parity"] and not e["parity"]:
                    e["parity"] = part["parity"]
            if (not e["rooms"]) and sec["room"] and sec["room"] not in ("见备注", "待定"):
                e["rooms"] = [sec["room"]]

        # periods still unknown -> row span; weeks unknown -> course-level default
        if not e["periods"] and e["periodNote"]:
            e["periods"] = list(range(e["periodNote"][0], e["periodNote"][1] + 1))
        if not e["periods"] and e["rows"]:
            ps = [ROW2PERIOD[r] for r in e["rows"]]
            e["periods"] = list(range(min(ps), max(ps) + 1))
        if not e["weeks"] and e["course"]:
            same = [x for x in entries if x.get("course") == e["course"] and x["weeks"]]
            if same:
                e["weeks"] = same[0]["weeks"]
        if not e["weeks"]:
            e["weeks"] = [(1, 14)]
        e["weekFrom"] = min(w[0] for w in e["weeks"])
        e["weekTo"] = max(w[1] for w in e["weeks"])
        if not e["periods"]:
            e["periods"] = [1]
        e["segments"] = [
            {"weekFrom": a, "weekTo": b, "room": e["segmentRooms"].get((a, b))}
            for (a, b) in e["weeks"]
        ]
        for sgm in e["segments"]:
            if sgm["room"] is None and e["rooms"]:
                sgm["room"] = e["rooms"][0]

    out = []
    for e in entries:
        out.append({
            "course": e["course"],
            "kind": e["kind"],
            "code": e.get("code"),
            "credits": e["credits"],
            "hours": e["hours"],
            "teachers": e["teachers"],
            "day": e["day"],
            "periods": e["periods"],
            "weekFrom": e["weekFrom"],
            "weekTo": e["weekTo"],
            "parity": e["parity"],
            "rooms": e["rooms"],
            "segments": e["segments"],
            "time": e["time"],
            "subtitle": "；".join(e.get("subtitles", [])) or None,
            "jianxi": e["jianxi"],
            "pickOne": e["pickOne"],
            "sectionId": e.get("sectionId"),
        })
    return {"sheet": sheet_name, "title": title.strip(), "legend": legend, "entries": out}


def new_entry(day, blk=0):
    return {
        "day": day, "blk": blk, "nameParts": [], "weeks": [], "parity": None, "periods": [],
        "periodNote": None, "time": None, "rooms": [], "rows": [], "jianxi": False,
        "subtitles": [], "segmentRooms": {},
    }


def merge_tokens(e, t):
    for (a, b) in t["weeks"]:
        if 1 <= a <= 20 and 1 <= b <= 20 and b >= a:
            e["weeks"].append((a, b))
    if t["parity"] and not e["parity"]:
        e["parity"] = t["parity"]
    if t["periods"] and not e["periodNote"]:
        e["periodNote"] = t["periods"]
    if t["time"] and not e["time"]:
        e["time"] = t["time"]
    for r in t["rooms"]:
        if r not in e["rooms"]:
            e["rooms"].append(r)


def match_legend(legend, course):
    n = norm(course)
    if not n:
        return None
    if n in legend:
        return legend[n]
    # tolerate trailing-character variants, e.g. 微生物与免疫学 vs 微生物与免疫,
    # or a dropped 喉 as in 中医耳鼻科学 vs 中医耳鼻喉科学
    for name, v in legend.items():
        if n.startswith(name) or name.startswith(n):
            return v
        if n.replace("喉", "") == name.replace("喉", ""):
            return v
    for name, v in legend.items():
        if len(n) >= 3 and len(name) >= 3 and (n in name or name in n):
            return v
    return None


def build_plan_kind_map(plans):
    """course name -> {kind, credits}, from all curated plans (fallback for
    courses that the sheet legend / catalog do not cover)"""
    m = {}
    for y in plans.values():
        for yr in y.get("years", []):
            for sem in yr.get("semesters", []):
                for c in sem.get("courses", []):
                    m.setdefault(norm(c["name"]), {"kind": c["kind"], "credits": c.get("credits")})
    return m


def join_catalog(catalog_by_name, e, day):
    """find the catalog section + schedule part matching this grid entry"""
    n = norm(e["course"])
    if not n or e["jianxi"]:
        return None, None
    cands = []
    for name, secs in catalog_by_name.items():
        if name == n or (len(n) >= 3 and (n.startswith(name) or name.startswith(n))):
            cands.extend(secs)
    if not cands:
        return None, None
    if e["teachers"]:
        tset = set(e["teachers"])
        pref = [s for s in cands if tset & set(re.split(r"[、,，/]", s["teacher"]))]
        if pref:
            cands = pref
    # single candidate: use only if its schedule covers this weekday
    if len(cands) == 1:
        parts = [p for p in cands[0]["parts"] if p["day"] == day]
        return (cands[0], parts[0]) if parts else (None, None)
    # multiple: pick one whose schedule matches the entry's weeks/periods best
    best, best_part, best_score = None, None, -1
    for s in cands:
        for p in s["parts"]:
            if p["day"] != day:
                continue
            score = 0
            if e["weeks"] and p["weekFrom"] is not None:
                if (p["weekFrom"], p["weekTo"]) in [(a, b) for a, b in e["weeks"]]:
                    score += 2
                elif e["weeks"] and p["weekFrom"] == min(w[0] for w in e["weeks"]):
                    score += 1
            if p["parity"] and p["parity"] == e["parity"]:
                score += 1
            if e["periodNote"] and p["periods"]:
                if (p["periods"][0], p["periods"][-1]) == e["periodNote"]:
                    score += 2
            if score > best_score:
                best, best_part, best_score = s, p, score
    if best is None:
        return None, None
    parts = [p for p in best["parts"] if p["day"] == day]
    return best, (parts[0] if parts else None)


# ---------------------------------------------------------------- assembly

PROGRAMS = {"中医": ("中医", "TCM"), "针推": ("针推", "Acupuncture & Tuina"),
            "预科": ("中医预科", "Preparatory")}


def group_meta(sheet_name, title):
    m = re.match(r"(\d{2})(中医|针推|中医预科)?-?(\d+)?$", sheet_name)
    year = 2000 + int(m.group(1))
    prog = m.group(2) or "中医"
    grp = m.group(3)
    if "预科" in prog:
        prog_key, label, label_en = "预科", "中医预科班", "TCM Preparatory"
        grp = None
    else:
        cn, en = PROGRAMS[prog]
        prog_key = prog
        label, label_en = cn, en
    return {
        "id": sheet_name,
        "intake": year,
        "program": prog_key,
        "programLabel": label,
        "programEn": label_en,
        "group": grp,
        "title": title,
    }


def main():
    calendar = json.loads((DATA / "calendar.json").read_text(encoding="utf-8"))
    plans = json.loads((DATA / "plans.json").read_text(encoding="utf-8"))
    catalog = load_catalog()
    catalog_by_name = {}
    for s in catalog:
        catalog_by_name.setdefault(norm(s["name"]), []).append(s)

    wb = xlrd.open_workbook(str(TIMETABLE_XLS))
    plan_kinds = build_plan_kind_map(plans)
    groups = []
    for name in wb.sheet_names():
        g = parse_sheet(wb, name, catalog_by_name, plan_kinds)
        meta = group_meta(name, g["title"])
        meta["entries"] = g["entries"]
        meta["legend"] = g["legend"]
        groups.append(meta)
        kinds = {}
        for e in g["entries"]:
            kinds[e["kind"] or "?"] = kinds.get(e["kind"] or "?", 0) + 1
        no_kind = [e["course"] for e in g["entries"] if not e["kind"]]
        no_room = [e["course"] for e in g["entries"] if not e["rooms"] and not e["jianxi"]]
        print(f"[{name}] entries={len(g['entries'])} kinds={kicks_str(kinds)} "
              f"noKind={no_kind} noRoom={no_room}")

    # per-group elective catalogue info (used by planner) and cohort section ids
    for g in groups:
        ids = sorted({e["sectionId"] for e in g["entries"] if e.get("sectionId")})
        names = {norm(e["course"]) for e in g["entries"]}
        for n, secs in catalog_by_name.items():
            if n in names:
                ids.extend(s["id"] for s in secs)
        g["cohortSectionIds"] = sorted(set(ids))

    data = {
        "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "semester": {
            "label": "2026-2027学年 第一学期",
            "labelEn": "Academic Year 2026-2027, Semester 1",
            "start": "2026-09-14",
            "end": "2026-12-27",
            "teachingWeeks": 14,
        },
        "periodTimes": calendar["periodTimes"],
        "calendar": calendar,
        "plans": plans,
        "groups": groups,
        "catalog": catalog,
    }

    PUBLIC.mkdir(exist_ok=True)
    (PUBLIC / "data.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    js = "window.DATA = " + json.dumps(data, ensure_ascii=False) + ";\n"
    (PUBLIC / "data.js").write_text(js, encoding="utf-8")
    print(f"\nwrote public/data.js ({(PUBLIC / 'data.js').stat().st_size // 1024} KB) "
          f"and public/data.json; groups={len(groups)} catalog={len(catalog)}")


def kicks_str(kinds):
    return "/".join(f"{k}:{v}" for k, v in sorted(kinds.items()))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
