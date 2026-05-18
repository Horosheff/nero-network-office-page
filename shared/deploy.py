import argparse
import ftplib
import shlex
import sys
from pathlib import Path

import paramiko

from credentials import get_credential, require_credential


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Deploy a Nero Network page template safely.")
    parser.add_argument("--slug", required=True)
    parser.add_argument("--title", required=True)
    parser.add_argument("--description", required=True)
    parser.add_argument("--local-path", required=True)
    return parser.parse_args()


args = parse_args()

HOST = require_credential("FTP_HOST")
USER = require_credential("FTP_USER")
PASS = require_credential("FTP_PASSWORD")
SSH_HOST = get_credential("SSH_HOST", HOST)
SSH_PORT = int(get_credential("SSH_PORT", "22") or "22")
SSH_USER = require_credential("SSH_USER")
SSH_PASSWORD = require_credential("SSH_PASSWORD")
REMOTE_SITE_ROOT = require_credential("REMOTE_SITE_ROOT")
REMOTE_WP_THEMES = get_credential("REMOTE_WP_THEMES", "wp-content/themes")
WP_CLI_BIN = get_credential("WP_CLI_BIN", "wp")
PHP_BIN = get_credential("PHP_BIN", "")

SLUG = args.slug
TITLE = args.title
DESCRIPTION = args.description
LOCAL_PATH = Path(args.local_path)
REMOTE_PATH = f"/{REMOTE_WP_THEMES.strip('/')}/${WP_THEME_SLUG}/page-{SLUG}.php"

if not LOCAL_PATH.exists():
    print(f"Local template not found: {LOCAL_PATH}")
    sys.exit(1)

print("Uploading via FTP to ${WP_THEME_SLUG}...")
try:
    ftp = ftplib.FTP(HOST, timeout=15)
    ftp.login(USER, PASS)

    with LOCAL_PATH.open("rb") as f:
        ftp.storbinary(f"STOR {REMOTE_PATH}", f)
    ftp.quit()
    print("FTP Upload successful.")
except Exception as e:
    print(f"FTP Error: {e}")
    sys.exit(1)

print("Creating/Updating page via WP-CLI over SSH...")
try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(SSH_HOST, port=SSH_PORT, username=SSH_USER, password=SSH_PASSWORD)

    wp_cli = shlex.quote(WP_CLI_BIN)
    if PHP_BIN:
        wp_cli = f"{shlex.quote(PHP_BIN)} {wp_cli}"
    WP_CMD = f"cd {shlex.quote(REMOTE_SITE_ROOT)} && {wp_cli}"

    check_cmd = f"{WP_CMD} post list --name='{SLUG}' --post_type=page --format=ids"
    stdin, stdout, stderr = ssh.exec_command(check_cmd)

    existing_id = stdout.read().decode("utf-8", errors="ignore").strip()

    quoted_title = shlex.quote(TITLE)
    quoted_slug = shlex.quote(SLUG)
    quoted_excerpt = shlex.quote(DESCRIPTION)
    quoted_template = shlex.quote(f'page-{SLUG}.php')
    
    if existing_id:
        print(f"Page exists (ID: {existing_id}). Updating...")
        cmd = (
            f"{WP_CMD} post update {existing_id} "
            f"--post_title={quoted_title} "
            f"--post_excerpt={quoted_excerpt} "
            f"--page_template={quoted_template} "
            f"--post_status=publish"
        )
    else:
        print("Page does not exist. Creating...")
        cmd = (
            f"{WP_CMD} post create --post_type=page "
            f"--post_title={quoted_title} "
            f"--post_name={quoted_slug} "
            f"--post_excerpt={quoted_excerpt} "
            f"--post_status=publish "
            f"--page_template={quoted_template}"
        )
        
    stdin, stdout, stderr = ssh.exec_command(cmd)

    out = stdout.read().decode("utf-8", errors="ignore")
    err = stderr.read().decode("utf-8", errors="ignore")
    print("STDOUT:\n", out)
    print("STDERR:\n", err)
    
    ssh.close()
except Exception as e:
    print(f"SSH/WP-CLI Error: {e}")
    sys.exit(1)
