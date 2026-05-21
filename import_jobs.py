import re
import os
import sys
from datetime import datetime
import pandas as pd
from pymongo import MongoClient

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/atp_crm")

def parse_hours(val):
    if pd.isna(val):
        return None
    s = str(val)
    m = re.search(r'\d+\.?\d*', s)
    return m.group(0) if m else None

def parse_date(val):
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

def parse_status_date(status_str):
    if pd.isna(status_str):
        return None
    m = re.search(r'(\d{2}/\d{2}/\d{2,4})', str(status_str))
    if not m:
        return None
    s = m.group(1)
    for fmt in ('%m/%d/%y', '%m/%d/%Y'):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            pass
    return None

def next_atp_number(jobs_col, year=26):
    prefix = f"ATP-{year:02d}-"
    existing = jobs_col.find({"atpNumber": {"$regex": f"^{prefix}"}}, {"atpNumber": 1})
    nums = []
    for doc in existing:
        m = re.search(r'ATP-\d{2}-(\d+)', doc.get("atpNumber", ""))
        if m:
            nums.append(int(m.group(1)))
    return (max(nums) + 1) if nums else 1

client = MongoClient(MONGO_URI)
db = client["atp_crm"]
jobs_col = db["jobs"]

df = pd.read_excel("JOBLIST2026.xlsx")
df = df.dropna(subset=["CUSTOMER NAME"])
print(f"Rows to import: {len(df)}")

seq = next_atp_number(jobs_col)
print(f"Starting ATP sequence: {seq}")

inserted = 0
skipped = 0

for _, row in df.iterrows():
    client_name = str(row["CUSTOMER NAME"]).strip()
    job_name = str(row["JOB NAME"]).strip() if not pd.isna(row["JOB NAME"]) else ""
    date_val = parse_date(row["DATE"]) if "DATE" in row and not pd.isna(row["DATE"]) else None
    status_str = str(row[" STATUS"]).strip() if not pd.isna(row[" STATUS"]) else ""
    quoted_hours = parse_hours(row["TOTAL QUOTED HOURS"])
    quote_details = str(row["QUOTE DETAILS"]).strip() if not pd.isna(row["QUOTE DETAILS"]) else None

    if date_val is None:
        date_val = parse_status_date(status_str)

    atp_num = f"ATP-26-{seq:03d}"
    seq += 1

    doc = {
        "atpNumber": atp_num,
        "clientName": client_name,
        "company": client_name,
        "jobName": job_name,
        "designer": [],
        "status": "in progress",
        "paymentStatus": "pending",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }
    if quoted_hours:
        doc["quotedHours"] = quoted_hours
    if date_val:
        doc["startedDate"] = date_val
    if quote_details:
        doc["rajFeedback"] = quote_details

    try:
        jobs_col.insert_one(doc)
        inserted += 1
    except Exception as e:
        print(f"  SKIP {atp_num} {client_name}: {e}")
        skipped += 1

print(f"Done. Inserted: {inserted}, Skipped: {skipped}")
client.close()
