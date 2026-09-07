# =========================================================
# TurfX - Database Models (MongoDB Atlas via MongoEngine)
# File: models.py
# =========================================================

from datetime import datetime, date, timezone
import mongoengine as me
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import MongoQueryWrapper


def utc_now():
    """Return timezone-naive UTC datetime."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class QueryDescriptor:
    """Descriptor returning a SQLAlchemy-compatible query wrapper."""
    def __get__(self, instance, owner):
        return MongoQueryWrapper(owner)


# =========================================================
# USER MODEL
# =========================================================

class User(me.Document):
    meta = {
        "collection": "users",
        "indexes": [
            "email",
            "role_id",
            "status",
        ]
    }

    id = me.SequenceField(primary_key=True)
    role_id = me.IntField(required=True, default=2)
    name = me.StringField(required=True, max_length=120)
    email = me.StringField(required=True, unique=True, max_length=150)
    phone = me.StringField(max_length=20)
    password_hash = me.StringField(required=True, max_length=255)
    profile_image = me.StringField(max_length=255)
    status = me.StringField(default="active", max_length=20)
    email_verified = me.BooleanField(default=False)
    phone_verified = me.BooleanField(default=False)
    last_login_at = me.DateTimeField()
    created_at = me.DateTimeField(default=utc_now)
    updated_at = me.DateTimeField(default=utc_now)

    query = QueryDescriptor()

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    @property
    def is_active(self):
        return self.status == "active"

    @property
    def role(self):
        return "admin" if self.role_id == 1 else "user"

    def update_last_login(self):
        self.last_login_at = utc_now()
        self.save()

    def prepare_timestamps(self):
        now = utc_now()
        if not self.created_at:
            self.created_at = now
        self.updated_at = now

    def __repr__(self):
        return f"<User id={self.id} email={self.email}>"


# =========================================================
# PASSWORD RESET OTP MODEL
# =========================================================

class PasswordResetOTP(me.Document):
    meta = {
        "collection": "password_reset_otps",
        "indexes": [
            "user_id",
            "purpose",
            "is_used",
        ]
    }

    id = me.SequenceField(primary_key=True)
    user_id = me.IntField(required=True)
    otp_hash = me.StringField(required=True, max_length=255)
    purpose = me.StringField(default="password_reset", max_length=30)
    expires_at = me.DateTimeField(required=True)
    attempts = me.IntField(default=0)
    is_used = me.BooleanField(default=False)
    created_at = me.DateTimeField(default=utc_now)

    query = QueryDescriptor()

    @property
    def is_active(self):
        if self.is_used:
            return False
        return utc_now() < self.expires_at

    @property
    def is_expired(self):
        return utc_now() >= self.expires_at

    @property
    def attempts_exhausted(self):
        return self.attempts >= 5

    def __repr__(self):
        return f"<PasswordResetOTP id={self.id} user_id={self.user_id}>"


# =========================================================
# TURF MODEL
# =========================================================

class Turf(me.Document):
    meta = {
        "collection": "turfs",
        "indexes": [
            "owner_id",
            "city",
            "status",
        ]
    }

    id = me.SequenceField(primary_key=True)
    owner_id = me.IntField(required=True)
    name = me.StringField(required=True, max_length=150)
    description = me.StringField()
    address = me.StringField(required=True)
    city = me.StringField(required=True, max_length=100)
    state = me.StringField(max_length=100)
    pincode = me.StringField(max_length=10)
    latitude = me.FloatField()
    longitude = me.FloatField()
    contact_phone = me.StringField(max_length=20)
    contact_email = me.StringField(max_length=150)
    opening_time = me.StringField()
    closing_time = me.StringField()
    base_price = me.FloatField(default=0.0)
    image = me.StringField(max_length=255)
    facilities = me.StringField()
    status = me.StringField(default="active", max_length=20)
    created_at = me.DateTimeField(default=utc_now)
    updated_at = me.DateTimeField(default=utc_now)

    query = QueryDescriptor()

    @property
    def is_active(self):
        return self.status == "active"

    def __repr__(self):
        return f"<Turf id={self.id} name={self.name}>"


# =========================================================
# TURF SLOT MODEL
# =========================================================

class TurfSlot(me.Document):
    meta = {
        "collection": "turf_slots",
        "indexes": [
            ("turf_id", "slot_date", "status"),
            "status",
        ]
    }

    id = me.SequenceField(primary_key=True)
    turf_id = me.IntField(required=True)
    slot_date = me.DateField(required=True)
    start_time = me.StringField(required=True)
    end_time = me.StringField(required=True)
    price = me.FloatField(default=0.0)
    status = me.StringField(default="available", max_length=20)
    created_at = me.DateTimeField(default=utc_now)

    query = QueryDescriptor()

    @property
    def is_available(self):
        return self.status == "available"

    @property
    def is_booked(self):
        return self.status == "booked"

    @property
    def is_blocked(self):
        return self.status == "blocked"

    def __repr__(self):
        return f"<TurfSlot id={self.id} turf_id={self.turf_id} time={self.start_time}-{self.end_time}>"


# =========================================================
# BOOKING MODEL
# =========================================================

class Booking(me.Document):
    meta = {
        "collection": "bookings",
        "indexes": [
            "booking_code",
            "user_id",
            "turf_id",
            "slot_id",
            "status",
            "-created_at",
        ]
    }

    id = me.SequenceField(primary_key=True)
    booking_code = me.StringField(unique=True, max_length=30)
    user_id = me.IntField(required=True)
    turf_id = me.IntField(required=True)
    slot_id = me.IntField(required=True)
    booking_date = me.DateField()
    total_amount = me.FloatField(default=0.0)
    status = me.StringField(default="pending", max_length=20)
    notes = me.StringField()
    created_at = me.DateTimeField(default=utc_now)
    updated_at = me.DateTimeField(default=utc_now)

    query = QueryDescriptor()

    @property
    def is_pending(self):
        return self.status == "pending"

    @property
    def is_confirmed(self):
        return self.status == "confirmed"

    @property
    def is_cancelled(self):
        return self.status == "cancelled"

    @property
    def is_completed(self):
        return self.status == "completed"

    def __repr__(self):
        return f"<Booking id={self.id} code={self.booking_code}>"


# =========================================================
# PAYMENT MODEL
# =========================================================

class Payment(me.Document):
    meta = {
        "collection": "payments",
        "indexes": [
            "booking_id",
            "user_id",
            "transaction_id",
            "status",
        ]
    }

    id = me.SequenceField(primary_key=True)
    booking_id = me.IntField(required=True)
    user_id = me.IntField(required=True)
    transaction_id = me.StringField(max_length=100)
    payment_method = me.StringField(max_length=50)
    amount = me.FloatField(default=0.0)
    currency = me.StringField(default="INR", max_length=10)
    status = me.StringField(default="pending", max_length=20)
    payment_gateway = me.StringField(max_length=50)
    gateway_response = me.StringField()
    paid_at = me.DateTimeField()
    created_at = me.DateTimeField(default=utc_now)

    query = QueryDescriptor()

    @property
    def is_success(self):
        return self.status == "success"

    @property
    def is_failed(self):
        return self.status == "failed"

    @property
    def is_refunded(self):
        return self.status == "refunded"

    def __repr__(self):
        return f"<Payment id={self.id} booking_id={self.booking_id} amount={self.amount}>"


# =========================================================
# TOURNAMENT MODEL
# =========================================================

class Tournament(me.Document):
    meta = {
        "collection": "tournaments",
        "indexes": [
            "created_by",
            "status",
            "-created_at",
        ]
    }

    id = me.SequenceField(primary_key=True)
    created_by = me.IntField()
    name = me.StringField(required=True, max_length=150)
    description = me.StringField()
    sport = me.StringField(default="Cricket", max_length=50)
    format = me.StringField(max_length=50)
    location = me.StringField(max_length=150)
    start_date = me.DateField()
    end_date = me.DateField()
    max_teams = me.IntField(default=8)
    entry_fee = me.FloatField(default=0.0)
    prize_amount = me.FloatField(default=0.0)
    status = me.StringField(default="upcoming", max_length=20)
    image = me.StringField(max_length=255)
    created_at = me.DateTimeField(default=utc_now)
    updated_at = me.DateTimeField(default=utc_now)

    query = QueryDescriptor()

    @property
    def is_upcoming(self):
        return self.status == "upcoming"

    @property
    def is_ongoing(self):
        return self.status == "ongoing"

    @property
    def is_completed(self):
        return self.status == "completed"

    def __repr__(self):
        return f"<Tournament id={self.id} name={self.name}>"
