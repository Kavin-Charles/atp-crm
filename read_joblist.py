import pandas as pd
df = pd.read_excel('D:/Projects/atp-crm/JOBLIST2026.xlsx', sheet_name='JOBLIST_2026')
df = df.dropna(subset=['ATP '])
print('Cols:', list(df.columns))
print('Shape:', df.shape)
# Show key fields
for _, r in df.iterrows():
    atp = str(r['ATP ']).strip()
    owner = str(r['JOB OWNER']).strip() if not pd.isna(r['JOB OWNER']) else ''
    designer = str(r['DESIGNER']).strip() if not pd.isna(r['DESIGNER']) else ''
    feedback = str(r['RAJ FEEDBACK only']).strip() if not pd.isna(r['RAJ FEEDBACK only']) else ''
    qh = str(r[' Quoted Hours']).strip() if not pd.isna(r[' Quoted Hours']) else ''
    wh = str(r['Worked hours']).strip() if not pd.isna(r['Worked hours']) else ''
    status = str(r['STATUS']).strip() if not pd.isna(r['STATUS']) else ''
    exp = r['Expected Date of Completion']
    print(f"{atp} | owner={owner} | designer={designer} | qh={qh} | wh={wh} | status={status} | feedback={feedback[:30]} | exp={exp}")
