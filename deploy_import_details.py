import paramiko, time
LOCAL_KEY = r'D:\Projects\atp-crm\.claude\worktrees\hungry-feynman-e50d10\gcp_vm_id_rsa'
pkey = paramiko.RSAKey.from_private_key_file(LOCAL_KEY)
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('35.255.224.61', username='kavin', pkey=pkey, timeout=30)

APP = '/home/kavin_charles/atp-crm'

def run(cmd, timeout=60):
    _, o, e = ssh.exec_command(cmd, timeout=timeout)
    return (o.read() + e.read()).decode('utf-8','replace').strip().encode('ascii','replace').decode()

print("Pulling...")
print(run(f"sudo -u kavin_charles git -C {APP} fetch origin && sudo -u kavin_charles git -C {APP} reset --hard origin/master 2>&1 | tail -2"))

print("Restarting...")
run("sudo pkill -f 'node server.js' 2>/dev/null; sleep 2; true")
run(f"sudo -u kavin_charles sh -c 'cd {APP}/backend && nohup node server.js </dev/null >>/tmp/atp-crm.log 2>&1 &'")
time.sleep(7)

http = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3001")
print("HTTP:", http)

if http == '200':
    print("Running import-job-details...")
    result = run("curl -s -X POST http://localhost:3001/api/import-job-details", timeout=30)
    import json
    try:
        d = json.loads(result)
        print(f"Updated: {d['updated']}, Not found: {d['notFound']}")
        if d['notFound']:
            print("Not found:", [r['atp'] for r in d['results'] if not r['ok']])
    except:
        print(result[:500])
else:
    print("Log:", run("cat /tmp/atp-crm.log | tail -8"))

ssh.close()
