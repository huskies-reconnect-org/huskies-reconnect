"""Go / no-go check to run ~10 minutes before presenting. Read-only, no Gemini quota.

    python scripts/predemo_check.py --presenter you@northeastern.edu

Wakes the Render API (free tier sleeps after ~15 idle minutes) and checks the live
site, CORS, the demo data and the presenter's account in the demo course.
"""
import argparse
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import httpx  # noqa: E402
import psycopg  # noqa: E402

from app import demo_seed  # noqa: E402
from app.config import get_settings  # noqa: E402
from app.embeddings import embedding_tag  # noqa: E402

API = "https://huskies-reconnect-api.onrender.com"
WEB = "https://huskies-reconnect.vercel.app"
DEMO_COURSE = "CS5100"

problems: list[str] = []


def check(ok: bool, label: str, fix: str = "") -> None:
    print(f"  {'OK  ' if ok else 'FAIL'}  {label}")
    if not ok:
        problems.append(f"{label}" + (f" -> {fix}" if fix else ""))


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--presenter", help="presenter's NU email (checks their profile and matches)")
    args = p.parse_args()
    s = get_settings()

    print("Services")
    t = time.monotonic()
    try:
        r = httpx.get(f"{API}/health", timeout=120)
        took = time.monotonic() - t
        check(r.status_code == 200, f"Render API awake ({took:.1f}s{', was asleep' if took > 5 else ''})",
              "wait a minute and rerun")
        ready = httpx.get(f"{API}/health/ready", timeout=30).json()
        check(ready.get("status") == "ok", f"API ready: {ready.get('checks')}", "check Render env vars / logs")
    except httpx.HTTPError as e:
        check(False, f"Render API reachable ({type(e).__name__})", "check the Render dashboard")
    try:
        r = httpx.get(f"{WEB}/login", timeout=30)
        check(r.status_code == 200 and "Sign in to Huskies Reconnect" in r.text, "Vercel login page loads")
        r = httpx.options(f"{API}/me", timeout=30, headers={
            "Origin": WEB, "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization"})
        check(r.status_code == 200 and r.headers.get("access-control-allow-origin") == WEB,
              "CORS allows the Vercel site", "Render CORS_ORIGINS must include the Vercel URL")
    except httpx.HTTPError as e:
        check(False, f"Vercel reachable ({type(e).__name__})")

    print("\nDemo data")
    tag = embedding_tag(s.gemini_embed_model)
    with psycopg.connect(s.database_url, connect_timeout=15) as c:
        course_id = c.execute("select id from public.courses where code = %s and term = '2026FA'",
                              (DEMO_COURSE,)).fetchone()[0]
        n, current = c.execute(
            "select count(*), count(*) filter (where embedding_model = %s) from public.users where is_demo",
            (tag,)).fetchone()
        check(n == len(demo_seed.STUDENTS) and current == n, f"{n} demo students, {current} with current embeddings",
              "python scripts/seed_demo.py --yes")
        statuses = dict(c.execute("select status, count(*) from public.course_members where course_id = %s group by 1",
                                  (course_id,)).fetchall())
        check(set(statuses) == {"active"}, f"{DEMO_COURSE} is mid-semester (statuses: {statuses})",
              "a previous run left it ended: press 'Undo semester end' on the course page")

        if not args.presenter:
            print("\nPresenter: skipped (pass --presenter you@northeastern.edu)")
        else:
            print("\nPresenter")
            row = c.execute(
                """select u.id, u.embedding_model, u.interests is not null and u.goals is not null,
                          m.status
                     from public.users u
                     left join public.course_members m on m.user_id = u.id and m.course_id = %s
                    where lower(u.email) = lower(%s)""", (course_id, args.presenter)).fetchone()
            check(row is not None, "presenter account exists", "sign in once on the live site")
            if row:
                uid, model, has_profile, status = row
                check(has_profile, "presenter profile has interests and goals", "fill in /profile")
                check(model == tag, "presenter embedding is current", "re-save /profile")
                check(status is not None, f"presenter is in {DEMO_COURSE}", f"join {DEMO_COURSE} on /courses")
                n_matches = c.execute(
                    """select count(*) from public.course_members m join public.users u on u.id = m.user_id,
                              public.users me
                        where me.id = %(me)s and m.course_id = %(course)s and u.id <> me.id
                          and m.status = %(status)s and u.embedding_model = me.embedding_model
                          and 1 - (u.embedding OPERATOR(extensions.<=>) me.embedding) >= %(min)s""",
                    {"me": uid, "course": course_id, "status": status or "active",
                     "min": s.match_min_similarity}).fetchone()[0]
                check(n_matches >= 2, f"presenter has {n_matches} matches in {DEMO_COURSE} (want 2+)",
                      "make interests/goals more specific to AI/ML topics in /profile")

    print("\nReminders: Gemini free tier = 15 drafts/min for the whole app; don't spam Regenerate.")
    print(f"\n{'GO' if not problems else 'NO-GO'}")
    for prob in problems:
        print(f"  - {prob}")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
