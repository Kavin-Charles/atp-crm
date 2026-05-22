import pandas as pd
from datetime import datetime

df = pd.read_excel('D:/Projects/atp-crm/JOBLIST2026.xlsx', sheet_name='JOBLIST_2026')
df = df.dropna(subset=['ATP '])

def parse_date(val):
    if val is None: return None
    try:
        if pd.isna(val): return None
    except: pass
    if isinstance(val, datetime): return val.strftime('%Y-%m-%d')
    s = str(val).strip()
    for fmt in ('%m/%d/%Y', '%m/%d/%y', '%Y-%m-%d'):
        try: return datetime.strptime(s, fmt).strftime('%Y-%m-%d')
        except: pass
    return None

rows = []
for _, row in df.iterrows():
    atp = str(row['ATP ']).strip()
    release = parse_date(row['Release Date'])
    backup = parse_date(row['Backup date'])
    if release or backup:
        rows.append((atp, release, backup))

print(f"// {len(rows)} jobs with dates")
print("const updates = [")
for atp, r, b in rows:
    parts = [f"atp: '{atp}'"]
    if r: parts.append(f"release: '{r}'")
    if b: parts.append(f"backup: '{b}'")
    print("  { " + ", ".join(parts) + " },")
print("];")
print(f"\n// Total: {len(rows)} rows")
