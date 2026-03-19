
import pandas as pd
import os
from datetime import datetime
from .database import create_user, add_report, init_db, DB_FILE, get_connection
from .auth import get_password_hash
from .services.ingestion_state import update_progress, set_completed, set_error
import sqlite3

# Path to the CSV file - adjusting to be relative or absolute based on execution context
# Assuming script is run from backend/ directory
CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Transparency dataset.csv")
# Fallback if file is in root
if not os.path.exists(CSV_PATH):
    CSV_PATH = os.path.abspath(os.path.join(os.getcwd(), "..", "Transparency dataset.csv"))

def generate_password(name, dob):
    try:
        first_four = name[:4].lower().replace(" ", "")
        year = dob.split("-")[0]
        return f"{first_four}{year}"
    except:
        return "pass1234"

def ingest_data_from_df(df):
    # Ensure DB is ready with new schema
    init_db()

    print("Starting CPU-intensive processing (Hashing)...")
    
    # Pre-calculate everything in memory using threads
    records = df.to_dict('records')
    total_rows = len(records)
    
    users_to_insert = {} # map username -> user_dict to dedupe
    reports_to_insert = []
    
    import concurrent.futures

    def process_row(row):
        try:
            mobile = str(row['mobile_number'])
            name = row.get('name', 'Unknown')
            dob = row.get('date_of_birth', '2000-01-01')
            
            password_plain = generate_password(name, dob)
            password_hash = get_password_hash(password_plain)
            
            user_data = {
                "username": mobile,
                "password_hash": password_hash,
                "role": "user",
                "full_name": name,
                "mobile_number": mobile,
                "email": row.get('email', ''),
                "aadhaar_number": str(row.get('aadhaar_number_synthetic', '')),
                "age": int(row.get('age', 0)),
                "sex": row.get('sex', 'Other'),
                "date_of_birth": dob
            }
            
            report_data = {
                "category": row.get('category', 'General'),
                "location": row.get('country', 'India'),
                "description": f"Application for {row.get('category')} in {row.get('sector')} sector.",
                # Tags handled later or just stringify here
                "tags": row.get('system_type', ''),
                "sector": row.get('sector', ''),
                "affected_group": row.get('affected_group', ''),
                "appeal_available": row.get('appeal_available', 'No'),
                "status": row.get('decision_outcome', 'Pending'),
                "rejection_reason": row.get('reason_given') if row.get('decision_outcome') == 'Rejected' else None,
                "timestamp": datetime.now().isoformat(),
                # Store username to link later
                "_username": mobile 
            }
            
            return {"success": True, "user": user_data, "report": report_data}
        except Exception as e:
            return {"success": False, "error": str(e)}

    # Phase 1: CPU Work (Password Hashing)
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(process_row, row) for row in records]
        
        processed_count = 0
        for future in concurrent.futures.as_completed(futures):
            processed_count += 1
            if processed_count % 100 == 0:
                 update_progress(processed_count, total_rows, "Processing Data...")
            
            result = future.result()
            if result["success"]:
                u = result["user"]
                r = result["report"]
                
                # key by username to dedupe users
                users_to_insert[u['username']] = u
                reports_to_insert.append(r)

    print(f"Processed {len(reports_to_insert)} records. Starting Database Bulk Insert...")
    update_progress(total_rows, total_rows, "Writing to Database...")

    # Phase 2: DB Work (Bulk Inserts)
    conn = get_connection()
    c = conn.cursor()
    
    try:
        c.execute("BEGIN TRANSACTION")
        
        # 1. UPSERT Users
        user_list = list(users_to_insert.values())
        if user_list:
            # Prepare data tuple for each user
            # Order: username, password_hash, role, full_name, mobile_number, email, aadhaar_number, age, sex, date_of_birth
            user_tuples = [(
                u['username'], u['password_hash'], u['role'], u['full_name'], 
                u['mobile_number'], u['email'], u['aadhaar_number'], 
                u['age'], u['sex'], u['date_of_birth']
            ) for u in user_list]
            
            c.executemany('''
                INSERT INTO users (username, password_hash, role, full_name, mobile_number, email, aadhaar_number, age, sex, date_of_birth)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(username) DO UPDATE SET
                password_hash=excluded.password_hash,
                full_name=excluded.full_name,
                mobile_number=excluded.mobile_number,
                email=excluded.email,
                aadhaar_number=excluded.aadhaar_number,
                age=excluded.age,
                sex=excluded.sex,
                date_of_birth=excluded.date_of_birth
            ''', user_tuples)
            
        # 2. Get User IDs map
        # If we have too many users, this might be heavy, but usually fine for <100k
        c.execute("SELECT username, id FROM users")
        user_map = {row[0]: row[1] for row in c.fetchall()}
        
        # 3. Insert Reports
        # Link reports to user_ids
        final_reports = []
        for r in reports_to_insert:
            uid = user_map.get(r['_username'])
            if uid:
                final_reports.append((
                   r['category'], r['location'], r['description'], r['tags'], 
                   r['timestamp'], r['status'], uid, r['sector'], 
                   r['affected_group'], r['appeal_available'], r['rejection_reason']
                ))
        
        if final_reports:
            c.executemany('''
                INSERT INTO reports (category, location, description, tags, timestamp, status, user_id, sector, affected_group, appeal_available, rejection_reason)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', final_reports)
            
        conn.commit()
        print("Database Commit Complete.")
        
        return {"users_created": len(user_list), "reports_added": len(final_reports)}
        
    except Exception as e:
        conn.rollback()
        print(f"Error during bulk insert: {e}")
        raise e
    finally:
        conn.close()

def ingest_data():
    print(f"Reading CSV from: {CSV_PATH}")
    try:
        df = pd.read_csv(CSV_PATH)
        stats = ingest_data_from_df(df)
        print(f"Ingestion Complete.")
        print(f"Users Created (new): {stats['users_created']}")
        print(f"Reports Added: {stats['reports_added']}")
    except FileNotFoundError:
        print("CSV file not found!")
        return

if __name__ == "__main__":
    ingest_data()
