import paramiko, time
LOCAL_KEY = r'D:\Projects\atp-crm\.claude\worktrees\hungry-feynman-e50d10\gcp_vm_id_rsa'
pkey = paramiko.RSAKey.from_private_key_file(LOCAL_KEY)
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('35.255.224.61', username='kavin', pkey=pkey, timeout=30)

def run(cmd, timeout=30):
    _, o, e = ssh.exec_command(cmd, timeout=timeout)
    return (o.read() + e.read()).decode('utf-8','replace').strip().encode('ascii','replace').decode()

APP = '/home/kavin_charles/atp-crm'

# Kill all node server.js processes
run("sudo pkill -f 'node server.js' 2>/dev/null; sleep 2; true")
# Clear log
run("sudo bash -c 'echo > /tmp/atp-crm.log && chmod 777 /tmp/atp-crm.log'")

# Start fresh
run(f"sudo -u kavin_charles sh -c 'cd {APP}/backend && nohup node server.js </dev/null >>/tmp/atp-crm.log 2>&1 &'")
print("Started. Waiting 8s...")
time.sleep(8)

print("Log:", run("cat /tmp/atp-crm.log | tail -5"))
http = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3001")
print("HTTP:", http)

if http == '200':
    print("Calling import-dates...")
    result = run("curl -s -X POST http://localhost:3001/api/import-dates", timeout=30)
    print(result)
else:
    print("Full log:")
    print(run("cat /tmp/atp-crm.log"))

ssh.close()
