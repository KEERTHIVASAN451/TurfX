# =========================================================
# TurfX - Application Configuration
# File: config.py
# =========================================================

import os

from dotenv import load_dotenv


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# CONFIGURATION
# =========================================================

class Config:

    # =====================================================
    # SECRET KEY
    # =====================================================

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "turfx-dev-secret-key"
    )


    # =====================================================
    # MONGODB CONFIGURATION (MONGODB ATLAS)
    # =====================================================

    MONGODB_URI = os.getenv(
        "MONGODB_URI",
        "mongodb+srv://kv0939169_db_user:HOCLrddiK8iliBE5@turfx-booking.o64agpk.mongodb.net/turfx?retryWrites=true&w=majority"
    )

    MONGODB_DB = os.getenv(
        "MONGODB_DB",
        "turfx"
    )


    # =====================================================
    # USER / ADMIN ROLES
    # =====================================================

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


    # =====================================================
    # GMAIL / SMTP
    # =====================================================

    MAIL_SERVER = os.getenv(
        "MAIL_SERVER",
        "smtp.gmail.com"
    )


    MAIL_PORT = int(
        os.getenv(
            "MAIL_PORT",
            "587"
        )
    )


    MAIL_USE_TLS = (
        os.getenv(
            "MAIL_USE_TLS",
            "true"
        ).strip().lower()
        == "true"
    )


    MAIL_USE_SSL = (
        os.getenv(
            "MAIL_USE_SSL",
            "false"
        ).strip().lower()
        == "true"
    )


    MAIL_USERNAME = os.getenv(
        "MAIL_USERNAME",
        ""
    )


    MAIL_PASSWORD = os.getenv(
        "MAIL_PASSWORD",
        ""
    )


    MAIL_DEFAULT_SENDER = os.getenv(
        "MAIL_DEFAULT_SENDER",
        MAIL_USERNAME
    )


    # =====================================================
    # TURFX ADMIN EMAIL
    # =====================================================

    ADMIN_EMAIL = os.getenv(
        "ADMIN_EMAIL",
        ""
    )