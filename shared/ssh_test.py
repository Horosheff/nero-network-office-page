import paramiko

from credentials import get_credential, require_credential


HOST = require_credential("SSH_HOST")
PORT = int(get_credential("SSH_PORT", "22") or "22")
USER = require_credential("SSH_USER")
PASSWORD = require_credential("SSH_PASSWORD")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, port=PORT, username=USER, password=PASSWORD)

stdin, stdout, stderr = ssh.exec_command("pwd && ls -la")
print("STDOUT:\n", stdout.read().decode())
print("STDERR:\n", stderr.read().decode())

ssh.close()
