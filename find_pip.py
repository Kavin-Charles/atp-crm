import paramiko
LOCAL_KEY = r'D:\Projects\atp-crm\.claude\worktrees\hungry-feynman-e50d10\gcp_vm_id_rsa'
pkey = paramiko.RSAKey.from_private_key_file(LOCAL_KEY)
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('35.255.224.61', username='kavin', pkey=pkey, timeout=30)

def run(cmd, t=20):
    _, o, e = ssh.exec_command(cmd, timeout=t)
    return (o.read() + e.read()).decode('utf-8', 'replace').strip()

print(run('which python3 && python3 --version'))
print(run('find /usr -name pip* 2>/dev/null | head -5'))
print(run('sudo apt-get install -y python3-pip python3-pandas 2>&1 | tail -5'))

ssh.close()
