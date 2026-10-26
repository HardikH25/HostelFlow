# HOSTELFLOW // SLA-Driven Issue Resolution Engine

> Enterprise-grade, real-time Hostel Management and Issue Escalation System built on the MERN stack with strict Role-Based Access Control (RBAC), SLA countdowns, and automated breach escalations.

---

## ⚡ Key Architectural Features

- **Automated SLA Countdown & Breach Engine**: Dynamic countdown timers on every ticket with active threshold alerts, pause-on-reply mechanics, and automated priority escalations via cron.
- **Warden Management Console**:
  - Live ticket triage and technician assignment with **Hostel Isolation** (Neeladri Hostel vs. Velankani Hostel).
  - SLA Resolution Deadline adjustment with quick presets (`+4h`, `+12h`, `+24h`, `+48h`), custom windows, and exact date/time pickers.
  - Provisoning new staff (Wardens & Technicians) with automated role/specialization normalization.
  - SLA Escalation Audit Trail logging all overrides and priority changes.
- **Real-Time Synchronization**: Full duplex WebSocket integration (`socket.io`) broadcasting ticket status transitions, assignments, SLA recalculations, and comment threads instantly.
- **Modern Dark & Neo-Brutalist UI**: High-contrast, tactile design system with clean state indicators, accessible forms, and rich micro-interactions.
- **Evidence & File Attachments**: Cloudinary-backed document and image upload system supporting JPEG, PNG, WEBP, and PDF files.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Socket.IO Client, Axios, Canvas Confetti.
- **Backend**: Node.js, Express.js (ESM), Socket.IO, Mongoose, JSON Web Tokens (JWT), Cloudinary, Multer, Node-cron.
- **Database**: MongoDB Atlas.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas database URI
- Cloudinary account credentials

### 1. Server Configuration
```bash
cd server
npm install
```
Create a `.env` file in `server/`:
```env
PORT=5005
dbURL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
COOKIE_SECURE=false

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Run the backend dev server:
```bash
npm run dev
```

### 2. Client Configuration
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 👥 Default Seed Roles & Accounts

| Role | Email | Password | Scope |
|------|-------|----------|-------|
| **Warden** | `surender@scaler.com` | `12345678` | Neeladri Hostel Administration |
| **Warden** | `dharmendra@scaler.com`| `12345678` | Velankani Hostel Administration |
| **Student** | `hardik@gmail.com` | `12345678` | Neeladri Hostel, Room A2-10 |

---

## 🔒 Security & RBAC Policies
- Passwords hashed using `bcryptjs` with salt factor 10.
- Protected routes guarded with JWT HTTP-only cookies and token authorization headers.
- Granular permissions enforced at the middleware layer (`verifyRole`, `verifyTicketAccess`).
- Multi-hostel isolation strictly separating student reports and staff assignment lists.
