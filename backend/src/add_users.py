
from .database import create_user, init_db
from .auth import get_password_hash
import os

def main():
    # Ensure DB is initialized
    init_db()

    # Admin Account
    admin_username = "admin"
    admin_password = "adminpassword"
    admin_hash = get_password_hash(admin_password)
    
    if create_user(admin_username, admin_hash, role="admin"):
        print(f"User '{admin_username}' created successfully.")
    else:
        print(f"User '{admin_username}' already exists or failed to create.")

    # Trial User Account
    trial_username = "trial_user"
    trial_password = "trialpassword"
    trial_hash = get_password_hash(trial_password)
    
    if create_user(trial_username, trial_hash, role="user"):
        print(f"User '{trial_username}' created successfully.")
    else:
        print(f"User '{trial_username}' already exists or failed to create.")

if __name__ == "__main__":
    main()
