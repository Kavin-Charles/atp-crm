import os
from pymongo import MongoClient
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/atp_crm")
c = MongoClient(MONGO_URI)
r = c['atp_crm']['jobs'].update_many({'status': 'pending'}, {'$set': {'status': 'in progress'}})
print('Migrated:', r.modified_count, 'jobs')
c.close()
