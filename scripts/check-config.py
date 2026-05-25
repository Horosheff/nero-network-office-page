#!/usr/bin/env python3
"""Check Nero Network Office Page configuration without printing secrets."""

from __future__ import annotations

import argparse
import ftplib
import os
import socket
import subprocess
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LOCAL_CREDENTIALS = ROOT / "shared" / "hosting-credentials.local"
ENV_FILE = ROOT / ".env"

REQUIRED_BASE = (
    "SITE_BRAND",
    "SITE_NICHE",
    "WP_SITE_URL",
    "PUBLIC_SITE_URL",
    "WP_THEME_SLUG",
    "REMOTE_SITE_ROOT",
)

REQUIRED_FTP = ("FTP_HOST", "FTP_USER", "FTP_PASSWORD")
REQUIRED_SSH = ("SSH_HOST", "SSH_USER", "SSH_PASSWORD")
SECRET_NAMES = (
    "CURSOR_API_KEY",
    "FTP_PASSWORD",
    "SSH_PASSWORD",
    "SFTP_PASSWORD",
)


@dataclass
class CheckResult:
    name: str
    ok: bool
    message: str


def parse_env_file(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}

    values: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def load_config(use_local: bool) -> dict[str, str]:
    values = parse_env_file(ENV_FILE)
    if use_local:
        values.update({k: v for k, v in parse_env_file(LOCAL_CREDENTIALS).items() if v})
    values.update({k: v for k, v in os.environ.items() if v})
    return values


def present(value: str | None) -> bool:
    return bool(value and value.strip())


def mask_status(name: str, config: dict[str, str]) -> str:
    if not present(config.get(name)):
        return "empty"
    return "set" if name not in SECRET_NAMES else "set (hidden)"


def check_required(config: dict[str, str], names: tuple[str, ...], title: str) -> CheckResult:
    missing = [name for name in names if not present(config.get(name))]
    if missing:
        return CheckResult(title, False, "missing: " + ", ".join(missing))
    return CheckResult(title, True, "all required variables are set")


def check_secret_files_ignored() -> CheckResult:
    candidates = [".env", "shared/hosting-credentials.local"]
    if not (ROOT / ".git").exists():
        return CheckResult("git ignore", True, "not a git repository, skipped")

    problems: list[str] = []
    for rel in candidates:
        proc = subprocess.run(
            ["git", "check-ignore", "-q", rel],
            cwd=ROOT,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        if proc.returncode != 0:
            problems.append(rel)

    if problems:
        return CheckResult("git ignore", False, "not ignored: " + ", ".join(problems))
    return CheckResult("git ignore", True, ".env and local credentials are ignored")


def check_no_tracked_secret_files() -> CheckResult:
    if not (ROOT / ".git").exists():
        return CheckResult("tracked secrets", True, "not a git repository, skipped")

    proc = subprocess.run(
        ["git", "ls-files"],
        cwd=ROOT,
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    tracked = set(proc.stdout.splitlines())
    forbidden = {".env", "shared/hosting-credentials.local"}
    leaked = sorted(tracked & forbidden)
    if leaked:
        return CheckResult("tracked secrets", False, "tracked forbidden files: " + ", ".join(leaked))
    return CheckResult("tracked secrets", True, "no forbidden secret files tracked")


def check_url(config: dict[str, str]) -> CheckResult:
    url = config.get("WP_SITE_URL") or config.get("PUBLIC_SITE_URL")
    if not present(url):
        return CheckResult("site url", False, "WP_SITE_URL or PUBLIC_SITE_URL is empty")

    try:
        request = urllib.request.Request(url, headers={"User-Agent": "nero-network-office-check/0.2"})
        with urllib.request.urlopen(request, timeout=12) as response:
            status = response.getcode()
    except (urllib.error.URLError, TimeoutError, ValueError) as exc:
        return CheckResult("site url", False, f"request failed: {type(exc).__name__}")

    if 200 <= status < 400:
        return CheckResult("site url", True, f"HTTP {status}")
    return CheckResult("site url", False, f"HTTP {status}")


def check_ftp(config: dict[str, str]) -> CheckResult:
    missing = [name for name in REQUIRED_FTP if not present(config.get(name))]
    if missing:
        return CheckResult("ftp", False, "missing: " + ", ".join(missing))

    host = config["FTP_HOST"]
    port = int(config.get("FTP_PORT") or "21")
    try:
        with ftplib.FTP(timeout=15) as ftp:
            ftp.connect(host, port)
            ftp.login(config["FTP_USER"], config["FTP_PASSWORD"])
            pwd = ftp.pwd()
            theme_path = config.get("REMOTE_WP_THEMES")
            if theme_path:
                try:
                    ftp.cwd(theme_path)
                except ftplib.all_errors:
                    return CheckResult("ftp", False, "connected, but REMOTE_WP_THEMES is not reachable")
            return CheckResult("ftp", True, f"connected, pwd={pwd!r}")
    except ftplib.all_errors as exc:
        return CheckResult("ftp", False, f"connection failed: {type(exc).__name__}")
    except (OSError, ValueError) as exc:
        return CheckResult("ftp", False, f"connection failed: {type(exc).__name__}")


def check_ssh(config: dict[str, str]) -> CheckResult:
    missing = [name for name in REQUIRED_SSH if not present(config.get(name))]
    if missing:
        return CheckResult("ssh", False, "missing: " + ", ".join(missing))

    try:
        import paramiko  # type: ignore[import-not-found]
    except ImportError:
        return CheckResult("ssh", False, "paramiko is not installed")

    host = config["SSH_HOST"]
    port = int(config.get("SSH_PORT") or "22")
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(
            host,
            port=port,
            username=config["SSH_USER"],
            password=config["SSH_PASSWORD"],
            timeout=15,
            banner_timeout=15,
            auth_timeout=15,
        )
        theme = config.get("WP_THEME_SLUG", "")
        root = config.get("REMOTE_SITE_ROOT", "")
        if theme and root:
            cmd = (
                f"cd {shell_quote(root)} && "
                f"test -d wp-content/themes/{shell_quote(theme)} && echo THEME_OK || echo THEME_MISSING"
            )
            _, stdout, stderr = client.exec_command(cmd, timeout=15)
            output = stdout.read().decode("utf-8", errors="replace").strip()
            err = stderr.read().decode("utf-8", errors="replace").strip()
            client.close()
            if "THEME_OK" in output:
                return CheckResult("ssh", True, "connected, theme directory exists")
            if "THEME_MISSING" in output:
                return CheckResult("ssh", False, "connected, but WP_THEME_SLUG directory was not found")
            return CheckResult("ssh", False, "connected, theme check inconclusive" + (f": {err}" if err else ""))
        client.close()
        return CheckResult("ssh", True, "connected")
    except (OSError, socket.timeout, Exception) as exc:
        return CheckResult("ssh", False, f"connection failed: {type(exc).__name__}")


def shell_quote(value: str) -> str:
    return "'" + value.replace("'", "'\"'\"'") + "'"


def print_result(result: CheckResult) -> None:
    mark = "OK" if result.ok else "FAIL"
    print(f"[{mark}] {result.name}: {result.message}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Check Nero Network Office Page configuration.")
    parser.add_argument("--local", action="store_true", help="load shared/hosting-credentials.local in addition to .env")
    parser.add_argument("--network", action="store_true", help="test URL, FTP and SSH connectivity")
    args = parser.parse_args()

    config = load_config(use_local=args.local)

    print("Nero Network Office Page config check")
    print(f"root: {ROOT}")
    print()
    print("Variable status:")
    for name in REQUIRED_BASE + REQUIRED_FTP + REQUIRED_SSH + ("PRIMARY_CTA_URL", "SECONDARY_CTA_URL", "AD_BANNER_URL"):
        print(f"- {name}: {mask_status(name, config)}")
    print()

    results = [
        check_required(config, REQUIRED_BASE, "base config"),
        check_required(config, REQUIRED_FTP, "ftp variables"),
        check_required(config, REQUIRED_SSH, "ssh variables"),
        check_secret_files_ignored(),
        check_no_tracked_secret_files(),
    ]

    if args.network:
        results.extend([check_url(config), check_ftp(config), check_ssh(config)])

    for result in results:
        print_result(result)

    return 0 if all(result.ok for result in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
