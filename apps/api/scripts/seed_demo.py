"""Seed or remove demo classmates in the database from DATABASE_URL (apps/api/.env).

    python scripts/seed_demo.py            # dry run: shows target and who would be seeded
    python scripts/seed_demo.py --yes      # seed / update (calls Gemini 8 times)
    python scripts/seed_demo.py --remove --yes
"""
import argparse
import asyncio
import sys
from pathlib import Path
from urllib.parse import urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import psycopg  # noqa: E402

from app import demo_seed  # noqa: E402
from app.config import get_settings  # noqa: E402
from app.embeddings import get_embedder  # noqa: E402


async def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--remove", action="store_true", help="delete all demo users instead of seeding")
    p.add_argument("--yes", action="store_true", help="actually write to the database")
    args = p.parse_args()

    url = get_settings().database_url
    if not url:
        sys.exit("DATABASE_URL is not set")
    print(f"Target database host: {urlsplit(url).hostname}")

    if not args.yes:
        action = "remove all demo users" if args.remove else f"seed {len(demo_seed.STUDENTS)} demo students"
        print(f"Dry run. Would {action}:")
        for s in demo_seed.STUDENTS:
            print(f"  {s.full_name:<15} {', '.join(s.courses)}")
        print("Re-run with --yes to apply.")
        return

    async with await psycopg.AsyncConnection.connect(url) as conn:
        if args.remove:
            print(f"Removed {await demo_seed.remove(conn)} demo users.")
        else:
            print(f"Seeded {await demo_seed.seed(conn, get_embedder())} demo students.")


if __name__ == "__main__":
    asyncio.run(main())
