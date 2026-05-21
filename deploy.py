"""Deploy atp-crm to GCP VM via SSH."""
import sys
import time
import json
import requests
import paramiko
from io import StringIO

GCP_KEY_FILE = r"C:\Users\kavin\Documents\GCP Service Key.json"
PROJECT = "stone-outpost-472905-f8"
ZONE = "us-west1-b"
INSTANCE = "tracetech-instance"
VM_IP = "35.255.224.61"
VM_USER = "kavin"
LOCAL_KEY = r"D:\Projects\atp-crm\.claude\worktrees\hungry-feynman-e50d10\gcp_vm_id_rsa"

COMMANDS = [
    "export NVM_DIR=\"$HOME/.nvm\" && . \"$NVM_DIR/nvm.sh\" && nvm use 20 > /dev/null 2>&1 && cd /home/kavin/atp-crm && git pull origin main 2>&1 | tail -5",
    "export NVM_DIR=\"$HOME/.nvm\" && . \"$NVM_DIR/nvm.sh\" && nvm use 20 > /dev/null 2>&1 && cd /home/kavin/atp-crm && npm run build 2>&1 | tail -10",
    "fuser -k 3001/tcp 2>/dev/null; sleep 1; true",
    "export NVM_DIR=\"$HOME/.nvm\" && . \"$NVM_DIR/nvm.sh\" && nvm use 20 > /dev/null 2>&1 && cd /home/kavin/atp-crm && nohup npm start </dev/null >/tmp/atp-crm.log 2>&1 & sleep 3 && echo STARTED",
]

def get_access_token():
    with open(GCP_KEY_FILE) as f:
        key = json.load(f)
    import google.oauth2.service_account as sa
    creds = sa.Credentials.from_service_account_info(
        key, scopes=["https://www.googleapis.com/auth/cloud-platform"]
    )
    creds.refresh(requests.Request())
    return creds.token

def inject_pubkey(pubkey_str):
    try:
        token = get_access_token()
    except Exception as e:
        print(f"Token error: {e}")
        return
    url = f"https://compute.googleapis.com/compute/v1/projects/{PROJECT}/zones/{ZONE}/instances/{INSTANCE}"
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(url, headers=headers)
    r.raise_for_status()
    data = r.json()
    meta = data.get("metadata", {})
    items = meta.get("items", [])
    ssh_keys = next((x for x in items if x["key"] == "ssh-keys"), None)
    entry = f"{VM_USER}:{pubkey_str.strip()}"
    if ssh_keys:
        lines = [l for l in ssh_keys["value"].splitlines() if VM_USER not in l]
        lines.append(entry)
        ssh_keys["value"] = "\n".join(lines)
    else:
        items.append({"key": "ssh-keys", "value": entry})
        meta["items"] = items
    patch = {"metadata": {"fingerprint": meta.get("fingerprint", ""), "items": items}}
    url2 = url + "/setMetadata"
    r2 = requests.post(url2, headers=headers, json=patch)
    r2.raise_for_status()
    print("SSH key injected")
    time.sleep(5)

def run_deploy():
    # Load private key
    try:
        pkey = paramiko.RSAKey.from_private_key_file(LOCAL_KEY)
    except Exception:
        # Generate new keypair
        print("Generating new SSH keypair...")
        pkey = paramiko.RSAKey.generate(2048)
        pkey.write_private_key_file(LOCAL_KEY)

    # Get public key string
    pubkey_str = f"ssh-rsa {pkey.get_base64()} deploy"
    inject_pubkey(pubkey_str)

    # Connect
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"Connecting to {VM_IP}...")
    ssh.connect(VM_IP, username=VM_USER, pkey=pkey, timeout=30)
    print("Connected")

    for cmd in COMMANDS:
        print(f"\n$ {cmd[:80]}...")
        stdin, stdout, stderr = ssh.exec_command(cmd, timeout=120)
        out = stdout.read().decode()
        err = stderr.read().decode()
        if out: print(out.strip())
        if err: print("STDERR:", err.strip()[:200])

    ssh.close()
    print("\nDone. Site: http://35.255.224.61")

if __name__ == "__main__":
    run_deploy()
