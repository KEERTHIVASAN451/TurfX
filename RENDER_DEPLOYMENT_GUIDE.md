# 🚀 TurfX - Complete Render Deployment Guide

This guide walks you step-by-step through deploying your **TurfX** project to **Render** for free.

---

## 📋 Overview of What We Configured

1. **Safety Backup**: Created a full backup at `TurfX_backup_20260907`.
2. **Universal Database Compatibility**: Updated `config.py` to support `DATABASE_URL` (standard on Render/Aiven/Railway/TiDB), with automatic SSL and connection pooling (`pool_pre_ping=True`) to prevent cloud connection drops.
3. **Optimized Linux/Render Dependencies**: Fixed `requirements.txt` (UTF-8 encoding, removed C-compiler dependent `mysqlclient` and `Flask-MySQLdb`, added `cryptography` for cloud MySQL authentication, ensured `gunicorn` is ready).
4. **Auto-Initialization**: App automatically initializes tables on startup; added `init_db.py` for manual/cli initialization.
5. **Render Blueprint & Procfile**: Added `render.yaml`, `Procfile`, `build.sh`, and `.env.example`.

---

## Step 1: Get a Free Cloud MySQL Database (2 Minutes)

Since Render does not provide a free MySQL database (Render only provides PostgreSQL), you can use any free cloud MySQL provider. Here are the two best, completely free options:

### Option A: Aiven (Recommended - Free MySQL 5GB)
1. Go to [aiven.io](https://aiven.io/) and create a free account.
2. Click **Create Service** > Select **MySQL**.
3. Choose the **Free Tier** plan.
4. Once created, in the service overview, copy the **Service URI** (looks like: `mysql://avnadmin:xxxx@mysql-xxx.aivencloud.com:xxxxx/defaultdb?ssl-mode=REQUIRED`).
5. This URI is your `DATABASE_URL`!

### Option B: TiDB Cloud Serverless (Free MySQL-compatible 5GB)
1. Go to [tidbcloud.com](https://tidbcloud.com/) and sign up.
2. Create a free **Serverless Cluster**.
3. Click **Connect** > select **PyMySQL** or **SQLAlchemy**.
4. Copy the connection string to use as `DATABASE_URL`.

---

## Step 2: (Optional) Import Database Schema

To import all tables and roles into your cloud MySQL database:
- In Aiven or TiDB Cloud, open their Web SQL Query Editor or connect with MySQL Workbench / DBeaver.
- Copy and run the contents of `database/turfx.sql`.
- Or, just let the app run `init_db.py` or start up — it will automatically create all SQLAlchemy tables for you!

---

## Step 3: Push Changes to GitHub

Open a terminal in your `TurfX` folder and push your updated configuration to GitHub:

```bash
git add .
git commit -m "Prepare TurfX for Render deployment"
git push origin main
```

---

## Step 4: Create the Web Service on Render

1. Go to [dashboard.render.com](https://dashboard.render.com/) and sign in.
2. Click the **"New +"** button in the top right, and select **"Web Service"**.
3. Select **"Build and deploy from a Git repository"** and connect your GitHub repository (`TurfX`).
4. Configure the service settings:
   - **Name**: `turfx` (or any name you prefer)
   - **Region**: Choose the region closest to your users (e.g., Singapore, Frankfurt, Oregon, Ohio).
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt` (or `chmod +x build.sh && ./build.sh`)
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: `Free`

---

## Step 5: Configure Environment Variables on Render

Scroll down to the **Environment Variables** section on Render and add the following keys:

| Key | Value | Description |
|---|---|---|
| `SECRET_KEY` | *(Click "Generate" or enter a random string)* | Flask session encryption |
| `DATABASE_URL` | `mysql://user:pass@host:port/dbname?ssl-mode=REQUIRED` | Cloud MySQL connection string |
| `USER_ROLE_ID` | `2` | Default customer role ID |
| `ADMIN_ROLE_ID` | `1` | Admin role ID |
| `MAIL_SERVER` | `smtp.gmail.com` | SMTP server |
| `MAIL_PORT` | `587` | SMTP port |
| `MAIL_USE_TLS` | `true` | TLS flag |
| `MAIL_USERNAME` | `your-email@gmail.com` | Your Gmail address |
| `MAIL_PASSWORD` | `your-16-char-app-password` | Gmail App Password (not normal password) |
| `ADMIN_EMAIL` | `your-email@gmail.com` | Admin email address |
| `FLASK_DEBUG` | `false` | Disable debug mode in production |

*(Tip: You can also use Render's "Secret File" or bulk copy from `.env.example`)*

---

## Step 6: Deploy and Launch!

1. Click **"Deploy Web Service"** (or "Create Web Service").
2. Render will pull your repo, install dependencies, and start Gunicorn.
3. Once the deployment finishes, Render will provide your public URL:
   `https://turfx-xxxx.onrender.com`
4. Click the link to view your live application!

---

## 🛠 Troubleshooting & Tips

- **Free Tier Sleep/Wakeup**: On Render's Free tier, services spin down after 15 minutes of inactivity. The first request after sleep may take ~30-50 seconds to boot up.
- **Gmail App Password**: For OTP and booking emails to send, enable 2-Factor Authentication on your Google Account and generate an **App Password** (Google Account > Security > 2-Step Verification > App Passwords).
- **Checking Logs**: In the Render dashboard, click **"Logs"** to see live server output, request logs, and error messages.
