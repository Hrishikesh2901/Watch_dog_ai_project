import sqlite3
import pandas as pd
from datetime import datetime
import os
import io

# Ensure data directory exists relative to the project root or this file
# Assuming this file is in src/ and data/ is in root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_FILE = os.path.join(DATA_DIR, "reports.db")


# 30 second timeout for concurrent access
DB_TIMEOUT = 30.0

def get_connection():
    """Returns a database connection with standardized settings."""
    conn = sqlite3.connect(DB_FILE, timeout=DB_TIMEOUT)
    return conn

def init_db():
    """Initializes the SQLite database."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        
    conn = get_connection()
    # Enable Write-Ahead Logging for better concurrency
    try:
        conn.execute("PRAGMA journal_mode=WAL;")
    except Exception:
        pass
    c = conn.cursor()
    # Reports table
    c.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT,
            location TEXT,
            description TEXT,
            tags TEXT,
            timestamp DATETIME,
            status TEXT DEFAULT 'Pending',
            rejection_reason TEXT,
            resolution_steps TEXT,
            user_id INTEGER
        )
    ''')
    
    # Users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password_hash TEXT,
            role TEXT DEFAULT 'user'
        )
    ''')
    
    conn.commit()
    
    # Migrations for new columns
    try:
        c.execute('ALTER TABLE reports ADD COLUMN sector TEXT')
    except sqlite3.OperationalError: pass
    try:
        c.execute('ALTER TABLE reports ADD COLUMN affected_group TEXT')
    except sqlite3.OperationalError: pass
    try:
        c.execute('ALTER TABLE reports ADD COLUMN appeal_available TEXT')
    except sqlite3.OperationalError: pass
    
    # User profile fields
    try:
        c.execute('ALTER TABLE users ADD COLUMN full_name TEXT')
    except sqlite3.OperationalError: pass
    try:
        c.execute('ALTER TABLE users ADD COLUMN mobile_number TEXT')
    except sqlite3.OperationalError: pass
    try:
        c.execute('ALTER TABLE users ADD COLUMN email TEXT')
    except sqlite3.OperationalError: pass
    try:
        c.execute('ALTER TABLE users ADD COLUMN aadhaar_number TEXT')
    except sqlite3.OperationalError: pass
    try:
        c.execute('ALTER TABLE users ADD COLUMN age INTEGER')
    except sqlite3.OperationalError: pass
    try:
        c.execute('ALTER TABLE users ADD COLUMN sex TEXT')
    except sqlite3.OperationalError: pass
    try:
        c.execute('ALTER TABLE users ADD COLUMN date_of_birth TEXT')
    except sqlite3.OperationalError: pass

    conn.commit()
    conn.close()

def add_report(category, location, description, tags, user_id=None, sector=None, affected_group=None, appeal_available=None, status='Pending', rejection_reason=None, conn=None):
    """Adds a new report to the database."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        
    should_close = False
    should_close = False
    if conn is None:
        conn = get_connection()
        should_close = True
        
    c = conn.cursor()
    timestamp = datetime.now().isoformat()
    # Tags list to string
    tags_str = ",".join(tags) if isinstance(tags, list) else tags
    
    c.execute('''
        INSERT INTO reports (category, location, description, tags, timestamp, status, user_id, sector, affected_group, appeal_available, rejection_reason)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (category, location, description, tags_str, timestamp, status, user_id, sector, affected_group, appeal_available, rejection_reason))
    
    if should_close:
        conn.commit()
        conn.close()

def get_reports(user_id=None):
    """Fetches reports from the database. Optionally filters by user_id."""
    if not os.path.exists(DB_FILE):
         return pd.DataFrame(columns=["id", "category", "location", "description", "tags", "timestamp", "status", "rejection_reason", "resolution_steps", "user_id"])

    conn = get_connection()
    try:
        query = "SELECT * FROM reports"
        params = ()
        if user_id:
            query += " WHERE user_id = ?"
            params = (user_id,)
            
        df = pd.read_sql_query(query, conn, params=params)
        return df
    except Exception:
        # Return empty dataframe if table doesn't exist or other error
        return pd.DataFrame(columns=["id", "category", "location", "description", "tags", "timestamp", "status", "rejection_reason", "resolution_steps", "user_id"])
    finally:
        conn.close()

def create_user(username, password_hash, role="user", full_name=None, mobile_number=None, email=None, aadhaar_number=None, age=None, sex=None, date_of_birth=None, conn=None):
    should_close = False
    should_close = False
    if conn is None:
        conn = get_connection()
        should_close = True
        
    c = conn.cursor()
    try:
        c.execute('''
            INSERT INTO users (username, password_hash, role, full_name, mobile_number, email, aadhaar_number, age, sex, date_of_birth)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (username, password_hash, role, full_name, mobile_number, email, aadhaar_number, age, sex, date_of_birth))
        if should_close:
            conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        if should_close:
            conn.close()

def get_user_by_username(username):
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = c.fetchone()
    conn.close()
    if user:
        return dict(user)
    return None

def import_csv_to_db(content_bytes):
    """
    Imports a CSV file into the database.
    Expects CSV to have columns: category, location, description, tags (optional)
    """
    try:
        df = pd.read_csv(io.BytesIO(content_bytes))
        
        # Validation
        required_cols = ['category', 'location', 'description']
        if not all(col in df.columns for col in required_cols):
            return {"success": False, "message": f"CSV missing columns: {required_cols}"}
        
        # Fill missing tags
        if 'tags' not in df.columns:
            df['tags'] = ""
        else:
            df['tags'] = df['tags'].fillna("")

        # Add timestamp if missing
        if 'timestamp' not in df.columns:
            df['timestamp'] = datetime.now().isoformat()
            
        # Add default status if missing
        if 'status' not in df.columns:
             df['status'] = 'Pending'

        conn = get_connection()
        # Append to database
        df[['category', 'location', 'description', 'tags', 'timestamp', 'status']].to_sql('reports', conn, if_exists='append', index=False)
        conn.close()
        
        return {"success": True, "count": len(df), "df": df}
    except Exception as e:
        return {"success": False, "message": str(e)}
def update_report_status(report_id, status, rejection_reason=None, resolution_steps=None):
    """Updates the status of a report."""
    if not os.path.exists(DB_FILE):
        return False

    conn = get_connection()
    c = conn.cursor()
    try:
        c.execute('''
            UPDATE reports 
            SET status = ?, rejection_reason = ?, resolution_steps = ?
            WHERE id = ?
        ''', (status, rejection_reason, resolution_steps, report_id))
        conn.commit()
        return c.rowcount > 0
    except Exception:
        return False
    finally:
        conn.close()

def get_analytics_data():
    """Aggregates reports by sector and category."""
    conn = get_connection()
    try:
        df = pd.read_sql_query("SELECT sector, category, status FROM reports", conn)
        
        sector_counts = df['sector'].value_counts().to_dict()
        category_counts = df['category'].value_counts().to_dict()
        status_counts = df['status'].value_counts().to_dict()
        
        return {
            "sector_counts": sector_counts,
            "category_counts": category_counts,
            "status_counts": status_counts
        }
    except Exception:
        return {"sector_counts": {}, "category_counts": {}, "status_counts": {}}
    finally:
        conn.close()

def get_all_users_with_status(limit=50, offset=0, status_filter=None):
    """Fetches users with their latest report status, supporting pagination and filtering."""
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    try:
        # Get latest report for each user using window function (SQLite 3.25+)
        # Or simpler approach: Group by user_id and max timestamp?
        # A reliable way in standard SQL:
        
        where_clause = "WHERE u.role != 'admin'"
        params = []
        
        if status_filter and status_filter != 'All':
            # We need to filter based on the LATEST report status.
            # This is complex to do efficiently in one query without CTEs.
            # Let's use a CTE.
            pass

        query = f'''
            WITH LatestReports AS (
                SELECT r.user_id, r.status, r.rejection_reason, r.timestamp,
                       ROW_NUMBER() OVER(PARTITION BY r.user_id ORDER BY r.timestamp DESC) as rn
                FROM reports r
            )
            SELECT u.id, u.full_name, u.email, u.mobile_number, 
                   lr.status as application_status, lr.rejection_reason, lr.timestamp,
                   COUNT(*) OVER() as total_count
            FROM users u
            LEFT JOIN LatestReports lr ON u.id = lr.user_id AND lr.rn = 1
            {where_clause}
        '''
        
        # Add filtering logic
        if status_filter and status_filter != 'All':
            if status_filter == 'Pending':
                 # Pending could mean "Pending" status OR NULL (No application)?
                 # Usually Pending means specific status.
                 query += " AND (lr.status = ?)"
                 params.append(status_filter)
            else:
                 query += " AND lr.status = ?"
                 params.append(status_filter)
                 
        query += " LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        c.execute(query, params)
        rows = c.fetchall()
        
        users = [dict(row) for row in rows]
        total_count = rows[0]['total_count'] if rows else 0
        
        return {"users": users, "total": total_count}
    except Exception as e:
        print(f"Error fetching users: {e}")
        return {"users": [], "total": 0}
    finally:
        conn.close()

def clear_database_content():
    """Clears all data from users and reports tables, keeping admin account."""
    if not os.path.exists(DB_FILE):
        return
        
    conn = get_connection()
    c = conn.cursor()
    try:
        # Delete all reports
        c.execute("DELETE FROM reports")
        
        # Delete all users who are not 'admin'
        # Check if we have an admin first to be safe, but typically we want to keep the current logged in admin
        c.execute("DELETE FROM users WHERE role != 'admin'")
        
        conn.commit()
    except Exception as e:
        print(f"Error clearing database: {e}")
    finally:
        conn.close()

def clean_duplicate_reports():
    """
    Identifies duplicate reports based on description and location.
    Resolves conflicts by prioritizing 'Approved' > 'Pending' > 'Rejected'.
    Removes duplicates, keeping the best record.
    """
    if not os.path.exists(DB_FILE):
        return {"success": False, "message": "Database not found."}

    conn = get_connection()
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    try:
        # Fetch all reports
        c.execute("SELECT id, status, description, location, timestamp FROM reports")
        rows = c.fetchall()
        reports = [dict(row) for row in rows]
        
        # Group by (description, location)
        grouped = {}
        for r in reports:
            if not r['description'] or not r['location']:
                 continue
                 
            key = (r['description'].strip().lower(), r['location'].strip().lower())
            if key not in grouped:
                grouped[key] = []
            grouped[key].append(r)
            
        deleted_count = 0
        
        for key, group in grouped.items():
            if len(group) > 1:
                # Define priority: lower is better
                def get_priority(status):
                    s = status.lower() if status else ''
                    if s == 'approved': return 1
                    if s == 'pending' or s == 'processing': return 2
                    return 3 # Rejected and others
                
                best_record = group[0]
                # Find best manually to be sure
                for i in range(1, len(group)):
                    curr = group[i]
                    # If current has better priority (lower number)
                    if get_priority(curr['status']) < get_priority(best_record['status']):
                        best_record = curr
                    elif get_priority(curr['status']) == get_priority(best_record['status']):
                        # Tie break: Latest timestamp wins
                        if curr['timestamp'] > best_record['timestamp']:
                             best_record = curr
                
                # Identifiers to delete
                ids_to_delete = [r['id'] for r in group if r['id'] != best_record['id']]
                
                if ids_to_delete:
                    # Construct SQL for 'IN' clause
                    placeholders = ','.join('?' * len(ids_to_delete))
                    c.execute(f"DELETE FROM reports WHERE id IN ({placeholders})", ids_to_delete)
                    deleted_count += len(ids_to_delete)

        conn.commit()
        return {"success": True, "deleted": deleted_count, "message": f"Cleaned {deleted_count} duplicate entries."}

    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        conn.close()
