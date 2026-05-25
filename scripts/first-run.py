#!/usr/bin/env python3
"""Prepare local first-run files for Nero Network Office Page."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = (
    (ROOT / ".env.example", ROOT / ".env"),
    (ROOT / "shared" / "hosting-credentials.local.example", ROOT / "shared" / "hosting-credentials.local"),
)


def copy_template(source: Path, target: Path, force: bool) -> str:
    if not source.exists():
        return f"FAIL {source.relative_to(ROOT)}: template not found"
    if target.exists() and not force:
        return f"SKIP {target.relative_to(ROOT)}: already exists"

    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(source.read_text(encoding="utf-8"), encoding="utf-8")
    return f"OK {target.relative_to(ROOT)}: created from {source.relative_to(ROOT)}"


def run_check(local: bool) -> int:
    command = [sys.executable, str(ROOT / "scripts" / "check-config.py")]
    if local:
        command.append("--local")
    return subprocess.run(command, cwd=ROOT, check=False).returncode


def main() -> int:
    parser = argparse.ArgumentParser(description="Create first-run local config files without printing secrets.")
    parser.add_argument("--force", action="store_true", help="overwrite existing .env and local credentials")
    parser.add_argument("--check", action="store_true", help="run scripts/check-config.py --local after file creation")
    args = parser.parse_args()

    print("Nero Network Office Page first-run setup")
    print(f"root: {ROOT}")
    print()

    for source, target in TEMPLATES:
        print(copy_template(source, target, force=args.force))

    print()
    print("Next steps:")
    print("1. Fill .env or add the same variables to Cursor Cloud Secrets.")
    print("2. Fill shared/hosting-credentials.local only for local runs.")
    print("3. Run: python scripts/check-config.py --local")
    print("4. For live connectivity, run: python scripts/check-config.py --local --network")
    print("Do not commit .env or shared/hosting-credentials.local.")

    if args.check:
        print()
        return run_check(local=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
