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

        # Ensure default turfs and slots exist
        try:
            from models import Turf, TurfSlot
            from datetime import date, timedelta

            turfs_catalog = [
                {"id": 1, "name": "TurfX Arena", "address": "12, 2nd Avenue, Anna Nagar", "city": "Chennai", "base_price": 800.0, "owner_id": 1, "status": "active"},
                {"id": 2, "name": "Champions Turf", "address": "45, GST Road, Tambaram", "city": "Tambaram", "base_price": 700.0, "owner_id": 1, "status": "active"},
                {"id": 3, "name": "City Sports Arena", "address": "88, Bypass Road, Velachery", "city": "Velachery", "base_price": 900.0, "owner_id": 1, "status": "active"},
                {"id": 4, "name": "Super Strikers Ground", "address": "15, Usman Road, T Nagar", "city": "Chennai", "base_price": 750.0, "owner_id": 1, "status": "active"},
                {"id": 5, "name": "Elite Cricket Club", "address": "102, 100 Feet Road, Velachery", "city": "Velachery", "base_price": 1200.0, "owner_id": 1, "status": "active"},
                {"id": 6, "name": "KickOff Arena", "address": "34, Mudichur Road, Tambaram", "city": "Tambaram", "base_price": 850.0, "owner_id": 1, "status": "active"},
            ]
            for t_data in turfs_catalog:
                if not Turf.objects(id=t_data["id"]).first():
                    Turf(**t_data).save()
                    print(f"Created Turf {t_data['id']}: {t_data['name']}")

            today = date.today()
            default_slots = [
                ("06:00 AM", "07:00 AM", 500.0),
                ("07:00 AM", "08:00 AM", 500.0),
                ("08:00 AM", "09:00 AM", 600.0),
                ("09:00 AM", "10:00 AM", 700.0),
                ("05:00 PM", "06:00 PM", 1000.0),
                ("06:00 PM", "07:00 PM", 1000.0),
                ("07:00 PM", "08:00 PM", 1200.0),
                ("09:00 PM", "10:00 PM", 1200.0),
                ("10:00 PM", "11:00 PM", 900.0),
            ]
            for day_offset in range(14):
                slot_date = today + timedelta(days=day_offset)
                for t_data in turfs_catalog:
                    t_id = t_data["id"]
                    for s_start, s_end, s_price in default_slots:
                        if not TurfSlot.objects(turf_id=t_id, slot_date=slot_date, start_time=s_start).first():
                            TurfSlot(
                                turf_id=t_id,
                                slot_date=slot_date,
                                start_time=s_start,
                                end_time=s_end,
                                price=s_price,
                                status="available"
                            ).save()
            print("SUCCESS: Default turfs and available slots verified!")
        except Exception as e:
            print(f"Notice: Turf/slot seeding deferred: {e}")

    print("\n==========================================")
    print(" MongoDB Atlas setup completed!          ")
    print("==========================================\n")
    return True


if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
