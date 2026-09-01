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
    # MYSQL DATABASE
    # =====================================================
    #
    # Supports both:
    #
    # Local .env:
    # MYSQL_HOST
    # MYSQL_PORT
    # MYSQL_USER
    # MYSQL_PASSWORD
    # MYSQL_DB
    #
    # Railway:
    # MYSQLHOST
    # MYSQLPORT
    # MYSQLUSER
    # MYSQLPASSWORD
    # MYSQLDATABASE
    #
    # =====================================================

    MYSQL_HOST = os.getenv(
        "MYSQL_HOST",
        os.getenv(
            "MYSQLHOST",
            "localhost"
        )
    )


    MYSQL_PORT = os.getenv(
        "MYSQL_PORT",
        os.getenv(
            "MYSQLPORT",
            "3306"
        )
    )


    MYSQL_USER = os.getenv(
        "MYSQL_USER",
        os.getenv(
            "MYSQLUSER",
            "root"
        )
    )


    MYSQL_PASSWORD = os.getenv(
        "MYSQL_PASSWORD",
        os.getenv(
            "MYSQLPASSWORD",
            ""
        )
    )


    MYSQL_DB = os.getenv(
        "MYSQL_DB",
        os.getenv(
            "MYSQLDATABASE",
            "turfx"
        )
    )


    # =====================================================
    # SQLALCHEMY
    # =====================================================

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://"
        f"{MYSQL_USER}:"
        f"{MYSQL_PASSWORD}"
        f"@{MYSQL_HOST}:"
        f"{MYSQL_PORT}/"
        f"{MYSQL_DB}"
    )


    SQLALCHEMY_TRACK_MODIFICATIONS = False


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