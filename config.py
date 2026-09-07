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
    # DATABASE CONFIGURATION
    # =====================================================
    #
    # Supports:
    # 1. Full connection string: DATABASE_URL (Render, Railway, Aiven, etc.)
    # 2. Individual variables: MYSQL_HOST, MYSQL_PORT, MYSQL_USER, etc.
    # 3. Railway variables: MYSQLHOST, MYSQLPORT, MYSQLUSER, etc.
    #
    # =====================================================

    DATABASE_URL = os.getenv("DATABASE_URL")

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
    # SQLALCHEMY URI RESOLUTION
    # =====================================================

    _connect_args = {}

    if DATABASE_URL:
        # Standardize scheme for SQLAlchemy + PyMySQL
        if DATABASE_URL.startswith("mysql://"):
            DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)
        elif DATABASE_URL.startswith("postgres://"):
            DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

        # PyMySQL requires SSL configuration via connect_args dict rather than string query params
        if "ssl-mode=" in DATABASE_URL or "ssl_mode=" in DATABASE_URL or "ssl=" in DATABASE_URL:
            import re
            _connect_args["ssl"] = {"check_hostname": False}
            DATABASE_URL = re.sub(r"[?&]ssl[-_]mode=[^&]+", "", DATABASE_URL)
            DATABASE_URL = re.sub(r"[?&]ssl=[^&]+", "", DATABASE_URL)

        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://"
            f"{MYSQL_USER}:"
            f"{MYSQL_PASSWORD}"
            f"@{MYSQL_HOST}:"
            f"{MYSQL_PORT}/"
            f"{MYSQL_DB}"
        )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Production connection pool settings to prevent stale/dropped connections
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 280,
        "pool_pre_ping": True,
    }
    if _connect_args:
        SQLALCHEMY_ENGINE_OPTIONS["connect_args"] = _connect_args


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