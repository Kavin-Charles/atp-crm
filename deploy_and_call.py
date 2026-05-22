import paramiko, time, requests
LOCAL_KEY = r'D:\Projects\atp-crm\.claude\worktrees\hungry-feynman-e50d10\gcp_vm_id_rsa'
pkey = paramiko.RSAKey.from_private_key_file(LOCAL_KEY)
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('35.255.224.61', username='kavin', pkey=pkey, timeout=30)

def run(cmd, timeout=120):
    _, o, e = ssh.exec_command(cmd, timeout=timeout)
    out = o.read().decode('utf-8', 'replace').strip()
    err = e.read().decode('utf-8', 'replace').strip()
    return out, err

APP = '/home/kavin_charles/atp-crm'
print("Pulling...")
out, _ = run(f"sudo -u kavin_charles git -C {APP} fetch origin && sudo -u kavin_charles git -C {APP} reset --hard origin/master 2>&1 | tail -3")
print(out.encode('ascii','replace').decode())

print("Restarting...")
run("sudo fuser -k 3001/tcp 2>/dev/null; sleep 2; true")
run(f"sudo -u kavin_charles sh -c 'cd {APP}/backend && nohup node server.js </dev/null >>/tmp/atp-crm.log 2>&1 &'")
time.sleep(5)
out, _ = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3001")
print("HTTP:", out)

if out == '200':
    print("Calling import-dates endpoint...")
    out, _ = run("curl -s -X POST http://localhost:3001/api/import-dates")
    print(out.encode('ascii','replace').decode())
else:
    out, _ = run("cat /tmp/atp-crm.log | tail -5")
    print("Log:", out.encode('ascii','replace').decode())

ssh.close()
