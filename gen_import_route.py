import pandas as pd
import re
from datetime import datetime

df = pd.read_excel('D:/Projects/atp-crm/JOBLIST2026.xlsx', sheet_name='JOBLIST_2026')
df = df.dropna(subset=['ATP '])

def parse_hours(val):
    if pd.isna(val): return None
    s = str(val).strip()
    if not s: return None
    # "192+60=252" -> 252
    m = re.search(r'=\s*(\d+)', s)
    if m: return m.group(1)
    # "16 + 16 ..." -> sum of all numbers
    nums = re.findall(r'\d+', s)
    if not nums: return None
    # "60-70" -> 60 (first)
    return nums[0]

def parse_designers(val):
    if pd.isna(val): return []
    s = str(val).strip()
    if not s: return []
    parts = re.split(r'[/,]', s)
    return [p.strip() for p in parts if p.strip()]

def parse_date(val):
    if pd.isna(val): return None
    if isinstance(val, datetime): return val.strftime('%Y-%m-%d')
    s = str(val).strip()
    for fmt in ('%m/%d/%Y', '%m/%d/%y', '%Y-%m-%d'):
        try: return datetime.strptime(s, fmt).strftime('%Y-%m-%d')
        except: pass
    return None

def js_str(s):
    if not s: return 'null'
    s = s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ').replace('\r', '')
    return f"'{s}'"

def js_arr(lst):
    if not lst: return '[]'
    items = ', '.join(f"'{x}'" for x in lst)
    return f'[{items}]'

lines = ['const JOBS = [']
for _, r in df.iterrows():
    atp = str(r['ATP ']).strip()
    owner = str(r['JOB OWNER']).strip() if not pd.isna(r['JOB OWNER']) else ''
    designers = parse_designers(r['DESIGNER'])
    feedback = str(r['RAJ FEEDBACK only']).strip() if not pd.isna(r['RAJ FEEDBACK only']) else ''
    remarks = str(r['STATUS']).strip() if not pd.isna(r['STATUS']) else ''  # STATUS = progress remarks
    qh = parse_hours(r[' Quoted Hours'])
    wh = parse_hours(r['Worked hours'])
    exp = parse_date(r['Expected Date of Completion'])

    parts = [f"atp: '{atp}'"]
    if owner: parts.append(f'owner: {js_str(owner)}')
    if designers: parts.append(f'designers: {js_arr(designers)}')
    if feedback: parts.append(f'feedback: {js_str(feedback)}')
    if remarks: parts.append(f'remarks: {js_str(remarks)}')
    if qh: parts.append(f'qh: {js_str(qh)}')
    if wh: parts.append(f'wh: {js_str(wh)}')
    if exp: parts.append(f'exp: {js_str(exp)}')

    lines.append('  { ' + ', '.join(parts) + ' },')

lines.append('];')
print('\n'.join(lines))
