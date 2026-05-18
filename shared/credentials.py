"""Credential loading for local and Cloud Cursor runs.

Real secrets must come from environment variables in Cloud Agents.
For local-only runs, values may be mirrored in hosting-credentials.local,
which is ignored by git.
"""

from __future__ import annotations

import os
from pathlib import Path


LOCAL_CREDENTIALS = Path(__file__).with_name("hosting-credentials.local")


def _read_local_credentials() -> dict[str, str]:
    if not LOCAL_CREDENTIALS.exists():
        return {}

    values: dict[str, str] = {}
    for raw_line in LOCAL_CREDENTIALS.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()
    return values


_LOCAL_VALUES = _read_local_credentials()


def get_credential(name: str, default: str | None = None) -> str | None:
    return os.environ.get(name) or _LOCAL_VALUES.get(name) or default


def require_credential(name: str) -> str:
    value = get_credential(name)
    if not value:
        raise RuntimeError(
            f"Missing required credential {name}. Set it as a Cursor Cloud "
            "secret/env var or in shared/hosting-credentials.local for local runs."
        )
    return value


def public_site_url() -> str:
    return get_credential("PUBLIC_SITE_URL") or require_credential("WP_SITE_URL")
