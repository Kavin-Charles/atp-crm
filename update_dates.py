import os
import pandas as pd
from datetime import datetime
from pymongo import MongoClient

MONGO_URI = os.environ.get("MONGO_URI") or "mongodb+srv://KavinCharles:jaya2005@cluster0.xaxng.mongodb.net/atp_crm"

def parse_date(val):
    if val is None:
        return None
    import pandas as pd
    if pd.isna(val):
        return None
    if isinstance(val, datetime):
        return val
    s = str(val).strip()
    for fmt in ('%m/%d/%Y', '%m/%d/%y', '%Y-%m-%d'):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            pass
    return None

df = pd.read_excel('D:/Projects/atp-crm/JOBLIST2026.xlsx', sheet_name='JOBLIST_2026')
df = df.dropna(subset=['ATP '])
print(f"Rows: {len(df)}, with releaseDate: {df['Release Date'].notna().sum()}, backupDate: {df['Backup date'].notna().sum()}")

client = MongoClient(MONGO_URI)
jobs = client['atp_crm']['jobs']

updated = 0
skipped = 0

for _, row in df.iterrows():
    atp = str(row['ATP ']).strip()
    release = parse_date(row['Release Date'])
    backup = parse_date(row['Backup date'])

    if not release and not backup:
        continue

    update = {}
    if release:
        update['releaseDate'] = release
    if backup:
        update['backupDate'] = backup
    # auto-complete if both set
    if release and backup:
        update['status'] = 'completed'

    r = jobs.update_one({'atpNumber': atp}, {'$set': update})
    if r.matched_count:
        updated += 1
        print(f"  {atp}: release={release.date() if release else '-'} backup={backup.date() if backup else '-'} {'→ completed' if release and backup else ''}")
    else:
        print(f"  NOT FOUND: {atp}")
        skipped += 1

print(f"\nUpdated: {updated}, Not found: {skipped}")
client.close()
