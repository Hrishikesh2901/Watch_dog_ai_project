
import sqlite3
import os
from src.auth import verify_password, get_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "..", "data", "reports.db")

def debug_auth():
    conn = sqlite3.connect(DB_FILE, timeout=30.0)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Get Vihaan Patel
    c.execute("SELECT username, password_hash FROM users WHERE username='9014788113'")
    user = c.fetchone()
    conn.close()

    if not user:
        print("User not found")
        return

    stored_hash = user['password_hash']
    candidates = ["viha1970", "Viha1970", "Vihaan1970", "vihaan1970", "pass1234"]
    
    for pwd in candidates:
        is_valid = verify_password(pwd, stored_hash)
        print(f"Password '{pwd}': {is_valid}")

    # Test generation
    new_hash = get_password_hash(plain_password)
    print(f"New Hash: {new_hash}")
    print(f"Verify New Hash: {verify_password(plain_password, new_hash)}")

if __name__ == "__main__":
    debug_auth()
