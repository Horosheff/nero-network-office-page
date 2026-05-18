import ftplib

from credentials import get_credential, require_credential


HOST = require_credential("FTP_HOST")
PORT = int(get_credential("FTP_PORT", "21") or "21")
USER = require_credential("FTP_USER")
PASSWORD = require_credential("FTP_PASSWORD")
REMOTE_WP_THEMES = get_credential("REMOTE_WP_THEMES", "wp-content/themes")

print("Connecting to FTP to list dirs...")
try:
    ftp = ftplib.FTP()
    ftp.connect(HOST, PORT, timeout=15)
    ftp.login(USER, PASSWORD)
    pwd = ftp.pwd()
    print("Current directory:", pwd)
    print("Listing directories in current:")
    print(ftp.nlst())

    try:
        ftp.cwd(REMOTE_WP_THEMES)
        print("Themes directory exists. Listing:")
        print(ftp.nlst())
    except Exception as e:
        print("Failed to navigate to themes:", e)

    ftp.quit()
except Exception as e:
    print(f"FTP Error: {e}")
