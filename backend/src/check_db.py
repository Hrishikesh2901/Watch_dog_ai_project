
import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "..", "data", "reports.db")

def check_schema():
    print(f"Checking DB: {DB_FILE}")
    if not os.path.exists(DB_FILE):
        print("DB File does not exist.")
        return

    conn = sqlite3.connect(DB_FILE, timeout=30.0)
    c = conn.cursor()
    try:
        c.execute("PRAGMA table_info(reports)")
        columns = c.fetchall()
        print("Reports Columns:")
        for col in columns:
            print(col)
            
        c.execute("PRAGMA table_info(users)")
        columns = c.fetchall()
        print("\nUsers Columns:")
        for col in columns:
            print(col)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_schema()
