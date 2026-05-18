import paramiko

from credentials import get_credential, require_credential


HOST = require_credential("SSH_HOST")
PORT = int(get_credential("SSH_PORT", "22") or "22")
USER = require_credential("SSH_USER")
PASSWORD = require_credential("SSH_PASSWORD")
REMOTE_SITE_ROOT = require_credential("REMOTE_SITE_ROOT")
WP_CLI_BIN = get_credential("WP_CLI_BIN", "wp")
PHP_BIN = get_credential("PHP_BIN", "")

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASSWORD)

    wp_cli = f"{PHP_BIN} {WP_CLI_BIN}".strip()
    WP_CMD = f"cd {REMOTE_SITE_ROOT} && {wp_cli}"

    cmd = f"{WP_CMD} theme list --status=active"
    stdin, stdout, stderr = ssh.exec_command(cmd)

    print("STDOUT:\n", stdout.read().decode("utf-8", errors="ignore"))
    print("STDERR:\n", stderr.read().decode("utf-8", errors="ignore"))

    ssh.close()
except Exception as e:
    print(f"Error: {e}")
