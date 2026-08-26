# 🗄️ MySQL Database & Tables Inspection Guide

This guide explains how to view, manage, and inspect your MySQL database and tables for the **ReachInbox Email Scheduler** project.

---

## 📌 Database Connection Details

- **DBMS**: MySQL 8.0
- **Database Name**: `reachinbox`
- **Host**: `127.0.0.1` (or `localhost`)
- **Port**: `3307` (or `3306`)
- **User**: `root`
- **Password**: *(blank / no password)*

---

## 🚀 Method 1: Prisma Studio Web GUI (Recommended)

Prisma Studio provides an interactive, visual web interface to browse and edit all your MySQL tables.

### Steps:
1. Open terminal in `backend/`:
   ```bash
   cd backend
   npx prisma studio
   ```
2. Open your web browser at **`http://localhost:5555`**.
3. Select any table to inspect data:
   - **`ScheduledEmail`**: Recipient, subject, scheduledFor timestamp, status (`SCHEDULED`, `PROCESSING`, `SENT`, `FAILED`), previewUrl.
   - **`Campaign`**: Subject, body, startTime, delayBetweenEmails, hourlyLimit, totalRecipients.
   - **`User`**: Google ID, email, name, avatar.
   - **`SenderAccount`**: Ethereal SMTP username, host, port.

---

## 💻 Method 2: MySQL Terminal CLI

Connect to your MySQL database using the terminal:

```bash
mysql -u root --host=127.0.0.1 --port=3307 reachinbox
```

### Useful SQL Queries:

#### View all tables in `reachinbox`:
```sql
SHOW TABLES;
```

#### View scheduled & sent emails log:
```sql
SELECT id, recipient, subject, scheduledFor, status, previewUrl FROM ScheduledEmail ORDER BY createdAt DESC;
```

#### View email campaigns created:
```sql
SELECT id, subject, totalRecipients, startTime, delayBetweenEmails, hourlyLimit FROM Campaign;
```

#### View logged-in user profile:
```sql
SELECT id, email, name, googleId FROM User;
```

---

## 🛠️ Method 3: Database GUI Clients

You can connect any database client software:

- **TablePlus**
- **DBeaver**
- **MySQL Workbench**

### Configuration:
- **Host**: `127.0.0.1`
- **Port**: `3307`
- **User**: `root`
- **Password**: *(leave empty)*
- **Database**: `reachinbox`
