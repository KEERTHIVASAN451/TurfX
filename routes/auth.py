from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/auth"
)

mysql = None


def init_auth(mysql_instance):
    global mysql
    mysql = mysql_instance


# ============================================================
# REGISTER
# ============================================================

@auth_bp.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        full_name = request.form.get("full_name", "").strip()
        email = request.form.get("email", "").strip().lower()
        phone = request.form.get("phone", "").strip()
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")

        # -------------------------
        # Validation
        # -------------------------

        if not full_name:
            flash("Please enter your full name.", "error")
            return redirect(url_for("auth.register"))

        if not email:
            flash("Please enter your email address.", "error")
            return redirect(url_for("auth.register"))

        if not password:
            flash("Please enter your password.", "error")
            return redirect(url_for("auth.register"))

        if len(password) < 6:
            flash(
                "Password must contain at least 6 characters.",
                "error"
            )
            return redirect(url_for("auth.register"))

        if password != confirm_password:
            flash(
                "Passwords do not match.",
                "error"
            )
            return redirect(url_for("auth.register"))

        # -------------------------
        # Check database connection
        # -------------------------

        if mysql is None:

            flash(
                "Database connection is not available.",
                "error"
            )

            return redirect(url_for("auth.register"))

        cursor = mysql.connection.cursor()

        try:

            # Check existing email

            cursor.execute(
                """
                SELECT id
                FROM users
                WHERE email = %s
                """,
                (email,)
            )

            existing_user = cursor.fetchone()

            if existing_user:

                flash(
                    "An account with this email already exists.",
                    "error"
                )

                return redirect(
                    url_for("auth.register")
                )

            # Password hash

            password_hash = generate_password_hash(password)

            # Insert user

            cursor.execute(
                """
                INSERT INTO users
                (
                    full_name,
                    email,
                    phone,
                    password_hash,
                    status,
                    email_verified,
                    phone_verified
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
                """,
                (
                    full_name,
                    email,
                    phone,
                    password_hash,
                    "active",
                    0,
                    0
                )
            )

            mysql.connection.commit()

            flash(
                "Account created successfully. Please login.",
                "success"
            )

            return redirect(
                url_for("auth.login")
            )

        except Exception as e:

            mysql.connection.rollback()

            print("REGISTER ERROR:", e)
            import traceback
            traceback.print_exc()
             

            flash(
                "Registration failed. Please try again.",
                "error"
            )

            return redirect(
                url_for("auth.register")
            )

        finally:

            cursor.close()

    return render_template(
        "auth/register.html"
    )


# ============================================================
# LOGIN
# ============================================================

@auth_bp.route("/login", methods=["GET", "POST"])
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
                url_for("auth.login")
            )

        if mysql is None:

            flash(
                "Database connection is not available.",
                "error"
            )

            return redirect(
                url_for("auth.login")
            )

        cursor = mysql.connection.cursor()

        try:

            cursor.execute(
                """
                SELECT
                    id,
                    role_id,
                    full_name,
                    email,
                    password_hash,
                    status
                FROM users
                WHERE email = %s
                """,
                (email,)
            )

            user = cursor.fetchone()

            if user is None:

                flash(
                    "Invalid email or password.",
                    "error"
                )

                return redirect(
                    url_for("auth.login")
                )

            user_id = user[0]
            role_id = user[1]
            full_name = user[2]
            user_email = user[3]
            password_hash = user[4]
            status = user[5]

            # Account status

            if status != "active":

                flash(
                    "Your account is not active.",
                    "error"
                )

                return redirect(
                    url_for("auth.login")
                )

            # Password check

            if not check_password_hash(
                password_hash,
                password
            ):

                flash(
                    "Invalid email or password.",
                    "error"
                )

                return redirect(
                    url_for("auth.login")
                )

            # Session

            session["user_id"] = user_id
            session["role_id"] = role_id
            session["user_name"] = full_name
            session["user_email"] = user_email

            # Update last login

            cursor.execute(
                """
                UPDATE users
                SET last_login_at = NOW()
                WHERE id = %s
                """,
                (user_id,)
            )

            mysql.connection.commit()

            return redirect(
                url_for("user.dashboard")
            )

        except Exception as e:

            mysql.connection.rollback()

            print("LOGIN ERROR:", e)

            flash(
                "Login failed. Please try again.",
                "error"
            )

            return redirect(
                url_for("auth.login")
            )

        finally:

            cursor.close()

    return render_template(
        "auth/login.html"
    )


# ============================================================
# LOGOUT
# ============================================================

@auth_bp.route("/logout")
def logout():

    session.clear()

    flash(
        "You have been logged out.",
        "success"
    )

    return redirect(
        url_for("auth.login")
    )


# ============================================================
# FORGOT PASSWORD
# ============================================================

@auth_bp.route("/forgot-password")
def forgot_password():

    return render_template(
        "auth/forgot_password.html"
    )


# ============================================================
# OTP VERIFY
# ============================================================

@auth_bp.route("/otp-verify")
def otp_verify():

    return render_template(
        "auth/otp_verify.html"
    )


# ============================================================
# RESET PASSWORD
# ============================================================

@auth_bp.route("/reset-password")
def reset_password():

    return render_template(
        "auth/reset_password.html"
    )