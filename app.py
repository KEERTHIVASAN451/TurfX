# =========================================================
# TurfX - Main Flask Application
# File: app.py
# =========================================================

from datetime import (
    date,
    datetime,
    timezone,
    timedelta
)

from functools import wraps
import os
import secrets

from flask import (
    Flask,
    render_template,
    redirect,
    url_for,
    request,
    flash,
    session
)

from flask_mail import Message

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from config import Config

from extensions import (
    db,
    mail,
    or_
)

from models import (
    User,
    PasswordResetOTP,
    Turf,
    TurfSlot,
    Booking,
    Payment,
    Tournament
)


# =========================================================
# CREATE FLASK APP
# =========================================================

app = Flask(__name__)

app.config.from_object(Config)

db.init_app(app)

mail.init_app(app)


# =========================================================
# ROLE CONFIGURATION
# =========================================================

USER_ROLE_ID = int(
    os.getenv(
        "USER_ROLE_ID",
        "2"
    )
)

ADMIN_ROLE_ID = int(
    os.getenv(
        "ADMIN_ROLE_ID",
        "1"
    )
)


# =========================================================
# DATABASE CONNECTION TEST
# =========================================================

def test_database_connection():

    try:

        import mongoengine as me
        conn = me.connection.get_connection()
        conn.admin.command("ping")

        print(
            "[Success] MongoDB Atlas connected successfully!"
        )

        return True

    except Exception as error:

        print(
            "[Error] MongoDB Atlas connection failed:"
        )

        print(error)

        return False


# =========================================================
# DATABASE INITIALIZATION
# =========================================================

def initialize_database():

    try:

        db.create_all()

        print(
            "[Success] MongoDB collections initialized successfully!"
        )

        return True

    except Exception as error:

        print(
            "[Error] MongoDB initialization failed:"
        )

        print(error)

        return False


# Auto-initialize database safely on startup (e.g., under Gunicorn / Render)
try:
    with app.app_context():
        db.create_all()
except Exception as _startup_err:
    print(f"[Notice] Startup database check: {_startup_err}")


# =========================================================
# EMAIL HELPER
# =========================================================

def send_email(
    recipient,
    subject,
    body
):

    if not recipient:

        print(
            "[Notice] Email skipped: recipient is empty."
        )

        return False

    mail_username = app.config.get(
        "MAIL_USERNAME",
        ""
    )

    if not mail_username:

        print(
            "[Notice] Email skipped: MAIL_USERNAME is not configured."
        )

        return False

    try:

        message = Message(
            subject=subject,
            sender=mail_username,
            recipients=[recipient]
        )

        message.body = body

        mail.send(
            message
        )

        print(
            f"[Success] Email sent successfully to {recipient}"
        )

        return True

    except Exception as error:

        print(
            f"[Error] Email sending failed for {recipient}: {error}"
        )

        return False


# =========================================================
# UTC HELPER
# =========================================================

def utc_now():

    return (
        datetime.now(
            timezone.utc
        ).replace(
            tzinfo=None
        )
    )


# =========================================================
# LOGIN HELPERS
# =========================================================

def is_logged_in():

    return (
        "user_id" in session
    )


def is_admin():

    return (
        session.get("user_role_id")
        == ADMIN_ROLE_ID
    )


# =========================================================
# ACCESS DECORATORS
# =========================================================

def login_required(view_function):
    """Require an authenticated TurfX user."""

    @wraps(view_function)
    def wrapped_view(*args, **kwargs):

        if not is_logged_in():

            flash(
                "Please login first.",
                "error"
            )

            return redirect(
                url_for("login")
            )

        return view_function(*args, **kwargs)

    return wrapped_view


def admin_required(view_function):
    """Require an authenticated TurfX administrator."""

    @wraps(view_function)
    def wrapped_view(*args, **kwargs):

        if not is_logged_in():

            flash(
                "Please login first.",
                "error"
            )

            return redirect(
                url_for("login")
            )

        if not is_admin():

            flash(
                "Admin access required.",
                "error"
            )

            return redirect(
                url_for("user_dashboard")
            )

        return view_function(*args, **kwargs)

    return wrapped_view


# =========================================================
# PASSWORD RESET OTP
# =========================================================

def generate_password_reset_otp():

    return f"{secrets.randbelow(1_000_000):06d}"


def create_password_reset_otp(user_id):

    old_otps = (
        PasswordResetOTP.query
        .filter_by(
            user_id=user_id,
            purpose="password_reset",
            is_used=False
        )
        .all()
    )

    for old_otp in old_otps:

        old_otp.is_used = True

    otp = generate_password_reset_otp()

    now = utc_now()

    otp_record = PasswordResetOTP(

        user_id=user_id,

        otp_hash=generate_password_hash(
            otp
        ),

        purpose="password_reset",

        expires_at=(
            now + timedelta(
                minutes=5
            )
        ),

        attempts=0,

        is_used=False,

        created_at=now

    )

    db.session.add(
        otp_record
    )

    db.session.commit()

    return otp


def get_latest_password_reset_otp(
    user_id
):

    return (
        PasswordResetOTP.query
        .filter_by(
            user_id=user_id,
            purpose="password_reset",
            is_used=False
        )
        .order_by(
            PasswordResetOTP.id.desc()
        )
        .first()
    )


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():

    return render_template(
        "auth/index.html"
    )


# =========================================================
# LOGIN
# =========================================================

@app.route(
    "/login",
    methods=["GET", "POST"]
)
def login():

    if request.method == "POST":

        email = request.form.get(
            "email",
            ""
        ).strip().lower()

        password = request.form.get(
            "password",
            ""
        )

        if not email or not password:

            flash(
                "Please enter email and password.",
                "error"
            )

            return redirect(
                url_for("login")
            )

        try:

            user = User.query.filter_by(
                email=email
            ).first()

        except Exception as error:

            print(
                "Login database error:",
                error
            )

            flash(
                "Unable to access your account right now.",
                "error"
            )

            return redirect(
                url_for("login")
            )

        if user:

            if (
                user.status == "active"
                and user.check_password(password)
            ):

                user.last_login_at = utc_now()

                try:

                    db.session.commit()

                except Exception as error:

                    db.session.rollback()

                    print(
                        "Last login update error:",
                        error
                    )

                session["user_id"] = user.id
                session["user_name"] = user.name
                session["user_email"] = user.email
                session["user_role_id"] = user.role_id

                if user.role_id == ADMIN_ROLE_ID:

                    session["user_role"] = "admin"

                    flash(
                        f"Welcome back, {user.name}!",
                        "success"
                    )

                    return redirect(
                        url_for(
                            "admin_dashboard",
                            welcome="1"
                        )
                    )

                session["user_role"] = "user"

                flash(
                    f"Welcome back, {user.name}!",
                    "success"
                )

                return redirect(
                    url_for(
                        "user_dashboard",
                        welcome="1"
                    )
                )

        flash(
            "Invalid email or password.",
            "error"
        )

    return render_template(
        "auth/login.html"
    )


# =========================================================
# REGISTER
# =========================================================

@app.route(
    "/register",
    methods=["GET", "POST"]
)
def register():

    if request.method == "POST":

        name = request.form.get(
            "name",
            ""
        ).strip()

        email = request.form.get(
            "email",
            ""
        ).strip().lower()

        phone = request.form.get(
            "phone",
            ""
        ).strip()

        password = request.form.get(
            "password",
            ""
        )

        confirm_password = request.form.get(
            "confirm_password",
            ""
        )

        if (
            not name
            or not email
            or not password
        ):

            flash(
                "Please fill all required fields.",
                "error"
            )

            return redirect(
                url_for("register")
            )

        if password != confirm_password:

            flash(
                "Passwords do not match.",
                "error"
            )

            return redirect(
                url_for("register")
            )

        if len(password) < 6:

            flash(
                "Password must contain at least 6 characters.",
                "error"
            )

            return redirect(
                url_for("register")
            )

        try:

            existing_user = User.query.filter_by(
                email=email
            ).first()

        except Exception as error:

            print(
                "Registration lookup error:",
                error
            )

            flash(
                "Unable to check this email right now.",
                "error"
            )

            return redirect(
                url_for("register")
            )

        if existing_user:

            flash(
                "This email is already registered.",
                "error"
            )

            return redirect(
                url_for("register")
            )

        now = utc_now()

        new_user = User(

            name=name,

            email=email,

            phone=phone or None,

            role_id=USER_ROLE_ID,

            status="active",

            email_verified=False,

            phone_verified=False,

            created_at=now,

            updated_at=now

        )

        new_user.set_password(
            password
        )

        try:

            db.session.add(
                new_user
            )

            db.session.commit()

        except Exception as error:

            db.session.rollback()

            print(
                "Registration database error:",
                error
            )

            flash(
                "Unable to create account right now.",
                "error"
            )

            return redirect(
                url_for("register")
            )

        send_email(

            new_user.email,

            "Welcome to TurfX 🏏",

            f"""
Hi {new_user.name},

Thank you for registering with TurfX.

Your account has been created successfully.

You can now login and start your TurfX journey.

Find a turf.
Build your team.
Join tournaments.
Play well. Compete hard. Win bigger. 🏏

Regards,
TurfX Team
"""

        )

        admin_email = app.config.get(
            "ADMIN_EMAIL",
            ""
        )

        if admin_email:

            send_email(

                admin_email,

                "New TurfX User Registration",

                f"""
New TurfX user registration received.

Name: {new_user.name}
Email: {new_user.email}
Phone: {new_user.phone or "Not provided"}

The account has been created successfully.

Regards,
TurfX System
"""

            )

        flash(
            "Account created successfully. Please login.",
            "success"
        )

        return redirect(
            url_for("login")
        )

    return render_template(
        "auth/register.html"
    )


# =========================================================
# FORGOT PASSWORD
# =========================================================

@app.route(
    "/forgot-password",
    methods=["GET", "POST"]
)
def forgot_password():

    if request.method == "POST":

        email = request.form.get(
            "email",
            ""
        ).strip().lower()

        if not email:

            flash(
                "Please enter your email address.",
                "error"
            )

            return redirect(
                url_for("forgot_password")
            )

        try:

            user = User.query.filter_by(
                email=email
            ).first()

        except Exception as error:

            print(
                "Forgot password lookup error:",
                error
            )

            flash(
                "Unable to process your request right now.",
                "error"
            )

            return redirect(
                url_for("forgot_password")
            )

        if not user:

            flash(
                "No account found with this email.",
                "error"
            )

            return redirect(
                url_for("forgot_password")
            )

        session.pop(
            "otp_verified",
            None
        )

        try:

            otp = create_password_reset_otp(
                user.id
            )

        except Exception as error:

            db.session.rollback()

            print(
                "OTP creation error:",
                error
            )

            flash(
                "Unable to generate OTP right now. Please try again.",
                "error"
            )

            return redirect(
                url_for("forgot_password")
            )

        session["reset_user_id"] = user.id
        session["reset_email"] = user.email

        email_sent = send_email(

            user.email,

            "TurfX Password Reset OTP 🔐",

            f"""
Hi {user.name},

We received a request to reset your TurfX password.

Your verification OTP is:

{otp}

This OTP is valid for 5 minutes.

You have a maximum of 5 verification attempts.

For your security, do not share this OTP with anyone.

If you did not request a password reset, you can safely ignore this email.

Regards,
TurfX Security Team
"""

        )

        if not email_sent:

            try:

                latest = (
                    get_latest_password_reset_otp(
                        user.id
                    )
                )

                if latest:

                    latest.is_used = True

                    db.session.commit()

            except Exception:

                db.session.rollback()

            session.pop(
                "reset_user_id",
                None
            )

            session.pop(
                "reset_email",
                None
            )

            session.pop(
                "otp_verified",
                None
            )

            flash(
                "Unable to send OTP email. Please try again.",
                "error"
            )

            return redirect(
                url_for("forgot_password")
            )

        flash(
            "A verification OTP has been sent to your email.",
            "success"
        )

        return redirect(
            url_for("verify_otp")
        )

    return render_template(
        "auth/forgot_password.html"
    )


# =========================================================
# OTP VERIFY
# =========================================================

@app.route(
    "/verify-otp",
    methods=["GET", "POST"]
)
def verify_otp():

    reset_user_id = session.get(
        "reset_user_id"
    )

    if not reset_user_id:

        flash(
            "Please request a new OTP first.",
            "error"
        )

        return redirect(
            url_for("forgot_password")
        )

    if request.method == "GET":

        return render_template(
            "auth/otp_verify.html"
        )

    otp = request.form.get(
        "otp",
        ""
    ).strip()

    if not otp.isdigit() or len(otp) != 6:

        flash(
            "Please enter the complete 6-digit OTP.",
            "error"
        )

        return redirect(
            url_for("verify_otp")
        )

    try:

        otp_record = (
            PasswordResetOTP.query
            .filter(
                PasswordResetOTP.user_id == reset_user_id,
                PasswordResetOTP.purpose == "password_reset",
                PasswordResetOTP.is_used.is_(False)
            )
            .order_by(
                PasswordResetOTP.id.desc()
            )
            .first()
        )

        if not otp_record:

            session.pop(
                "otp_verified",
                None
            )

            flash(
                "No active OTP found. Please request a new OTP.",
                "error"
            )

            return redirect(
                url_for("forgot_password")
            )

        if utc_now() >= otp_record.expires_at:

            otp_record.is_used = True

            db.session.commit()

            session.pop(
                "otp_verified",
                None
            )

            flash(
                "This OTP has expired. Please request a new OTP.",
                "error"
            )

            return redirect(
                url_for("forgot_password")
            )

        if otp_record.attempts >= 5:

            otp_record.is_used = True

            db.session.commit()

            session.pop(
                "otp_verified",
                None
            )

            flash(
                "Too many incorrect attempts. Please request a new OTP.",
                "error"
            )

            return redirect(
                url_for("forgot_password")
            )

        if not check_password_hash(
            otp_record.otp_hash,
            otp
        ):

            otp_record.attempts += 1

            if otp_record.attempts >= 5:

                otp_record.is_used = True

            db.session.commit()

            if otp_record.is_used:

                flash(
                    "Too many incorrect attempts. Please request a new OTP.",
                    "error"
                )

                return redirect(
                    url_for("forgot_password")
                )

            remaining = (
                5 - otp_record.attempts
            )

            flash(
                f"Invalid OTP. {remaining} attempts remaining.",
                "error"
            )

            return redirect(
                url_for("verify_otp")
            )

        otp_record.is_used = True

        db.session.commit()

        session["otp_verified"] = True

        flash(
            "OTP verified successfully.",
            "success"
        )

        return redirect(
            url_for("reset_password")
        )

    except Exception as error:

        db.session.rollback()

        print(
            "OTP verification error:",
            error
        )

        flash(
            "Unable to verify OTP right now. Please request a new OTP.",
            "error"
        )

        return redirect(
            url_for("verify_otp")
        )


# =========================================================
# RESET PASSWORD
# =========================================================

@app.route(
    "/reset-password",
    methods=["GET", "POST"]
)
def reset_password():

    if (
        "reset_user_id" not in session
        or not session.get("otp_verified")
    ):

        flash(
            "Please verify your OTP first.",
            "error"
        )

        return redirect(
            url_for("forgot_password")
        )

    if request.method == "POST":

        password = request.form.get(
            "password",
            ""
        )

        confirm_password = request.form.get(
            "confirm_password",
            ""
        )

        if len(password) < 6:

            flash(
                "Password must contain at least 6 characters.",
                "error"
            )

            return redirect(
                url_for("reset_password")
            )

        if password != confirm_password:

            flash(
                "Passwords do not match.",
                "error"
            )

            return redirect(
                url_for("reset_password")
            )

        try:

            user = db.session.get(
                User,
                session["reset_user_id"]
            )

        except Exception as error:

            print(
                "Reset password lookup error:",
                error
            )

            flash(
                "Unable to find your account.",
                "error"
            )

            return redirect(
                url_for("login")
            )

        if not user:

            session.pop(
                "reset_user_id",
                None
            )

            session.pop(
                "reset_email",
                None
            )

            session.pop(
                "otp_verified",
                None
            )

            flash(
                "Unable to find your account.",
                "error"
            )

            return redirect(
                url_for("login")
            )

        user.set_password(
            password
        )

        user.updated_at = utc_now()

        try:

            db.session.commit()

        except Exception as error:

            db.session.rollback()

            print(
                "Password update error:",
                error
            )

            flash(
                "Unable to update password right now.",
                "error"
            )

            return redirect(
                url_for("reset_password")
            )

        session.pop(
            "reset_user_id",
            None
        )

        session.pop(
            "reset_email",
            None
        )

        session.pop(
            "otp_verified",
            None
        )

        flash(
            "Password updated successfully. Please login.",
            "success"
        )

        return redirect(
            url_for("login")
        )

    return render_template(
        "auth/reset_password.html"
    )


# =========================================================
# LOGOUT
# =========================================================

@app.route("/logout")
def logout():

    session.clear()

    flash(
        "You have been logged out.",
        "success"
    )

    return redirect(
        url_for("login")
    )


# =========================================================
# USER DASHBOARD
# =========================================================

@app.route("/user/dashboard")
@login_required
def user_dashboard():

    if not is_logged_in():

        flash(
            "Please login first.",
            "error"
        )

        return redirect(
            url_for("login")
        )

    return render_template(
        "user/dashboard.html"
    )


# =========================================================
# REAL TURF SEARCH
# =========================================================

@app.route("/search-turf")
def search_turf():

    search_text = request.args.get(
        "q",
        ""
    ).strip()

    city = request.args.get(
        "city",
        ""
    ).strip()

    try:

        query = Turf.query.filter(
            Turf.status == "active"
        )

        if search_text:

            query = query.filter(
                or_(
                    Turf.name.ilike(
                        f"%{search_text}%"
                    ),
                    Turf.city.ilike(
                        f"%{search_text}%"
                    ),
                    Turf.address.ilike(
                        f"%{search_text}%"
                    )
                )
            )

        if city:

            query = query.filter(
                Turf.city.ilike(
                    f"%{city}%"
                )
            )

        turfs = (
            query
            .order_by(
                Turf.name.asc()
            )
            .all()
        )

        return render_template(
            "user/search_turf.html",
            turfs=turfs,
            search_text=search_text,
            selected_city=city
        )

    except Exception as error:

        print(
            "Turf search error:",
            error
        )

        flash(
            "Unable to load turfs right now.",
            "error"
        )

        return render_template(
            "user/search_turf.html",
            turfs=[],
            search_text=search_text,
            selected_city=city
        )


# =========================================================
# TURF DETAILS + AVAILABLE SLOTS
# =========================================================

@app.route("/turf/<int:turf_id>")
def turf_details(turf_id):

    selected_date_text = request.args.get(
        "date",
        ""
    ).strip()

    try:

        turf = (
            Turf.query
            .filter(
                Turf.id == turf_id,
                Turf.status == "active"
            )
            .first()
        )

        if not turf:

            flash(
                "Turf not found.",
                "error"
            )

            return redirect(
                url_for("search_turf")
            )

        if selected_date_text:

            try:

                selected_date = date.fromisoformat(
                    selected_date_text
                )

            except ValueError:

                selected_date = date.today()

        else:

            selected_date = date.today()

        slots = (
            TurfSlot.query
            .filter(
                TurfSlot.turf_id == turf.id,
                TurfSlot.slot_date == selected_date,
                TurfSlot.status == "available"
            )
            .order_by(
                TurfSlot.start_time.asc()
            )
            .all()
        )

        return render_template(
            "user/turf_details.html",
            turf=turf,
            turf_id=turf.id,
            slots=slots,
            selected_date=selected_date
        )

    except Exception as error:

        print(
            "Turf details error:",
            error
        )

        flash(
            "Unable to load turf details right now.",
            "error"
        )

        return redirect(
            url_for("search_turf")
        )


# =========================================================
# REAL BOOKING
# =========================================================

@app.route(
    "/booking",
    methods=["GET", "POST"]
)
@login_required
def booking():

    if "user_id" not in session:

        flash(
            "Please login to book a turf.",
            "error"
        )

        return redirect(
            url_for("login")
        )

    if request.method == "GET":

        turf_id = request.args.get(
            "turf_id",
            type=int
        )

        slot_id = request.args.get(
            "slot_id",
            type=int
        )

        date_text = request.args.get(
            "date",
            ""
        ).strip()

        turf = None
        slot = None
        selected_date = None

        try:

            if turf_id:

                turf = (
                    Turf.query
                    .filter(
                        Turf.id == turf_id,
                        Turf.status == "active"
                    )
                    .first()
                )

                if not turf:

                    flash(
                        "Selected turf was not found.",
                        "error"
                    )

                    return redirect(
                        url_for("search_turf")
                    )

            if date_text:

                try:

                    selected_date = date.fromisoformat(
                        date_text
                    )

                except ValueError:

                    flash(
                        "Invalid booking date.",
                        "error"
                    )

                    return redirect(
                        url_for(
                            "turf_details",
                            turf_id=turf_id
                        )
                    )

            if slot_id:

                slot_query = (
                    TurfSlot.query
                    .filter(
                        TurfSlot.id == slot_id,
                        TurfSlot.status == "available"
                    )
                )

                if turf:

                    slot_query = slot_query.filter(
                        TurfSlot.turf_id == turf.id
                    )

                if selected_date:

                    slot_query = slot_query.filter(
                        TurfSlot.slot_date == selected_date
                    )

                slot = slot_query.first()

                if not slot:

                    flash(
                        "Selected slot is no longer available.",
                        "error"
                    )

                    return redirect(
                        url_for(
                            "turf_details",
                            turf_id=(
                                turf.id
                                if turf
                                else turf_id
                            ),
                            date=(
                                selected_date.isoformat()
                                if selected_date
                                else ""
                            )
                        )
                    )

            if turf and slot:

                if slot.turf_id != turf.id:

                    flash(
                        "Selected slot does not belong to this turf.",
                        "error"
                    )

                    return redirect(
                        url_for("search_turf")
                    )

            return render_template(
                "user/booking.html",
                turf=turf,
                slot=slot,
                selected_date=selected_date
            )

        except Exception as error:

            print(
                "Booking GET error:",
                error
            )

            flash(
                "Unable to load booking details.",
                "error"
            )

            return redirect(
                url_for("search_turf")
            )

    user_id = session.get(
        "user_id"
    )

    turf_id = request.form.get(
        "turf_id",
        type=int
    )

    slot_id = request.form.get(
        "slot_id",
        type=int
    )

    booking_date_text = request.form.get(
        "booking_date",
        ""
    ).strip()

    notes = request.form.get(
        "notes",
        ""
    ).strip()

    if not turf_id or not slot_id:

        flash(
            "Please select a valid turf and slot.",
            "error"
        )

        return redirect(
            url_for("search_turf")
        )

    if not booking_date_text:

        flash(
            "Please select a booking date.",
            "error"
        )

        return redirect(
            url_for(
                "turf_details",
                turf_id=turf_id
            )
        )

    try:

        booking_date = date.fromisoformat(
            booking_date_text
        )

    except ValueError:

        flash(
            "Invalid booking date.",
            "error"
        )

        return redirect(
            url_for(
                "turf_details",
                turf_id=turf_id
            )
        )

    if booking_date < date.today():

        flash(
            "Booking date cannot be in the past.",
            "error"
        )

        return redirect(
            url_for(
                "turf_details",
                turf_id=turf_id
            )
        )

    try:

        turf = (
            Turf.query
            .filter(
                Turf.id == turf_id,
                Turf.status == "active"
            )
            .first()
        )

        if not turf:

            flash(
                "Selected turf is not available.",
                "error"
            )

            return redirect(
                url_for("search_turf")
            )

        slot = (
            TurfSlot.query
            .filter(
                TurfSlot.id == slot_id,
                TurfSlot.turf_id == turf.id,
                TurfSlot.slot_date == booking_date
            )
            .with_for_update()
            .first()
        )

        if not slot:

            flash(
                "Selected slot does not exist.",
                "error"
            )

            return redirect(
                url_for(
                    "turf_details",
                    turf_id=turf.id,
                    date=booking_date.isoformat()
                )
            )

        if slot.status != "available":

            flash(
                "Sorry, this slot is no longer available.",
                "error"
            )

            return redirect(
                url_for(
                    "turf_details",
                    turf_id=turf.id,
                    date=booking_date.isoformat()
                )
            )

        existing_booking = (
            Booking.query
            .filter(
                Booking.slot_id == slot.id,
                Booking.status.in_([
                    "pending",
                    "confirmed"
                ])
            )
            .first()
        )

        if existing_booking:

            flash(
                "This slot is already booked.",
                "error"
            )

            return redirect(
                url_for(
                    "turf_details",
                    turf_id=turf.id,
                    date=booking_date.isoformat()
                )
            )

        booking_code = None

        for _ in range(10):

            candidate = (
                "TX-"
                + secrets.token_hex(6).upper()
            )

            exists = (
                Booking.query
                .filter_by(
                    booking_code=candidate
                )
                .first()
            )

            if not exists:

                booking_code = candidate

                break

        if not booking_code:

            raise RuntimeError(
                "Unable to generate booking code."
            )

        now = utc_now()

        new_booking = Booking(

            booking_code=booking_code,

            user_id=user_id,

            turf_id=turf.id,

            slot_id=slot.id,

            booking_date=booking_date,

            total_amount=slot.price,

            status="pending",

            notes=notes or None,

            created_at=now,

            updated_at=now

        )

        db.session.add(
            new_booking
        )

        slot.status = "booked"

        db.session.commit()

        flash(
            f"Booking {new_booking.booking_code} created successfully.",
            "success"
        )

        return redirect(
            url_for(
                "booking_history"
            )
        )

    except Exception as error:

        db.session.rollback()

        print(
            "Booking transaction error:",
            error
        )

        flash(
            "Unable to complete your booking right now.",
            "error"
        )

        return redirect(
            url_for(
                "turf_details",
                turf_id=turf_id,
                date=booking_date_text
            )
        )


# =========================================================
# REAL BOOKING HISTORY
# =========================================================

@app.route("/booking-history")
@login_required
def booking_history():

    if "user_id" not in session:

        flash(
            "Please login to view your bookings.",
            "error"
        )

        return redirect(
            url_for("login")
        )

    user_id = session["user_id"]

    try:

        bookings = (
            Booking.query
            .filter(
                Booking.user_id == user_id
            )
            .order_by(
                Booking.created_at.desc()
            )
            .all()
        )

        return render_template(
            "user/booking_history.html",
            bookings=bookings
        )

    except Exception as error:

        print(
            "Booking history error:",
            error
        )

        flash(
            "Unable to load booking history.",
            "error"
        )

        return render_template(
            "user/booking_history.html",
            bookings=[]
        )


# =========================================================
# CANCEL BOOKING
# =========================================================

@app.route(
    "/booking/cancel/<int:booking_id>",
    methods=["POST"]
)
@login_required
def cancel_booking(booking_id):

    if "user_id" not in session:

        flash(
            "Please login first.",
            "error"
        )

        return redirect(
            url_for("login")
        )

    user_id = session["user_id"]

    try:

        booking_record = (
            Booking.query
            .filter(
                Booking.id == booking_id,
                Booking.user_id == user_id
            )
            .with_for_update()
            .first()
        )

        if not booking_record:

            flash(
                "Booking not found.",
                "error"
            )

            return redirect(
                url_for("booking_history")
            )

        if booking_record.status in (
            "cancelled",
            "completed",
            "refunded"
        ):

            flash(
                "This booking cannot be cancelled.",
                "error"
            )

            return redirect(
                url_for("booking_history")
            )

        slot = (
            TurfSlot.query
            .filter(
                TurfSlot.id == booking_record.slot_id
            )
            .with_for_update()
            .first()
        )

        booking_record.status = "cancelled"

        booking_record.updated_at = utc_now()

        if slot and slot.status == "booked":

            slot.status = "available"

        db.session.commit()

        flash(
            f"Booking {booking_record.booking_code} cancelled successfully.",
            "success"
        )

        return redirect(
            url_for("booking_history")
        )

    except Exception as error:

        db.session.rollback()

        print(
            "Cancel booking error:",
            error
        )

        flash(
            "Unable to cancel this booking right now.",
            "error"
        )

        return redirect(
            url_for("booking_history")
        )


# =========================================================
# PAYMENT
# =========================================================

@app.route(
    "/payment",
    methods=["GET", "POST"]
)
@login_required
def payment():

    if "user_id" not in session:

        flash(
            "Please login first.",
            "error"
        )

        return redirect(
            url_for("login")
        )

    user_id = session["user_id"]

    if request.method == "GET":

        booking_id = request.args.get(
            "booking_id",
            type=int
        )

        booking_record = None

        if booking_id:

            booking_record = (
                Booking.query
                .filter(
                    Booking.id == booking_id,
                    Booking.user_id == user_id
                )
                .first()
            )

        return render_template(
            "user/payment.html",
            booking=booking_record
        )

    payment_method = request.form.get(
        "payment_method",
        "upi"
    ).strip().lower()

    booking_id = request.form.get(
        "booking_id",
        type=int
    )

    allowed_methods = {
        "upi",
        "card",
        "cash",
        "netbanking",
        "wallet"
    }

    if payment_method not in allowed_methods:

        flash(
            "Please select a valid payment method.",
            "error"
        )

        return redirect(
            url_for("payment")
        )

    if not booking_id:

        flash(
            "Please select a valid booking.",
            "error"
        )

        return redirect(
            url_for("booking_history")
        )

    try:

        booking_record = (
            Booking.query
            .filter(
                Booking.id == booking_id,
                Booking.user_id == user_id
            )
            .with_for_update()
            .first()
        )

        if not booking_record:

            flash(
                "Booking not found.",
                "error"
            )

            return redirect(
                url_for("booking_history")
            )

        if booking_record.status == "cancelled":

            flash(
                "Cancelled bookings cannot be paid.",
                "error"
            )

            return redirect(
                url_for("booking_history")
            )

        if booking_record.status in ("completed", "refunded"):

            flash(
                "This booking is no longer eligible for payment.",
                "error"
            )

            return redirect(
                url_for("booking_history")
            )

        existing_payment = (
            Payment.query
            .filter(
                Payment.booking_id == booking_record.id,
                Payment.status == "success"
            )
            .first()
        )

        if existing_payment:

            flash(
                "Payment has already been completed.",
                "success"
            )

            return redirect(
                url_for(
                    "payment_success",
                    booking_id=booking_record.id
                )
            )

        transaction_id = (
            "TXN-"
            + secrets.token_hex(8).upper()
        )

        payment_record = Payment(

            booking_id=booking_record.id,

            user_id=user_id,

            transaction_id=transaction_id,

            payment_method=payment_method,

            amount=booking_record.total_amount,

            currency="INR",

            status="success",

            payment_gateway="TurfX-Demo",

            gateway_response="Demo payment processed successfully.",

            paid_at=utc_now(),

            created_at=utc_now()

        )

        db.session.add(
            payment_record
        )

        booking_record.status = "confirmed"

        booking_record.updated_at = utc_now()

        db.session.commit()

        flash(
            "Payment processed successfully.",
            "success"
        )

        return redirect(
            url_for(
                "payment_success",
                booking_id=booking_record.id
            )
        )

    except Exception as error:

        db.session.rollback()

        print(
            "Payment error:",
            error
        )

        flash(
            "Unable to process payment right now.",
            "error"
        )

        return redirect(
            url_for("payment_failed")
        )


# =========================================================
# PAYMENT SUCCESS
# =========================================================

@app.route("/payment/success")
@login_required
def payment_success():

    booking_id = request.args.get(
        "booking_id",
        type=int
    )

    booking_record = None

    if (
        booking_id
        and "user_id" in session
    ):

        booking_record = (
            Booking.query
            .filter(
                Booking.id == booking_id,
                Booking.user_id == session["user_id"]
            )
            .first()
        )

    return render_template(
        "user/payment_success.html",
        booking=booking_record
    )


# =========================================================
# PAYMENT FAILED
# =========================================================

@app.route("/payment/failed")
def payment_failed():

    return render_template(
        "user/payment_failed.html"
    )


# =========================================================
# EQUIPMENT
# =========================================================

@app.route("/equipment")
@login_required
def equipment():

    return render_template(
        "user/equipment.html"
    )


# =========================================================
# TEAM
# =========================================================

@app.route("/team")
@login_required
def team():

    return render_template(
        "user/team.html"
    )


# =========================================================
# CREATE TEAM
# =========================================================

@app.route(
    "/create-team",
    methods=["GET", "POST"]
)
@login_required
def create_team():

    if request.method == "POST":

        flash(
            "Team created successfully.",
            "success"
        )

        return redirect(
            url_for("team")
        )

    return render_template(
        "user/create_team.html"
    )


# =========================================================
# JOIN TEAM
# =========================================================

@app.route("/join-team")
@login_required
def join_team():

    return render_template(
        "user/join_team.html"
    )


# =========================================================
# SCORECARD
# =========================================================

@app.route("/scorecard")
@login_required
def scorecard():

    return render_template(
        "user/scorecard.html"
    )


# =========================================================
# QR TICKET
# =========================================================

@app.route("/qr-ticket")
@login_required
def qr_ticket():

    return render_template(
        "user/qr_ticket.html"
    )


# =========================================================
# NOTIFICATIONS
# =========================================================

@app.route("/notifications")
@login_required
def notifications():

    return render_template(
        "user/notifications.html"
    )


# =========================================================
# PROFILE
# =========================================================

@app.route("/profile")
@login_required
def profile():

    return render_template(
        "user/profile.html"
    )


# =========================================================
# SETTINGS
# =========================================================

@app.route("/settings")
@login_required
def settings():

    return render_template(
        "user/settings.html"
    )


# =========================================================
# ADMIN MODULE
# =========================================================

@app.route("/admin/dashboard")
@admin_required
def admin_dashboard():

    return render_template(
        "admin/dashboard.html"
    )


@app.route("/admin/bookings")
@admin_required
def admin_bookings():

    return render_template(
        "admin/bookings.html"
    )


@app.route("/admin/slot-management")
@admin_required
def admin_slot_management():

    return render_template(
        "admin/slot_management.html"
    )


@app.route("/admin/transactions")
@admin_required
def admin_transactions():

    return render_template(
        "admin/transactions.html"
    )


@app.route("/admin/reports")
@admin_required
def admin_reports():

    return render_template(
        "admin/reports.html"
    )


@app.route("/admin/equipment")
@admin_required
def admin_equipment():

    return render_template(
        "admin/equipment.html"
    )


@app.route("/admin/customers")
@admin_required
def admin_customers():

    return render_template(
        "admin/customers.html"
    )


@app.route("/admin/staff")
@admin_required
def admin_staff():

    return render_template(
        "admin/staff.html"
    )


@app.route("/admin/pricing")
@admin_required
def admin_pricing():

    return render_template(
        "admin/pricing.html"
    )


@app.route("/admin/qr-scanner")
@admin_required
def admin_qr_scanner():

    return render_template(
        "admin/qr_scanner.html"
    )


@app.route("/admin/turf-management")
@admin_required
def admin_turf_management():

    return render_template(
        "admin/turf_management.html"
    )


@app.route("/admin/notifications")
@admin_required
def admin_notifications():

    return render_template(
        "admin/notifications.html"
    )


@app.route("/admin/analytics")
@admin_required
def admin_analytics():

    return render_template(
        "admin/analytics.html"
    )


@app.route("/admin/settings")
@admin_required
def admin_settings():

    return render_template(
        "admin/settings.html"
    )


# =========================================================
# TOURNAMENT MODULE
# =========================================================


# =========================================================
# TOURNAMENT DASHBOARD
# =========================================================

@app.route("/tournament")
def tournament_dashboard():

    try:

        tournaments = (
            Tournament.query
            .order_by(
                Tournament.created_at.desc()
            )
            .all()
        )

        return render_template(
            "tournament/dashboard.html",
            tournaments=tournaments
        )

    except Exception as error:

        print(
            "Tournament dashboard error:",
            error
        )

        flash(
            "Unable to load tournaments right now.",
            "error"
        )

        return render_template(
            "tournament/dashboard.html",
            tournaments=[]
        )


# =========================================================
# CREATE TOURNAMENT
# =========================================================

@app.route(
    "/create-tournament",
    methods=["GET", "POST"]
)
def create_tournament():

    if not is_logged_in():

        flash(
            "Please login to create a tournament.",
            "error"
        )

        return redirect(
            url_for("login")
        )

    if request.method == "GET":

        return render_template(
            "tournament/create.html"
        )

    # -----------------------------------------------------
    # FORM VALUES
    # -----------------------------------------------------

    tournament_name = request.form.get(
        "tournament_name",
        request.form.get(
            "name",
            ""
        )
    ).strip()

    description = request.form.get(
        "description",
        ""
    ).strip()

    sport = request.form.get(
        "sport",
        "cricket"
    ).strip().lower()

    tournament_format = request.form.get(
        "format",
        "league"
    ).strip().lower()

    location = request.form.get(
        "location",
        ""
    ).strip()

    start_date_text = request.form.get(
        "start_date",
        ""
    ).strip()

    end_date_text = request.form.get(
        "end_date",
        ""
    ).strip()

    max_teams_text = request.form.get(
        "max_teams",
        "8"
    ).strip()

    entry_fee_text = request.form.get(
        "entry_fee",
        "0"
    ).strip()

    prize_amount_text = request.form.get(
        "prize_amount",
        "0"
    ).strip()

    image = request.form.get(
        "image",
        ""
    ).strip()

    # -----------------------------------------------------
    # REQUIRED VALIDATION
    # -----------------------------------------------------

    if not tournament_name:

        flash(
            "Please enter a tournament name.",
            "error"
        )

        return redirect(
            url_for("create_tournament")
        )

    if len(tournament_name) > 150:

        flash(
            "Tournament name cannot exceed 150 characters.",
            "error"
        )

        return redirect(
            url_for("create_tournament")
        )

    # -----------------------------------------------------
    # FORMAT VALIDATION
    # -----------------------------------------------------

    allowed_formats = {
        "league",
        "knockout",
        "league_knockout"
    }

    if tournament_format not in allowed_formats:

        flash(
            "Invalid tournament format.",
            "error"
        )

        return redirect(
            url_for("create_tournament")
        )

    # -----------------------------------------------------
    # DATE VALIDATION
    # -----------------------------------------------------

    if not start_date_text or not end_date_text:

        flash(
            "Please select start date and end date.",
            "error"
        )

        return redirect(
            url_for("create_tournament")
        )

    try:

        start_date = date.fromisoformat(
            start_date_text
        )

        end_date = date.fromisoformat(
            end_date_text
        )

    except ValueError:

        flash(
            "Please enter valid tournament dates.",
            "error"
        )

        return redirect(
            url_for("create_tournament")
        )

    if end_date < start_date:

        flash(
            "End date cannot be before start date.",
            "error"
        )

        return redirect(
            url_for("create_tournament")
        )

    # -----------------------------------------------------
    # MAX TEAMS
    # -----------------------------------------------------

    try:

        max_teams = int(
            max_teams_text
        )

    except ValueError:

        flash(
            "Maximum teams must be a valid number.",
            "error"
        )

        return redirect(
            url_for("create_tournament")
        )

    if max_teams < 2:

        flash(
            "Tournament must allow at least 2 teams.",
            "error"
        )

        return redirect(
            url_for("create_tournament")
        )

    # -----------------------------------------------------
    # ENTRY FEE
    # -----------------------------------------------------

    try:

        entry_fee = float(
            entry_fee_text or 0
        )

    except ValueError:

        flash(
            "Entry fee must be a valid amount.",
            "error"
        )

        return redirect(
            url_for("create_tournament")
        )

    if entry_fee < 0:

        flash(
            "Entry fee cannot be negative.",
            "error"
        )

        return redirect(
            url_for("create_tournament")
        )

    # -----------------------------------------------------
    # PRIZE
    # -----------------------------------------------------

    try:

        prize_amount = float(
            prize_amount_text or 0
        )

    except ValueError:

        flash(
            "Prize amount must be a valid amount.",
            "error"
        )

        return redirect(
            url_for("create_tournament")
        )

    if prize_amount < 0:

        flash(
            "Prize amount cannot be negative.",
            "error"
        )

        return redirect(
            url_for("create_tournament")
        )

    # -----------------------------------------------------
    # CREATE DB RECORD
    # -----------------------------------------------------

    try:

        now = utc_now()

        tournament = Tournament(

            created_by=session["user_id"],

            name=tournament_name,

            description=description or None,

            sport=sport or "cricket",

            format=tournament_format,

            location=location or None,

            start_date=start_date,

            end_date=end_date,

            max_teams=max_teams,

            entry_fee=entry_fee,

            prize_amount=prize_amount,

            status="open",

            image=image or None,

            created_at=now,

            updated_at=now

        )

        db.session.add(
            tournament
        )

        db.session.commit()

        flash(
            f"Tournament '{tournament.name}' created successfully.",
            "success"
        )

        return redirect(
            url_for(
                "tournament_details",
                tournament_id=tournament.id
            )
        )

    except Exception as error:

        db.session.rollback()

        print(
            "Create tournament database error:",
            error
        )

        flash(
            "Unable to create tournament right now.",
            "error"
        )

        return redirect(
            url_for("create_tournament")
        )


# =========================================================
# TOURNAMENT CREATE ALIAS
# =========================================================

@app.route(
    "/tournament/create",
    methods=["GET", "POST"]
)
def tournament_create():

    return create_tournament()


# =========================================================
# TOURNAMENT DETAILS
# =========================================================

@app.route(
    "/tournament/<int:tournament_id>"
)
def tournament_details(tournament_id):

    try:

        tournament = (
            Tournament.query
            .filter(
                Tournament.id == tournament_id
            )
            .first()
        )

        if not tournament:

            flash(
                "Tournament not found.",
                "error"
            )

            return redirect(
                url_for("tournament_dashboard")
            )

        return render_template(
            "tournament/details.html",
            tournament=tournament,
            tournament_id=tournament.id
        )

    except Exception as error:

        print(
            "Tournament details error:",
            error
        )

        flash(
            "Unable to load tournament details.",
            "error"
        )

        return redirect(
            url_for("tournament_dashboard")
        )


# =========================================================
# EDIT TOURNAMENT
# =========================================================

@app.route(
    "/tournament/edit",
    methods=["GET", "POST"]
)
def tournament_edit():

    if not is_logged_in():

        flash(
            "Please login first.",
            "error"
        )

        return redirect(
            url_for("login")
        )

    # -----------------------------------------------------
    # GET
    # -----------------------------------------------------

    if request.method == "GET":

        tournament_id = request.args.get(
            "tournament_id",
            request.args.get(
                "id",
                type=int
            ),
            type=int
        )

        if not tournament_id:

            flash(
                "Please select a tournament to edit.",
                "error"
            )

            return redirect(
                url_for("tournament_dashboard")
            )

        try:

            tournament = (
                Tournament.query
                .filter(
                    Tournament.id == tournament_id
                )
                .first()
            )

            if not tournament:

                flash(
                    "Tournament not found.",
                    "error"
                )

                return redirect(
                    url_for("tournament_dashboard")
                )

            if (
                tournament.created_by != session["user_id"]
                and not is_admin()
            ):

                flash(
                    "You are not allowed to edit this tournament.",
                    "error"
                )

                return redirect(
                    url_for("tournament_dashboard")
                )

            return render_template(
                "tournament/edit.html",
                tournament=tournament
            )

        except Exception as error:

            print(
                "Tournament edit GET error:",
                error
            )

            flash(
                "Unable to load tournament for editing.",
                "error"
            )

            return redirect(
                url_for("tournament_dashboard")
            )

    # -----------------------------------------------------
    # POST
    # -----------------------------------------------------

    tournament_id = request.form.get(
        "tournament_id",
        type=int
    )

    if not tournament_id:

        flash(
            "Invalid tournament.",
            "error"
        )

        return redirect(
            url_for("tournament_dashboard")
        )

    try:

        tournament = (
            Tournament.query
            .filter(
                Tournament.id == tournament_id
            )
            .first()
        )

        if not tournament:

            flash(
                "Tournament not found.",
                "error"
            )

            return redirect(
                url_for("tournament_dashboard")
            )

        if (
            tournament.created_by != session["user_id"]
            and not is_admin()
        ):

            flash(
                "You are not allowed to edit this tournament.",
                "error"
            )

            return redirect(
                url_for("tournament_dashboard")
            )

        name = request.form.get(
            "tournament_name",
            request.form.get(
                "name",
                ""
            )
        ).strip()

        description = request.form.get(
            "description",
            ""
        ).strip()

        sport = request.form.get(
            "sport",
            tournament.sport
        ).strip().lower()

        tournament_format = request.form.get(
            "format",
            tournament.format
        ).strip().lower()

        location = request.form.get(
            "location",
            ""
        ).strip()

        start_date_text = request.form.get(
            "start_date",
            ""
        ).strip()

        end_date_text = request.form.get(
            "end_date",
            ""
        ).strip()

        max_teams_text = request.form.get(
            "max_teams",
            str(tournament.max_teams)
        ).strip()

        entry_fee_text = request.form.get(
            "entry_fee",
            str(tournament.entry_fee)
        ).strip()

        prize_amount_text = request.form.get(
            "prize_amount",
            str(tournament.prize_amount)
        ).strip()

        image = request.form.get(
            "image",
            ""
        ).strip()

        # -------------------------------------------------
        # VALIDATION
        # -------------------------------------------------

        if not name:

            flash(
                "Tournament name is required.",
                "error"
            )

            return redirect(
                url_for(
                    "tournament_edit",
                    tournament_id=tournament.id
                )
            )

        if len(name) > 150:

            flash(
                "Tournament name cannot exceed 150 characters.",
                "error"
            )

            return redirect(
                url_for(
                    "tournament_edit",
                    tournament_id=tournament.id
                )
            )

        allowed_formats = {
            "league",
            "knockout",
            "league_knockout"
        }

        if tournament_format not in allowed_formats:

            flash(
                "Invalid tournament format.",
                "error"
            )

            return redirect(
                url_for(
                    "tournament_edit",
                    tournament_id=tournament.id
                )
            )

        try:

            start_date = date.fromisoformat(
                start_date_text
            )

            end_date = date.fromisoformat(
                end_date_text
            )

        except ValueError:

            flash(
                "Please enter valid tournament dates.",
                "error"
            )

            return redirect(
                url_for(
                    "tournament_edit",
                    tournament_id=tournament.id
                )
            )

        if end_date < start_date:

            flash(
                "End date cannot be before start date.",
                "error"
            )

            return redirect(
                url_for(
                    "tournament_edit",
                    tournament_id=tournament.id
                )
            )

        try:

            max_teams = int(
                max_teams_text
            )

            entry_fee = float(
                entry_fee_text or 0
            )

            prize_amount = float(
                prize_amount_text or 0
            )

        except ValueError:

            flash(
                "Please enter valid numeric values.",
                "error"
            )

            return redirect(
                url_for(
                    "tournament_edit",
                    tournament_id=tournament.id
                )
            )

        if max_teams < 2:

            flash(
                "Maximum teams must be at least 2.",
                "error"
            )

            return redirect(
                url_for(
                    "tournament_edit",
                    tournament_id=tournament.id
                )
            )

        if entry_fee < 0 or prize_amount < 0:

            flash(
                "Amounts cannot be negative.",
                "error"
            )

            return redirect(
                url_for(
                    "tournament_edit",
                    tournament_id=tournament.id
                )
            )

        # -------------------------------------------------
        # UPDATE
        # -------------------------------------------------

        tournament.name = name

        tournament.description = (
            description or None
        )

        tournament.sport = (
            sport or "cricket"
        )

        tournament.format = (
            tournament_format
        )

        tournament.location = (
            location or None
        )

        tournament.start_date = start_date

        tournament.end_date = end_date

        tournament.max_teams = max_teams

        tournament.entry_fee = entry_fee

        tournament.prize_amount = prize_amount

        tournament.image = (
            image or None
        )

        tournament.updated_at = utc_now()

        db.session.commit()

        flash(
            "Tournament updated successfully.",
            "success"
        )

        return redirect(
            url_for(
                "tournament_details",
                tournament_id=tournament.id
            )
        )

    except Exception as error:

        db.session.rollback()

        print(
            "Tournament update error:",
            error
        )

        flash(
            "Unable to update tournament right now.",
            "error"
        )

        return redirect(
            url_for(
                "tournament_edit",
                tournament_id=tournament_id
            )
        )


# =========================================================
# CANCEL TOURNAMENT
# =========================================================

@app.route(
    "/tournament/cancel/<int:tournament_id>",
    methods=["POST"]
)
def cancel_tournament(tournament_id):

    if not is_logged_in():

        flash(
            "Please login first.",
            "error"
        )

        return redirect(
            url_for("login")
        )

    try:

        tournament = (
            Tournament.query
            .filter(
                Tournament.id == tournament_id
            )
            .with_for_update()
            .first()
        )

        if not tournament:

            flash(
                "Tournament not found.",
                "error"
            )

            return redirect(
                url_for("tournament_dashboard")
            )

        if (
            tournament.created_by != session["user_id"]
            and not is_admin()
        ):

            flash(
                "You are not allowed to cancel this tournament.",
                "error"
            )

            return redirect(
                url_for("tournament_dashboard")
            )

        if tournament.status == "completed":

            flash(
                "Completed tournaments cannot be cancelled.",
                "error"
            )

            return redirect(
                url_for(
                    "tournament_details",
                    tournament_id=tournament.id
                )
            )

        if tournament.status == "cancelled":

            flash(
                "Tournament is already cancelled.",
                "error"
            )

            return redirect(
                url_for(
                    "tournament_details",
                    tournament_id=tournament.id
                )
            )

        tournament.status = "cancelled"

        tournament.updated_at = utc_now()

        db.session.commit()

        flash(
            "Tournament cancelled successfully.",
            "success"
        )

        return redirect(
            url_for(
                "tournament_details",
                tournament_id=tournament.id
            )
        )

    except Exception as error:

        db.session.rollback()

        print(
            "Tournament cancellation error:",
            error
        )

        flash(
            "Unable to cancel tournament right now.",
            "error"
        )

        return redirect(
            url_for(
                "tournament_details",
                tournament_id=tournament_id
            )
        )


# =========================================================
# TOURNAMENT REGISTRATION
# =========================================================

@app.route(
    "/tournament/registration"
)
def tournament_registration():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    tournament = None

    if tournament_id:

        try:

            tournament = (
                Tournament.query
                .filter(
                    Tournament.id == tournament_id
                )
                .first()
            )

        except Exception as error:

            print(
                "Tournament registration lookup error:",
                error
            )

    return render_template(
        "tournament/registration.html",
        tournament=tournament,
        tournament_id=tournament_id
    )


# =========================================================
# TOURNAMENT TEAMS
# =========================================================

@app.route("/tournament/teams")
def tournament_teams():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    tournament = None

    if tournament_id:

        tournament = (
            Tournament.query
            .filter(
                Tournament.id == tournament_id
            )
            .first()
        )

    return render_template(
        "tournament/teams.html",
        tournament=tournament,
        tournament_id=tournament_id
    )


# =========================================================
# TOURNAMENT FIXTURES
# =========================================================

@app.route("/tournament/fixtures")
def tournament_fixtures():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    tournament = None

    if tournament_id:

        tournament = (
            Tournament.query
            .filter(
                Tournament.id == tournament_id
            )
            .first()
        )

    return render_template(
        "tournament/fixtures.html",
        tournament=tournament,
        tournament_id=tournament_id
    )


# =========================================================
# TOURNAMENT LIVE SCORE
# =========================================================

@app.route("/tournament/live-score")
def tournament_live_score():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    return render_template(
        "tournament/live_score.html",
        tournament_id=tournament_id
    )


# =========================================================
# TOURNAMENT SCORE ENTRY
# =========================================================

@app.route("/tournament/score-entry")
def tournament_score_entry():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    return render_template(
        "tournament/score_entry.html",
        tournament_id=tournament_id
    )


# =========================================================
# TOURNAMENT TOSS
# =========================================================

@app.route("/tournament/toss")
def tournament_toss():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    return render_template(
        "tournament/toss.html",
        tournament_id=tournament_id
    )


# =========================================================
# PLAYING XI
# =========================================================

@app.route("/tournament/playing-xi")
def tournament_playing_xi():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    return render_template(
        "tournament/playing_xi.html",
        tournament_id=tournament_id
    )


# =========================================================
# UMPIRE
# =========================================================

@app.route("/tournament/umpire")
def tournament_umpire():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    return render_template(
        "tournament/umpire.html",
        tournament_id=tournament_id
    )


# =========================================================
# POINTS TABLE
# =========================================================

@app.route("/tournament/points-table")
def tournament_points_table():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    return render_template(
        "tournament/points_table.html",
        tournament_id=tournament_id
    )


# =========================================================
# LEADERBOARD
# =========================================================

@app.route("/tournament/leaderboard")
def tournament_leaderboard():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    return render_template(
        "tournament/leaderboard.html",
        tournament_id=tournament_id
    )


# =========================================================
# ORANGE CAP
# =========================================================

@app.route("/tournament/orange-cap")
def tournament_orange_cap():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    return render_template(
        "tournament/orange_cap.html",
        tournament_id=tournament_id
    )


# =========================================================
# PURPLE CAP
# =========================================================

@app.route("/tournament/purple-cap")
def tournament_purple_cap():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    return render_template(
        "tournament/purple_cap.html",
        tournament_id=tournament_id
    )


# =========================================================
# AUCTION
# =========================================================

@app.route("/tournament/auction")
def tournament_auction():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    return render_template(
        "tournament/auction.html",
        tournament_id=tournament_id
    )


# =========================================================
# SPONSORS
# =========================================================

@app.route("/tournament/sponsors")
def tournament_sponsors():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    return render_template(
        "tournament/sponsors.html",
        tournament_id=tournament_id
    )


# =========================================================
# GALLERY
# =========================================================

@app.route("/tournament/gallery")
def tournament_gallery():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    return render_template(
        "tournament/gallery.html",
        tournament_id=tournament_id
    )


# =========================================================
# CERTIFICATES
# =========================================================

@app.route("/tournament/certificates")
def tournament_certificates():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    return render_template(
        "tournament/certificates.html",
        tournament_id=tournament_id
    )


# =========================================================
# WINNERS
# =========================================================

@app.route("/tournament/winners")
def tournament_winners():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    return render_template(
        "tournament/winners.html",
        tournament_id=tournament_id
    )


# =========================================================
# RESULTS
# =========================================================

@app.route("/tournament/results")
def tournament_results():

    tournament_id = request.args.get(
        "tournament_id",
        type=int
    )

    return render_template(
        "tournament/results.html",
        tournament_id=tournament_id
    )


# =========================================================
# ERROR HANDLERS
# =========================================================

@app.errorhandler(404)
def page_not_found(error):

    try:

        return render_template(
            "errors/404.html"
        ), 404

    except Exception:

        return (
            "<h1>404 - Page Not Found</h1>",
            404
        )


@app.errorhandler(403)
def forbidden(error):

    try:

        return render_template(
            "errors/403.html"
        ), 403

    except Exception:

        return (
            "<h1>403 - Access Denied</h1>",
            403
        )


@app.errorhandler(500)
def internal_server_error(error):

    try:

        return render_template(
            "errors/500.html"
        ), 500

    except Exception:

        return (
            "<h1>500 - Internal Server Error</h1>",
            500
        )


# =========================================================
# RUN APP
# =========================================================

if __name__ == "__main__":

    print(
        "\n========================================"
    )

    print(
        "          TURFX FLASK SERVER"
    )

    print(
        "========================================"
    )

    if test_database_connection():

        initialize_database()

    print(
        "========================================\n"
    )

    # Railway / production uses the PORT environment variable.
    # Local development falls back to port 5000.
    port = int(
        os.getenv(
            "PORT",
            "5000"
        )
    )

    host = os.getenv(
        "HOST",
        "0.0.0.0"
    )

    debug_mode = (
        os.getenv(
            "FLASK_DEBUG",
            "false"
        ).strip().lower()
        == "true"
    )

    app.run(
        host=host,
        port=port,
        debug=debug_mode
    )