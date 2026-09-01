# =========================================================
# TurfX - Database Models
# File: models.py
# =========================================================

from datetime import (
    datetime,
    timezone
)

from sqlalchemy.dialects.mysql import INTEGER

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from extensions import db


# =========================================================
# UTC DATETIME HELPER
# =========================================================

def utc_now():
    """
    Return timezone-naive UTC datetime.

    MySQL DATETIME fields in this project store UTC
    without timezone information.
    """

    return (
        datetime.now(
            timezone.utc
        ).replace(
            tzinfo=None
        )
    )


# =========================================================
# USER MODEL
# =========================================================

class User(db.Model):

    __tablename__ = "users"


    # -----------------------------------------------------
    # PRIMARY KEY
    # MySQL: INT UNSIGNED
    # -----------------------------------------------------

    id = db.Column(
        INTEGER(unsigned=True),
        primary_key=True
    )


    # -----------------------------------------------------
    # ROLE ID
    # MySQL: INT UNSIGNED
    # -----------------------------------------------------

    role_id = db.Column(
        INTEGER(unsigned=True),
        nullable=False
    )


    # -----------------------------------------------------
    # NAME
    # Python: user.name
    # MySQL: full_name
    # -----------------------------------------------------

    name = db.Column(
        "full_name",
        db.String(120),
        nullable=False
    )


    # -----------------------------------------------------
    # EMAIL
    # -----------------------------------------------------

    email = db.Column(
        db.String(150),
        unique=True,
        nullable=False,
        index=True
    )


    # -----------------------------------------------------
    # PHONE
    # -----------------------------------------------------

    phone = db.Column(
        db.String(20),
        unique=True,
        nullable=True
    )


    # -----------------------------------------------------
    # PASSWORD HASH
    # -----------------------------------------------------

    password_hash = db.Column(
        db.String(255),
        nullable=False
    )


    # -----------------------------------------------------
    # PROFILE IMAGE
    # -----------------------------------------------------

    profile_image = db.Column(
        db.String(255),
        nullable=True
    )


    # -----------------------------------------------------
    # ACCOUNT STATUS
    # active / inactive / blocked
    # -----------------------------------------------------

    status = db.Column(
        db.String(20),
        nullable=False,
        default="active"
    )


    # -----------------------------------------------------
    # EMAIL VERIFIED
    # -----------------------------------------------------

    email_verified = db.Column(
        db.Boolean,
        nullable=False,
        default=False
    )


    # -----------------------------------------------------
    # PHONE VERIFIED
    # -----------------------------------------------------

    phone_verified = db.Column(
        db.Boolean,
        nullable=False,
        default=False
    )


    # -----------------------------------------------------
    # LAST LOGIN
    # -----------------------------------------------------

    last_login_at = db.Column(
        db.DateTime,
        nullable=True
    )


    # -----------------------------------------------------
    # CREATED AT
    # -----------------------------------------------------

    created_at = db.Column(
        db.DateTime,
        nullable=False
    )


    # -----------------------------------------------------
    # UPDATED AT
    # -----------------------------------------------------

    updated_at = db.Column(
        db.DateTime,
        nullable=False
    )


    # =====================================================
    # SET PASSWORD
    # =====================================================

    def set_password(
        self,
        password
    ):

        self.password_hash = (
            generate_password_hash(
                password
            )
        )


    # =====================================================
    # CHECK PASSWORD
    # =====================================================

    def check_password(
        self,
        password
    ):

        if not self.password_hash:

            return False


        return check_password_hash(
            self.password_hash,
            password
        )


    # =====================================================
    # ACTIVE ACCOUNT CHECK
    # =====================================================

    @property
    def is_active(self):

        return (
            self.status == "active"
        )


    # =====================================================
    # ROLE
    # =====================================================

    @property
    def role(self):

        if self.role_id == 1:

            return "admin"


        return "user"


    # =====================================================
    # LAST LOGIN UPDATE
    # =====================================================

    def update_last_login(self):

        self.last_login_at = (
            utc_now()
        )


    # =====================================================
    # TIMESTAMP PREPARATION
    # =====================================================

    def prepare_timestamps(self):

        now = utc_now()


        if not self.created_at:

            self.created_at = now


        self.updated_at = now


    # =====================================================
    # REPRESENTATION
    # =====================================================

    def __repr__(self):

        return (
            f"<User "
            f"id={self.id} "
            f"email={self.email}>"
        )


# =========================================================
# PASSWORD RESET OTP MODEL
# =========================================================

class PasswordResetOTP(db.Model):

    __tablename__ = "password_reset_otps"


    # -----------------------------------------------------
    # PRIMARY KEY
    # -----------------------------------------------------

    id = db.Column(
        INTEGER(unsigned=True),
        primary_key=True
    )


    # -----------------------------------------------------
    # USER ID
    # FK -> users.id
    # -----------------------------------------------------

    user_id = db.Column(
        INTEGER(unsigned=True),
        db.ForeignKey(
            "users.id",
            ondelete="CASCADE",
            onupdate="CASCADE"
        ),
        nullable=False,
        index=True
    )


    # -----------------------------------------------------
    # HASHED OTP
    # -----------------------------------------------------

    otp_hash = db.Column(
        db.String(255),
        nullable=False
    )


    # -----------------------------------------------------
    # PURPOSE
    # -----------------------------------------------------

    purpose = db.Column(
        db.String(30),
        nullable=False,
        default="password_reset"
    )


    # -----------------------------------------------------
    # OTP EXPIRY
    # -----------------------------------------------------

    expires_at = db.Column(
        db.DateTime,
        nullable=False
    )


    # -----------------------------------------------------
    # VERIFICATION ATTEMPTS
    # -----------------------------------------------------

    attempts = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )


    # -----------------------------------------------------
    # USED STATUS
    # -----------------------------------------------------

    is_used = db.Column(
        db.Boolean,
        nullable=False,
        default=False
    )


    # -----------------------------------------------------
    # CREATED AT
    # -----------------------------------------------------

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=utc_now
    )


    # =====================================================
    # USER RELATIONSHIP
    # =====================================================

    user = db.relationship(
        "User",
        backref=db.backref(
            "password_reset_otps",
            lazy=True
        )
    )


    # =====================================================
    # OTP ACTIVE CHECK
    # =====================================================

    @property
    def is_active(self):

        if self.is_used:

            return False


        return (
            utc_now()
            < self.expires_at
        )


    # =====================================================
    # OTP EXPIRED CHECK
    # =====================================================

    @property
    def is_expired(self):

        return (
            utc_now()
            >= self.expires_at
        )


    # =====================================================
    # OTP ATTEMPT LIMIT
    # =====================================================

    @property
    def attempts_exhausted(self):

        return (
            self.attempts >= 5
        )


    # =====================================================
    # REPRESENTATION
    # =====================================================

    def __repr__(self):

        return (
            f"<PasswordResetOTP "
            f"id={self.id} "
            f"user_id={self.user_id}>"
        )


# =========================================================
# TURF MODEL
# =========================================================

class Turf(db.Model):

    __tablename__ = "turfs"


    # -----------------------------------------------------
    # PRIMARY KEY
    # -----------------------------------------------------

    id = db.Column(
        INTEGER(unsigned=True),
        primary_key=True
    )


    # -----------------------------------------------------
    # OWNER
    # FK -> users.id
    # -----------------------------------------------------

    owner_id = db.Column(
        INTEGER(unsigned=True),
        db.ForeignKey(
            "users.id"
        ),
        nullable=False,
        index=True
    )


    # -----------------------------------------------------
    # BASIC DETAILS
    # -----------------------------------------------------

    name = db.Column(
        db.String(150),
        nullable=False
    )


    description = db.Column(
        db.Text,
        nullable=True
    )


    address = db.Column(
        db.Text,
        nullable=False
    )


    city = db.Column(
        db.String(100),
        nullable=False,
        index=True
    )


    state = db.Column(
        db.String(100),
        nullable=True
    )


    pincode = db.Column(
        db.String(10),
        nullable=True
    )


    # -----------------------------------------------------
    # LOCATION
    # -----------------------------------------------------

    latitude = db.Column(
        db.Numeric(10, 8),
        nullable=True
    )


    longitude = db.Column(
        db.Numeric(11, 8),
        nullable=True
    )


    # -----------------------------------------------------
    # CONTACT
    # -----------------------------------------------------

    contact_phone = db.Column(
        db.String(20),
        nullable=True
    )


    contact_email = db.Column(
        db.String(150),
        nullable=True
    )


    # -----------------------------------------------------
    # OPENING / CLOSING
    # -----------------------------------------------------

    opening_time = db.Column(
        db.Time,
        nullable=False
    )


    closing_time = db.Column(
        db.Time,
        nullable=False
    )


    # -----------------------------------------------------
    # PRICE
    # -----------------------------------------------------

    base_price = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )


    # -----------------------------------------------------
    # IMAGE
    # -----------------------------------------------------

    image = db.Column(
        db.String(255),
        nullable=True
    )


    # -----------------------------------------------------
    # FACILITIES
    # -----------------------------------------------------

    facilities = db.Column(
        db.Text,
        nullable=True
    )


    # -----------------------------------------------------
    # STATUS
    # active / inactive / maintenance
    # -----------------------------------------------------

    status = db.Column(
        db.String(20),
        nullable=False,
        default="active",
        index=True
    )


    # -----------------------------------------------------
    # CREATED / UPDATED
    # -----------------------------------------------------

    created_at = db.Column(
        db.DateTime,
        nullable=False
    )


    updated_at = db.Column(
        db.DateTime,
        nullable=False
    )


    # =====================================================
    # OWNER RELATIONSHIP
    # =====================================================

    owner = db.relationship(
        "User",
        foreign_keys=[owner_id]
    )


    # =====================================================
    # SLOT RELATIONSHIP
    # =====================================================

    slots = db.relationship(
        "TurfSlot",
        back_populates="turf",
        lazy=True
    )


    # =====================================================
    # ACTIVE CHECK
    # =====================================================

    @property
    def is_active(self):

        return (
            self.status == "active"
        )


    # =====================================================
    # REPRESENTATION
    # =====================================================

    def __repr__(self):

        return (
            f"<Turf "
            f"id={self.id} "
            f"name={self.name}>"
        )


# =========================================================
# TURF SLOT MODEL
# =========================================================

class TurfSlot(db.Model):

    __tablename__ = "turf_slots"


    # -----------------------------------------------------
    # PRIMARY KEY
    # -----------------------------------------------------

    id = db.Column(
        INTEGER(unsigned=True),
        primary_key=True
    )


    # -----------------------------------------------------
    # TURF ID
    # FK -> turfs.id
    # -----------------------------------------------------

    turf_id = db.Column(
        INTEGER(unsigned=True),
        db.ForeignKey(
            "turfs.id"
        ),
        nullable=False,
        index=True
    )


    # -----------------------------------------------------
    # SLOT DATE
    # -----------------------------------------------------

    slot_date = db.Column(
        db.Date,
        nullable=False,
        index=True
    )


    # -----------------------------------------------------
    # START / END TIME
    # -----------------------------------------------------

    start_time = db.Column(
        db.Time,
        nullable=False
    )


    end_time = db.Column(
        db.Time,
        nullable=False
    )


    # -----------------------------------------------------
    # SLOT PRICE
    # -----------------------------------------------------

    price = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )


    # -----------------------------------------------------
    # STATUS
    # available / booked / blocked / maintenance
    # -----------------------------------------------------

    status = db.Column(
        db.String(20),
        nullable=False,
        default="available",
        index=True
    )


    # -----------------------------------------------------
    # CREATED AT
    # -----------------------------------------------------

    created_at = db.Column(
        db.DateTime,
        nullable=False
    )


    # =====================================================
    # TURF RELATIONSHIP
    # =====================================================

    turf = db.relationship(
        "Turf",
        back_populates="slots"
    )


    # =====================================================
    # AVAILABILITY CHECK
    # =====================================================

    @property
    def is_available(self):

        return (
            self.status == "available"
        )


    # =====================================================
    # REPRESENTATION
    # =====================================================

    def __repr__(self):

        return (
            f"<TurfSlot "
            f"id={self.id} "
            f"turf_id={self.turf_id} "
            f"date={self.slot_date}>"
        )


# =========================================================
# BOOKING MODEL
# =========================================================

class Booking(db.Model):

    __tablename__ = "bookings"


    # -----------------------------------------------------
    # PRIMARY KEY
    # -----------------------------------------------------

    id = db.Column(
        INTEGER(unsigned=True),
        primary_key=True
    )


    # -----------------------------------------------------
    # UNIQUE BOOKING CODE
    # -----------------------------------------------------

    booking_code = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )


    # -----------------------------------------------------
    # USER
    # FK -> users.id
    # -----------------------------------------------------

    user_id = db.Column(
        INTEGER(unsigned=True),
        db.ForeignKey(
            "users.id"
        ),
        nullable=False,
        index=True
    )


    # -----------------------------------------------------
    # TURF
    # FK -> turfs.id
    # -----------------------------------------------------

    turf_id = db.Column(
        INTEGER(unsigned=True),
        db.ForeignKey(
            "turfs.id"
        ),
        nullable=False,
        index=True
    )


    # -----------------------------------------------------
    # SLOT
    # FK -> turf_slots.id
    # -----------------------------------------------------

    slot_id = db.Column(
        INTEGER(unsigned=True),
        db.ForeignKey(
            "turf_slots.id"
        ),
        nullable=False,
        index=True
    )


    # -----------------------------------------------------
    # BOOKING DATE
    # -----------------------------------------------------

    booking_date = db.Column(
        db.Date,
        nullable=False,
        index=True
    )


    # -----------------------------------------------------
    # TOTAL AMOUNT
    # -----------------------------------------------------

    total_amount = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )


    # -----------------------------------------------------
    # STATUS
    # pending / confirmed / cancelled /
    # completed / refunded
    # -----------------------------------------------------

    status = db.Column(
        db.String(20),
        nullable=False,
        default="pending",
        index=True
    )


    # -----------------------------------------------------
    # NOTES
    # -----------------------------------------------------

    notes = db.Column(
        db.Text,
        nullable=True
    )


    # -----------------------------------------------------
    # CREATED / UPDATED
    # -----------------------------------------------------

    created_at = db.Column(
        db.DateTime,
        nullable=False
    )


    updated_at = db.Column(
        db.DateTime,
        nullable=False
    )


    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    user = db.relationship(
        "User",
        foreign_keys=[user_id]
    )


    turf = db.relationship(
        "Turf",
        foreign_keys=[turf_id]
    )


    slot = db.relationship(
        "TurfSlot",
        foreign_keys=[slot_id]
    )


    # =====================================================
    # STATUS HELPERS
    # =====================================================

    @property
    def is_confirmed(self):

        return (
            self.status == "confirmed"
        )


    @property
    def is_cancelled(self):

        return (
            self.status == "cancelled"
        )


    # =====================================================
    # REPRESENTATION
    # =====================================================

    def __repr__(self):

        return (
            f"<Booking "
            f"id={self.id} "
            f"code={self.booking_code}>"
        )


# =========================================================
# PAYMENT MODEL
# =========================================================

class Payment(db.Model):

    __tablename__ = "payments"


    # -----------------------------------------------------
    # PRIMARY KEY
    # -----------------------------------------------------

    id = db.Column(
        INTEGER(unsigned=True),
        primary_key=True
    )


    # -----------------------------------------------------
    # BOOKING
    # FK -> bookings.id
    # -----------------------------------------------------

    booking_id = db.Column(
        INTEGER(unsigned=True),
        db.ForeignKey(
            "bookings.id"
        ),
        nullable=False,
        index=True
    )


    # -----------------------------------------------------
    # USER
    # FK -> users.id
    # -----------------------------------------------------

    user_id = db.Column(
        INTEGER(unsigned=True),
        db.ForeignKey(
            "users.id"
        ),
        nullable=False,
        index=True
    )


    # -----------------------------------------------------
    # TRANSACTION ID
    # -----------------------------------------------------

    transaction_id = db.Column(
        db.String(150),
        unique=True,
        nullable=True
    )


    # -----------------------------------------------------
    # PAYMENT METHOD
    # cash / upi / card /
    # netbanking / wallet
    # -----------------------------------------------------

    payment_method = db.Column(
        db.String(20),
        nullable=False
    )


    # -----------------------------------------------------
    # AMOUNT
    # -----------------------------------------------------

    amount = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )


    # -----------------------------------------------------
    # CURRENCY
    # -----------------------------------------------------

    currency = db.Column(
        db.String(10),
        nullable=False,
        default="INR"
    )


    # -----------------------------------------------------
    # PAYMENT STATUS
    # pending / success / failed / refunded
    # -----------------------------------------------------

    status = db.Column(
        db.String(20),
        nullable=False,
        default="pending",
        index=True
    )


    # -----------------------------------------------------
    # GATEWAY
    # -----------------------------------------------------

    payment_gateway = db.Column(
        db.String(50),
        nullable=True
    )


    # -----------------------------------------------------
    # GATEWAY RESPONSE
    # -----------------------------------------------------

    gateway_response = db.Column(
        db.Text,
        nullable=True
    )


    # -----------------------------------------------------
    # PAID AT
    # -----------------------------------------------------

    paid_at = db.Column(
        db.DateTime,
        nullable=True
    )


    # -----------------------------------------------------
    # CREATED AT
    # -----------------------------------------------------

    created_at = db.Column(
        db.DateTime,
        nullable=False
    )


    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    booking = db.relationship(
        "Booking",
        foreign_keys=[booking_id]
    )


    user = db.relationship(
        "User",
        foreign_keys=[user_id]
    )


    # =====================================================
    # PAYMENT SUCCESS CHECK
    # =====================================================

    @property
    def is_success(self):

        return (
            self.status == "success"
        )


    # =====================================================
    # PAYMENT FAILED CHECK
    # =====================================================

    @property
    def is_failed(self):

        return (
            self.status == "failed"
        )


    # =====================================================
    # REPRESENTATION
    # =====================================================

    def __repr__(self):

        return (
            f"<Payment "
            f"id={self.id} "
            f"booking_id={self.booking_id} "
            f"status={self.status}>"
        )




    # =========================================================
# TOURNAMENT MODEL
# =========================================================

class Tournament(db.Model):

    __tablename__ = "tournaments"

    # -----------------------------------------------------
    # PRIMARY KEY
    # -----------------------------------------------------

    id = db.Column(
        INTEGER(unsigned=True),
        primary_key=True
    )

    # -----------------------------------------------------
    # CREATED BY
    # FK -> users.id
    # -----------------------------------------------------

    created_by = db.Column(
        INTEGER(unsigned=True),
        db.ForeignKey(
            "users.id"
        ),
        nullable=False,
        index=True
    )

    # -----------------------------------------------------
    # TOURNAMENT NAME
    # -----------------------------------------------------

    name = db.Column(
        db.String(150),
        nullable=False
    )

    # -----------------------------------------------------
    # DESCRIPTION
    # -----------------------------------------------------

    description = db.Column(
        db.Text,
        nullable=True
    )

    # -----------------------------------------------------
    # SPORT
    # -----------------------------------------------------

    sport = db.Column(
        db.String(50),
        nullable=False,
        default="cricket"
    )

    # -----------------------------------------------------
    # FORMAT
    # league / knockout / league_knockout
    # -----------------------------------------------------

    format = db.Column(
        db.String(30),
        nullable=False,
        default="league"
    )

    # -----------------------------------------------------
    # LOCATION
    # -----------------------------------------------------

    location = db.Column(
        db.String(255),
        nullable=True
    )

    # -----------------------------------------------------
    # START DATE
    # -----------------------------------------------------

    start_date = db.Column(
        db.Date,
        nullable=False
    )

    # -----------------------------------------------------
    # END DATE
    # -----------------------------------------------------

    end_date = db.Column(
        db.Date,
        nullable=False
    )

    # -----------------------------------------------------
    # MAX TEAMS
    # -----------------------------------------------------

    max_teams = db.Column(
        db.Integer,
        nullable=False,
        default=8
    )

    # -----------------------------------------------------
    # ENTRY FEE
    # -----------------------------------------------------

    entry_fee = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )

    # -----------------------------------------------------
    # PRIZE
    # -----------------------------------------------------

    prize_amount = db.Column(
        db.Numeric(10, 2),
        nullable=False,
        default=0
    )

    # -----------------------------------------------------
    # STATUS
    # draft / open / ongoing / completed / cancelled
    # -----------------------------------------------------

    status = db.Column(
        db.String(20),
        nullable=False,
        default="draft",
        index=True
    )

    # -----------------------------------------------------
    # IMAGE
    # -----------------------------------------------------

    image = db.Column(
        db.String(255),
        nullable=True
    )

    # -----------------------------------------------------
    # CREATED / UPDATED
    # -----------------------------------------------------

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=utc_now
    )

    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=utc_now
    )

    # =====================================================
    # CREATOR RELATIONSHIP
    # =====================================================

    creator = db.relationship(
        "User",
        foreign_keys=[created_by]
    )

    # =====================================================
    # STATUS HELPERS
    # =====================================================

    @property
    def is_open(self):

        return (
            self.status == "open"
        )

    @property
    def is_ongoing(self):

        return (
            self.status == "ongoing"
        )

    @property
    def is_completed(self):

        return (
            self.status == "completed"
        )

    # =====================================================
    # REPRESENTATION
    # =====================================================

    def __repr__(self):

        return (
            f"<Tournament "
            f"id={self.id} "
            f"name={self.name}>"
        )