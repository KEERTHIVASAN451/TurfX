# =========================================================
# TurfX - Database Initialization & Admin Seeder (MongoDB Atlas)
# File: init_db.py
# =========================================================

import os
import sys
from werkzeug.security import generate_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from app import app, db
from models import User


def init_database():
    """Verifies MongoDB Atlas connectivity and ensures admin account exists."""
    print("\n==========================================")
    print("   TurfX MongoDB Atlas Initialization     ")
    print("==========================================")

    with app.app_context():
        try:
            print("Connecting to MongoDB Atlas...")
            import mongoengine as me
            conn = me.connection.get_connection()
            conn.admin.command("ping")
            print("SUCCESS: MongoDB Atlas connection verified!")
        except Exception as e:
            print(f"ERROR: MongoDB Atlas connection failed: {e}")
            print("\nPlease check your MONGODB_URI environment variable.")
            return False

        try:
            print("Initializing collections and indexes...")
            db.create_all()
            print("SUCCESS: MongoDB collections ready!")
        except Exception as e:
            print(f"ERROR: Collection setup error: {e}")
            return False

        # Ensure default admin user exists
        try:
            admin_email = os.getenv("ADMIN_EMAIL", "admin@turfx.com")
            admin_password = os.getenv("ADMIN_DEFAULT_PASSWORD", "Admin@12345")
            admin_role_id = int(os.getenv("ADMIN_ROLE_ID", "1"))

            admin_user = User.query.filter_by(role_id=admin_role_id).first()
            if not admin_user:
                print(f"Creating initial admin account: {admin_email}")
                hashed_pw = generate_password_hash(admin_password)
                new_admin = User(
                    name="TurfX Admin",
                    email=admin_email,
                    role_id=admin_role_id,
                    status="active",
                    email_verified=True,
                    phone_verified=True,
                    password_hash=hashed_pw
                )
                new_admin.save()
                print(f"SUCCESS: Admin created: {admin_email} (Password: {admin_password})")
            else:
                print(f"Admin account already exists: {admin_user.email}")
        except Exception as e:
            print(f"Notice: Could not seed admin account: {e}")

    print("\n==========================================")
    print(" MongoDB Atlas setup completed!          ")
    print("==========================================\n")
    return True


if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
