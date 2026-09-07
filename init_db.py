# =========================================================
# TurfX - Database Initialization & Seed Script
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
    """Initializes tables and verifies connection for cloud or local hosting."""
    print("\n==========================================")
    print("      TurfX Database Initialization       ")
    print("==========================================")

    with app.app_context():
        try:
            print("Testing database connection...")
            with db.engine.connect() as conn:
                conn.exec_driver_sql("SELECT 1")
            print("SUCCESS: Database connection verified!")
        except Exception as e:
            print(f"ERROR: Database connection failed: {e}")
            print("\nPlease check your DATABASE_URL or MYSQL_* environment variables.")
            return False

        try:
            print("Creating tables...")
            db.create_all()
            print("SUCCESS: Database tables created!")
        except Exception as e:
            print(f"ERROR: Table creation error: {e}")
            return False

        # Ensure default admin user exists if needed
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
                db.session.add(new_admin)
                db.session.commit()
                print(f"SUCCESS: Admin created: {admin_email} (Password: {admin_password})")
            else:
                print(f"Admin account already exists: {admin_user.email}")
        except Exception as e:
            print(f"Notice: Could not seed admin account: {e}")
            db.session.rollback()

    print("\n==========================================")
    print(" Database setup completed successfully!  ")
    print("==========================================\n")
    return True


if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
