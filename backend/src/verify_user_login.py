
import sqlite3
import os
import requests
import pandas as pd

BASE_URL = "http://127.0.0.1:8000"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "..", "data", "reports.db")

def generate_password(name, dob):
    try:
        # Exact logic from ingest_data.py
        first_four = name[:4].lower().replace(" ", "") 
        year = dob.split("-")[0]
        return f"{first_four}{year}"
    except:
        return "pass1234"

def verify_login():
    if not os.path.exists(DB_FILE):
        print("DB File not found")
        return

    conn = sqlite3.connect(DB_FILE, timeout=30.0)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Get a few users
    c.execute("SELECT username, full_name, date_of_birth FROM users WHERE role='user' LIMIT 3")
    users = c.fetchall()
    conn.close()

    if not users:
        print("No users found.")
        return

    for u in users:
        username = u["username"]
        name = u["full_name"]
        dob = u["date_of_birth"]
        
        password = generate_password(name, dob)
        
        print(f"\nUser: {username}")
        print(f"Name (raw): '{name}'")
        print(f"DOB (raw): '{dob}'")
        print(f"Generated Password: '{password}'")
        
        try:
            resp = requests.post(f"{BASE_URL}/api/auth/token", data={
                "username": username,
                "password": password
            })
            
            if resp.status_code == 200:
                print("✅ Login Success")
            else:
                print(f"❌ Login Failed: {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    verify_login()
