
import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "..", "data", "reports.db")

def check_users():
    if not os.path.exists(DB_FILE):
        print("DB File does not exist.")
        return

    conn = sqlite3.connect(DB_FILE, timeout=30.0)
    c = conn.cursor()
    try:
        c.execute("SELECT username, role FROM users WHERE role='admin'")
        admins = c.fetchall()
        print(f"Admins found: {admins}")
        
        c.execute("SELECT count(*) FROM users")
        count = c.fetchone()[0]
        print(f"Total users: {count}")

        c.execute("SELECT username, role FROM users LIMIT 5")
        users = c.fetchall()
        print(f"Sample users: {users}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_users()
