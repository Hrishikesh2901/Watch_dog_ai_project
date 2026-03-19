#!/usr/bin/env python3
"""
Script to create an admin user in the database.
This allows access to the admin dashboard.
"""

from .database import init_db, create_user, get_user_by_username
from .auth import get_password_hash

def create_admin_user():
    """Creates an admin user with default credentials."""
    # Initialize database first
    init_db()
    
    # Admin credentials
    username = "admin"
    password = "admin123"
    
    # Check if admin already exists
    existing_admin = get_user_by_username(username)
    if existing_admin:
        print(f"[OK] Admin user '{username}' already exists.")
        print(f"  You can login with username: {username}, password: {password}")
        return
    
    # Create admin user
    password_hash = get_password_hash(password)
    success = create_user(
        username=username,
        password_hash=password_hash,
        role="admin",
        full_name="System Administrator",
        email="admin@example.com"
    )
    
    if success:
        print(f"[SUCCESS] Admin user created successfully!")
        print(f"  Username: {username}")
        print(f"  Password: {password}")
        print(f"\nYou can now login to the admin dashboard at http://localhost:3000")
    else:
        print(f"[ERROR] Failed to create admin user.")


if __name__ == "__main__":
    create_admin_user()
