"""Fictional demo classmates for the showcase.

Each gets a real profile embedding (same embedder as real users) so match scores
are meaningful. Users are created directly in auth.users with an unusable email
and a permanent ban, so nobody can ever sign in as one. All flagged is_demo.
"""
import uuid
from dataclasses import dataclass

import psycopg
from psycopg.types.json import Jsonb

from app.embeddings import Embedder, profile_text, to_pgvector

_NAMESPACE = uuid.UUID("6f1c9a52-3b8e-4d71-9a0e-5c2f7d4b8e11")
DEMO_COURSES = ("CS5100", "CS6120")
_BANNED_UNTIL = "2100-01-01T00:00:00Z"  # finite: Supabase Auth can't parse 'infinity'


@dataclass(frozen=True)
class DemoStudent:
    slug: str
    full_name: str
    major: str
    grad_year: int
    interests: str
    goals: str
    courses: tuple[str, ...] = ("CS5100",)

    @property
    def id(self) -> str:
        return str(uuid.uuid5(_NAMESPACE, self.slug))

    @property
    def email(self) -> str:
        return f"demo.{self.slug}@northeastern.edu"


STUDENTS: tuple[DemoStudent, ...] = (
    DemoStudent("maya.patel", "Maya Patel", "MS Computer Science", 2027,
                "Natural language processing, evaluating large language models, contributing to open-source ML libraries",
                "Join an NLP research group and start a study group for CS6120",
                ("CS5100", "CS6120")),
    DemoStudent("daniel.okafor", "Daniel Okafor", "MS Artificial Intelligence", 2027,
                "Reinforcement learning, robotics, building and flying drones",
                "Land a robotics co-op and find a partner for an RL course project"),
    DemoStudent("sofia.ramirez", "Sofia Ramirez", "MS Data Science", 2026,
                "Machine learning for healthcare, clinical data, fairness in medical AI",
                "Find a health-tech co-op and connect with other women in data science"),
    DemoStudent("ethan.liu", "Ethan Liu", "MS Computer Science", 2027,
                "Computer vision, augmented reality, street photography",
                "Build a computer vision portfolio project and form a hackathon team"),
    DemoStudent("priya.raman", "Priya Raman", "MS Computer Science", 2026,
                "Time-series forecasting, fintech, competitive chess",
                "Get a quant or fintech internship and find a mock-interview partner"),
    DemoStudent("jordan.kim", "Jordan Kim", "MS Computer Science (Align)", 2027,
                "AI in education, accessibility, career switch from high school teaching",
                "Find an algorithms study group and a mentor who also switched into tech"),
    DemoStudent("aisha.hassan", "Aisha Hassan", "MS Artificial Intelligence", 2027,
                "AI ethics and policy, language model safety, debate",
                "Co-write a paper on responsible AI and start a reading group on LLM safety",
                ("CS5100", "CS6120")),
    DemoStudent("lucas.moreau", "Lucas Moreau", "MS Computer Science", 2026,
                "Game AI, procedural generation, indie games, composing music",
                "Form a team for a game jam and find a co-founder for an indie game"),
)


async def seed(conn: psycopg.AsyncConnection, embedder: Embedder) -> int:
    """Create or update every demo student. Embeds first, so a Gemini failure writes nothing."""
    vectors = {s.slug: to_pgvector(await embedder.embed(profile_text(s.major, s.interests, s.goals)))
               for s in STUDENTS}

    async with conn.transaction():
        course_ids = dict(await (await conn.execute(
            "select code, id from public.courses where code = any(%s) and term = '2026FA'",
            (list(DEMO_COURSES),))).fetchall())
        missing = set(DEMO_COURSES) - set(course_ids)
        if missing:
            raise RuntimeError(f"Demo courses not found: {sorted(missing)}")

        for s in STUDENTS:
            # Empty-string token columns: Supabase Auth fails to read rows where they're NULL.
            await conn.execute(
                """insert into auth.users
                     (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                      raw_app_meta_data, raw_user_meta_data, banned_until, created_at, updated_at,
                      confirmation_token, recovery_token, email_change_token_new, email_change)
                   values ('00000000-0000-0000-0000-000000000000', %(id)s, 'authenticated', 'authenticated',
                           %(email)s, '', now(), %(app_meta)s, %(user_meta)s, %(banned)s, now(), now(),
                           '', '', '', '')
                   on conflict (id) do update set banned_until = excluded.banned_until""",
                {"id": s.id, "email": s.email, "banned": _BANNED_UNTIL,
                 "app_meta": Jsonb({"provider": "email", "providers": ["email"], "demo": True}),
                 "user_meta": Jsonb({"full_name": s.full_name})},
            )
            await conn.execute(
                """update public.users
                      set full_name = %(full_name)s, major = %(major)s, grad_year = %(grad_year)s,
                          interests = %(interests)s, goals = %(goals)s, is_demo = true,
                          embedding = %(embedding)s::extensions.vector,
                          embedding_model = %(model)s, embedded_at = now()
                    where id = %(id)s""",
                {"id": s.id, "full_name": s.full_name, "major": s.major, "grad_year": s.grad_year,
                 "interests": s.interests, "goals": s.goals, "embedding": vectors[s.slug],
                 "model": embedder.model},
            )
            for code in s.courses:
                await conn.execute(
                    """insert into public.course_members (user_id, course_id)
                       values (%s, %s) on conflict do nothing""",
                    (s.id, course_ids[code]),
                )
    return len(STUDENTS)


async def remove(conn: psycopg.AsyncConnection) -> int:
    """Delete every is_demo user (cascades to profiles and memberships)."""
    async with conn.transaction():
        cur = await conn.execute(
            "delete from auth.users where id in (select id from public.users where is_demo)")
        return cur.rowcount
