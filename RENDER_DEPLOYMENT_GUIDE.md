# 🚀 TurfX - Complete Render & MongoDB Atlas Deployment Guide

TurfX is now fully integrated with **MongoDB Atlas** and ready for deployment on **Render**.

---

## 📋 Overview of What We Configured

1. **MongoDB Atlas Integration**: Migrated the database layer to MongoDB Atlas using MongoEngine with auto-increment integer IDs (`SequenceField`). All routes (`/turf/<int:turf_id>`) and templates work seamlessly without modification.
2. **Safety Backup**: Complete original project backup preserved at `TurfX_backup_20260907`.
3. **Render Configuration**:
   - `render.yaml` (Render Blueprint configured for Python 3 & Gunicorn).
   - `Procfile` (`web: gunicorn app:app`).
   - `requirements.txt` (Optimized with `mongoengine`, `pymongo`, `dnspython`, `gunicorn`).
   - `init_db.py` (Automatic MongoDB collection setup and admin seeder).

---

## Step 1: Verify Your MongoDB Atlas Cluster

Your MongoDB Atlas cluster is already active and connected:
- **Cluster**: `turfx-booking.o64agpk.mongodb.net`
- **Database**: `turfx`
- **User**: `kv0939169_db_user`
- **URI**: `mongodb+srv://kv0939169_db_user:HOCLrddiK8iliBE5@turfx-booking.o64agpk.mongodb.net/turfx?retryWrites=true&w=majority`

> **Note**: In MongoDB Atlas, make sure Network Access allows Render:
> 1. Go to [cloud.mongodb.com](https://cloud.mongodb.com/) > **Network Access**.
> 2. Ensure `0.0.0.0/0` (Allow Access from Anywhere) is added to the IP Access List so Render can connect.

---

## Step 2: Push Changes to GitHub

Push the updated MongoDB Atlas configuration to your GitHub repository:

```bash
git add .
git commit -m "Migrate TurfX database layer to MongoDB Atlas"
git push origin main
```

---

## Step 3: Deploy on Render

1. Go to [dashboard.render.com](https://dashboard.render.com/) and log in.
2. Click **"New +"** (top right) > **"Web Service"**.
3. Select your repository: `KEERTHIVASAN451/TurfX`.
4. Configure service settings:
   - **Name**: `turfx`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: `Free`

---

## Step 4: Add Environment Variables on Render

In the **Environment** tab on Render, add these variables:

| Key | Value | Description |
|---|---|---|
| `SECRET_KEY` | *(Click "Generate" or type a random string)* | Flask session security |
| `MONGODB_URI` | `mongodb+srv://kv0939169_db_user:HOCLrddiK8iliBE5@turfx-booking.o64agpk.mongodb.net/turfx?retryWrites=true&w=majority` | Your MongoDB Atlas connection URI |
| `MONGODB_DB` | `turfx` | Database name |
| `USER_ROLE_ID` | `2` | Customer role ID |
| `ADMIN_ROLE_ID` | `1` | Admin role ID |
| `MAIL_SERVER` | `smtp.gmail.com` | SMTP server |
| `MAIL_PORT` | `587` | SMTP port |
| `MAIL_USE_TLS` | `true` | TLS flag |
| `MAIL_USERNAME` | `kv0939169@gmail.com` | Gmail address |
| `MAIL_PASSWORD` | `bglnslxkxgsqguqi` | Gmail App Password |
| `ADMIN_EMAIL` | `kv0939169@gmail.com` | Admin email |
| `FLASK_DEBUG` | `false` | Disable debug in production |

---

## Step 5: Launch!

1. Click **"Deploy Web Service"**.
2. Render will build the environment, connect to MongoDB Atlas, and start the Gunicorn server.
3. Your live application will be available at:
   `https://turfx-xxxx.onrender.com`

---

## 🔑 Default Admin Account
- **Email**: `kv0939169@gmail.com`
- **Password**: `Admin@12345`
