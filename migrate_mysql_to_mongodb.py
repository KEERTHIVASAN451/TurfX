# =========================================================
# TurfX - Data Migration: Local XAMPP MySQL -> MongoDB Atlas
# File: migrate_mysql_to_mongodb.py
# =========================================================

import pymysql
import mongoengine as me
from datetime import datetime
import sys

# Connect to MongoDB Atlas
MONGODB_URI = "mongodb+srv://kv0939169_db_user:HOCLrddiK8iliBE5@turfx-booking.o64agpk.mongodb.net/turfx?retryWrites=true&w=majority"
me.connect(host=MONGODB_URI, db="turfx", alias="default", uuidRepresentation="standard")

from models import User, PasswordResetOTP, Turf, TurfSlot, Booking, Payment, Tournament

def migrate_all():
    print("\n=======================================================")
    print("Starting Data Migration: XAMPP MySQL -> MongoDB Atlas")
    print("=======================================================\n")

    mysql_conn = pymysql.connect(
        host="localhost",
        port=3306,
        user="root",
        password="",
        database="turfx",
        cursorclass=pymysql.cursors.DictCursor
    )

    with mysql_conn.cursor() as cur:
        # 1. Inspect all tables
        cur.execute("SHOW TABLES")
        tables = [list(r.values())[0] for r in cur.fetchall()]
        print(f"Found {len(tables)} tables in local MySQL:")
        for t in tables:
            cur.execute(f"SELECT COUNT(*) as c FROM `{t}`")
            c = cur.fetchone()["c"]
            if c > 0:
                print(f"  - {t}: {c} records")

        # 2. Migrate USERS
        print("\n--- Migrating Users ---")
        cur.execute("SELECT * FROM users ORDER BY id ASC")
        mysql_users = cur.fetchall()
        users_migrated = 0
        max_user_id = 0
        for u in mysql_users:
            u_id = int(u["id"])
            if u_id > max_user_id:
                max_user_id = u_id
            name = u.get("full_name") or u.get("name") or "User"
            email = u["email"].strip().lower()

            existing = User.objects(email=email).first()
            if existing:
                existing.name = name
                existing.role_id = int(u.get("role_id", 2))
                existing.phone = u.get("phone")
                existing.password_hash = u["password_hash"]
                existing.profile_image = u.get("profile_image")
                existing.status = u.get("status", "active")
                existing.email_verified = bool(u.get("email_verified", False))
                existing.phone_verified = bool(u.get("phone_verified", False))
                existing.last_login_at = u.get("last_login_at")
                if u.get("created_at"): existing.created_at = u["created_at"]
                if u.get("updated_at"): existing.updated_at = u["updated_at"]
                existing.save()
                print(f"  [Updated] User ID {existing.id}: {existing.email} ({name})")
            else:
                new_u = User(
                    id=u_id,
                    name=name,
                    email=email,
                    role_id=int(u.get("role_id", 2)),
                    phone=u.get("phone"),
                    password_hash=u["password_hash"],
                    profile_image=u.get("profile_image"),
                    status=u.get("status", "active"),
                    email_verified=bool(u.get("email_verified", False)),
                    phone_verified=bool(u.get("phone_verified", False)),
                    last_login_at=u.get("last_login_at"),
                    created_at=u.get("created_at") or datetime.utcnow(),
                    updated_at=u.get("updated_at") or datetime.utcnow()
                )
                new_u.save()
                print(f"  [Created] User ID {u_id}: {email} ({name})")
            users_migrated += 1

        # 3. Migrate PASSWORD_RESET_OTPS
        print("\n--- Migrating Password Reset OTPs ---")
        cur.execute("SELECT * FROM password_reset_otps ORDER BY id ASC")
        mysql_otps = cur.fetchall()
        otps_migrated = 0
        for o in mysql_otps:
            o_id = int(o["id"])
            existing_otp = PasswordResetOTP.objects(id=o_id).first()
            if not existing_otp:
                new_o = PasswordResetOTP(
                    id=o_id,
                    user_id=int(o["user_id"]),
                    otp_hash=o["otp_hash"],
                    purpose=o.get("purpose", "password_reset"),
                    expires_at=o["expires_at"],
                    attempts=int(o.get("attempts", 0)),
                    is_used=bool(o.get("is_used", False)),
                    created_at=o.get("created_at") or datetime.utcnow()
                )
                new_o.save()
                otps_migrated += 1
        print(f"Migrated {otps_migrated} password reset OTP records.")

        # 4. Check & Migrate TURFS if any
        if "turfs" in tables:
            cur.execute("SELECT * FROM turfs ORDER BY id ASC")
            turfs = cur.fetchall()
            for t in turfs:
                t_id = int(t["id"])
                if not Turf.objects(id=t_id).first():
                    Turf(
                        id=t_id,
                        owner_id=int(t["owner_id"]),
                        name=t["name"],
                        description=t.get("description"),
                        address=t["address"],
                        city=t["city"],
                        state=t.get("state"),
                        pincode=t.get("pincode"),
                        contact_phone=t.get("contact_phone"),
                        contact_email=t.get("contact_email"),
                        base_price=float(t.get("base_price", 0)),
                        image=t.get("image"),
                        status=t.get("status", "active")
                    ).save()
                    print(f"  [Created] Turf ID {t_id}: {t['name']}")

        # 5. Check & Migrate TURF_SLOTS if any
        if "turf_slots" in tables:
            cur.execute("SELECT * FROM turf_slots ORDER BY id ASC")
            slots = cur.fetchall()
            for s in slots:
                s_id = int(s["id"])
                if not TurfSlot.objects(id=s_id).first():
                    TurfSlot(
                        id=s_id,
                        turf_id=int(s["turf_id"]),
                        slot_date=s["slot_date"],
                        start_time=str(s["start_time"]),
                        end_time=str(s["end_time"]),
                        price=float(s.get("price", 0)),
                        status=s.get("status", "available")
                    ).save()
                    print(f"  [Created] TurfSlot ID {s_id}")

        # 6. Check & Migrate BOOKINGS if any
        if "bookings" in tables:
            cur.execute("SELECT * FROM bookings ORDER BY id ASC")
            bookings = cur.fetchall()
            for b in bookings:
                b_id = int(b["id"])
                if not Booking.objects(id=b_id).first():
                    Booking(
                        id=b_id,
                        booking_code=b["booking_code"],
                        user_id=int(b["user_id"]),
                        turf_id=int(b["turf_id"]),
                        slot_id=int(b["slot_id"]),
                        booking_date=b.get("booking_date"),
                        total_amount=float(b.get("total_amount", 0)),
                        status=b.get("status", "pending")
                    ).save()
                    print(f"  [Created] Booking ID {b_id}: {b['booking_code']}")

        # 7. Check & Migrate TOURNAMENTS if any
        if "tournaments" in tables:
            cur.execute("SELECT * FROM tournaments ORDER BY id ASC")
            tournaments = cur.fetchall()
            for tn in tournaments:
                tn_id = int(tn["id"])
                if not Tournament.objects(id=tn_id).first():
                    Tournament(
                        id=tn_id,
                        created_by=int(tn.get("created_by", 1)),
                        name=tn["name"],
                        description=tn.get("description"),
                        sport=tn.get("sport", "Cricket"),
                        status=tn.get("status", "upcoming")
                    ).save()
                    print(f"  [Created] Tournament ID {tn_id}: {tn['name']}")

    # Sync sequence counters in MongoDB
    from pymongo import MongoClient
    client = MongoClient(MONGODB_URI)
    db_raw = client["turfx"]
    if max_user_id > 0:
        db_raw["mongoengine.counters"].update_one(
            {"_id": "user.id"},
            {"$max": {"next": max_user_id}},
            upsert=True
        )

    print("\n=======================================================")
    print("Migration to MongoDB Atlas completed successfully!")
    print("=======================================================\n")

if __name__ == "__main__":
    migrate_all()
