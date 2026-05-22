import paramiko
LOCAL_KEY = r'D:\Projects\atp-crm\.claude\worktrees\hungry-feynman-e50d10\gcp_vm_id_rsa'
pkey = paramiko.RSAKey.from_private_key_file(LOCAL_KEY)
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('35.255.224.61', username='kavin', pkey=pkey, timeout=30)

sftp = ssh.open_sftp()
sftp.put(r'D:\Projects\atp-crm\vm_update.js', '/tmp/vm_update.js')
sftp.close()
print("Uploaded vm_update.js")

_, o, e = ssh.exec_command(
    'sudo cp /tmp/vm_update.js /home/kavin_charles/atp-crm/backend/vm_update.js && cd /home/kavin_charles/atp-crm/backend && node vm_update.js',
    timeout=60
)
out = o.read().decode('utf-8', 'replace').strip()
err = e.read().decode('utf-8', 'replace').strip()
print(out)
if err: print("ERR:", err[:500])
ssh.close()
