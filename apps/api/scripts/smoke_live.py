"""End-to-end check of the core features against the real database and Gemini.

Runs the API in-process and acts as a demo student (login is bypassed only inside
this script by overriding the auth dependency; the deployed app is untouched).
Every write is undone at the end: the temporary course join is removed and
course membership statuses are restored to exactly what they were.

    python scripts/smoke_live.py          # dry run: shows target and actor
    python scripts/smoke_live.py --yes    # run (uses ~4 Gemini text calls)
"""
import argparse
import logging
import sys
from pathlib import Path
from urllib.parse import urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import psycopg  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app import demo_seed  # noqa: E402
from app.config import get_settings  # noqa: E402
from app.deps import get_current_user_id  # noqa: E402
from app.main import app  # noqa: E402
from app.safety import check_intro  # noqa: E402

ACTOR = next(s for s in demo_seed.STUDENTS if s.slug == "maya.patel")
JOIN_CODE = "CS5200"   # a course the actor isn't in
MATCH_CODE = "CS5100"

failures: list[str] = []


class _Recent(logging.Handler):
    """Keeps the API's warnings so a failed check can show the underlying cause."""
    def __init__(self):
        super().__init__(logging.INFO)
        self.lines: list[str] = []

    def emit(self, record):
        self.lines.append(f"{record.levelname} {record.name}: {record.getMessage()}")


_log = _Recent()
logging.getLogger("app").addHandler(_log)
logging.getLogger("app").setLevel(logging.INFO)


def check(cond: bool, label: str, detail: str = "") -> None:
    print(f"  {'PASS' if cond else 'FAIL'}  {label}{f'  ({detail})' if detail else ''}")
    if not cond:
        failures.append(label)
        for line in _log.lines[-3:]:
            print(f"        log: {line}")
    _log.lines.clear()


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--yes", action="store_true")
    args = p.parse_args()
    settings = get_settings()
    print(f"Target DB: {urlsplit(settings.database_url).hostname} | actor: {ACTOR.full_name} (demo)")
    if not args.yes:
        print("Dry run. Re-run with --yes.")
        return 0

    db = psycopg.connect(settings.database_url, autocommit=True)
    ids = dict(db.execute("select code, id::text from public.courses where term = '2026FA'").fetchall())
    snapshot = db.execute("select user_id, status from public.course_members where course_id = %s",
                          (ids[MATCH_CODE],)).fetchall()
    was_member = db.execute("select 1 from public.course_members where user_id = %s and course_id = %s",
                            (ACTOR.id, ids[JOIN_CODE])).fetchone() is not None
    if was_member:
        print(f"Actor is already in {JOIN_CODE}; aborting so nothing real is changed.")
        return 1

    original_admins = settings.admin_emails
    app.dependency_overrides[get_current_user_id] = lambda: ACTOR.id
    try:
        with TestClient(app) as c:
            print("\n1. Profile")
            me = c.get("/me").json()
            check(me.get("profile_complete") and me.get("matchable"), "actor has a complete, matchable profile")

            print("\n2. Course list + join")
            courses = {x["code"]: x for x in c.get("/courses").json()}
            check(len(courses) == 8, "8 courses listed", f"{len(courses)}")
            check(courses[MATCH_CODE]["membership"] == "active", f"actor is active in {MATCH_CODE}")
            r = c.get(f"/courses/{ids[JOIN_CODE]}/matches")
            check(r.status_code == 403, f"matches in {JOIN_CODE} blocked before joining", f"{r.status_code}")
            before = courses[JOIN_CODE]["member_count"]
            r = c.post(f"/courses/{ids[JOIN_CODE]}/join")
            check(r.status_code == 200 and r.json()["joined"] and r.json()["member_count"] == before + 1,
                  f"join {JOIN_CODE}", f"{r.status_code}, members {before}->{r.json().get('member_count')}")
            r2 = c.post(f"/courses/{ids[JOIN_CODE]}/join")
            check(r2.json()["member_count"] == before + 1, "joining again is idempotent")
            r = c.get(f"/courses/{ids[JOIN_CODE]}/matches")
            check(r.status_code == 200, f"matches in {JOIN_CODE} allowed after joining",
                  f"{r.status_code}, {len(r.json()) if r.status_code == 200 else '-'} matches")

            print(f"\n3. Matching in {MATCH_CODE}")
            r = c.get(f"/courses/{ids[MATCH_CODE]}/matches?limit=10")
            matches = r.json()
            check(r.status_code == 200 and len(matches) > 0, "matches returned", f"{len(matches)}")
            sims = [m["similarity"] for m in matches]
            check(sims == sorted(sims, reverse=True), "ranked by similarity")
            check(ACTOR.id not in {m["user_id"] for m in matches}, "actor not matched with themself")
            check(all(s >= settings.match_min_similarity for s in sims), "all above relevance bar")
            check(all("email" not in m for m in matches), "no emails exposed")
            for m in matches:
                print(f"       {m['full_name']:<15} {m['similarity']:.3f}  {m['strength']}")

            print("\n4. Icebreaker")
            top = matches[0]
            r = c.post(f"/courses/{ids[MATCH_CODE]}/matches/{top['user_id']}/icebreaker")
            body = r.json()
            check(r.status_code == 200 and body["status"] == "ok", "draft for top match", f"{r.status_code} {body.get('status')}")
            if body.get("message"):
                check(check_intro(body["message"]).ok, "draft passes safety check")
                check(top["full_name"].split()[0] in body["message"], "draft addresses the classmate by name")
                print(f"       “{body['message']}”")
            non_match = db.execute(
                """select u.id::text from public.users u join public.course_members m on m.user_id = u.id
                    where m.course_id = %s and u.id <> %s and u.id <> all(%s) limit 1""",
                (ids[MATCH_CODE], ACTOR.id, [m["user_id"] for m in matches])).fetchone()
            if non_match:
                r = c.post(f"/courses/{ids[MATCH_CODE]}/matches/{non_match[0]}/icebreaker")
                check(r.status_code == 409, "no draft for a classmate below the bar", f"{r.status_code}")

            print("\n5. Semester end (admin granted in-process only)")
            r = c.post(f"/courses/{ids[MATCH_CODE]}/semester", json={"action": "end"})
            check(r.status_code == 403, "non-admin can't end the semester", f"{r.status_code}")
            settings.admin_emails = ACTOR.email
            r = c.post(f"/courses/{ids[MATCH_CODE]}/semester", json={"action": "end"})
            check(r.status_code == 200 and r.json()["status"] == "alumni", "end semester", f"{r.json()}")
            courses = {x["code"]: x for x in c.get("/courses").json()}
            check(courses[MATCH_CODE]["membership"] == "alumni", "actor is now alumni")
            alumni_matches = c.get(f"/courses/{ids[MATCH_CODE]}/matches?limit=10").json()
            check([m["user_id"] for m in alumni_matches] == [m["user_id"] for m in matches],
                  "alumni still see the same classmates")
            r = c.post(f"/courses/{ids[MATCH_CODE]}/matches/{top['user_id']}/icebreaker")
            body = r.json()
            check(body.get("status") == "ok", "reconnect draft after semester end")
            if body.get("message"):
                print(f"       “{body['message']}”")
            r = c.post(f"/courses/{ids[MATCH_CODE]}/semester", json={"action": "reset"})
            check(r.status_code == 200 and r.json()["status"] == "active", "undo semester end")
    finally:
        settings.admin_emails = original_admins
        app.dependency_overrides.clear()
        print("\nCleanup")
        db.execute("delete from public.course_members where user_id = %s and course_id = %s",
                   (ACTOR.id, ids[JOIN_CODE]))
        for user_id, status in snapshot:
            db.execute("update public.course_members set status = %s where user_id = %s and course_id = %s",
                       (status, user_id, ids[MATCH_CODE]))
        after = db.execute("select user_id, status from public.course_members where course_id = %s",
                           (ids[MATCH_CODE],)).fetchall()
        check(sorted(after) == sorted(snapshot), f"{MATCH_CODE} memberships restored exactly")
        check(db.execute("select 1 from public.course_members where user_id = %s and course_id = %s",
                         (ACTOR.id, ids[JOIN_CODE])).fetchone() is None, f"temporary {JOIN_CODE} join removed")
        db.close()

    print(f"\n{'ALL PASSED' if not failures else f'{len(failures)} FAILED: ' + '; '.join(failures)}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
