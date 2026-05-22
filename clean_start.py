import paramiko, time
LOCAL_KEY = r'D:\Projects\atp-crm\.claude\worktrees\hungry-feynman-e50d10\gcp_vm_id_rsa'
pkey = paramiko.RSAKey.from_private_key_file(LOCAL_KEY)
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('35.255.224.61', username='kavin', pkey=pkey, timeout=30)

APP = '/home/kavin_charles/atp-crm'

def run(cmd, timeout=30):
    _, o, e = ssh.exec_command(cmd, timeout=timeout)
    return (o.read() + e.read()).decode('utf-8','replace').strip().encode('ascii','replace').decode()

# Kill everything node-related on 3001
run("sudo pkill -f 'node server.js' 2>/dev/null; sleep 1; true")
run("sudo fuser -k 3001/tcp 2>/dev/null; sleep 1; true")
run("sudo bash -c 'echo > /tmp/atp-crm.log && chmod 777 /tmp/atp-crm.log'")

# Fresh start
run(f"sudo -u kavin_charles sh -c 'cd {APP}/backend && nohup node server.js </dev/null >>/tmp/atp-crm.log 2>&1 &'")
print("Started, waiting 8s...")
time.sleep(8)

log = run("cat /tmp/atp-crm.log")
print("Log:", log)

http = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3001")
print("HTTP:", http)

if http == '200':
    print("\nImporting job details...")
    import json
    result = run("curl -s -X POST http://localhost:3001/api/import-job-details", timeout=30)
    try:
        d = json.loads(result)
        print(f"Updated: {d['updated']}, Not found: {d['notFound']}")
        not_found = [r['atp'] for r in d['results'] if not r['ok']]
        if not_found: print("Not found:", not_found)
    except:
        print(result[:500])

ssh.close()
