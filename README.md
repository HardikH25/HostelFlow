# HostelFlow

> **SLA-Driven Issue Resolution & Governance Platform for Scaler School of Technology (SST)**

---

## Problem Statement
In student hostels (specifically across SST's **Neeladri** and **Velankani** hostels), infrastructure issues like electrical failures, water leakages, Wi-Fi outages, and furniture damages are traditionally handled through informal WhatsApp groups, verbal complaints, or static spreadsheets.

This leads to:
- **No Accountability or Deadlines**: Maintenance requests remain pending indefinitely without clear resolution targets.
- **Lack of Transparency**: Students cannot track whether a technician has been dispatched, parts are ordered, or when work will finish.
- **Cross-Hostel Confusion**: Staff and technicians get misassigned to tasks in buildings they do not service, causing delay and dropped requests.

---

## Target Users
1. **Students (SST Hostels)**: Submit maintenance requests with evidence, track ticking countdown timers in real time, and communicate directly with assigned technicians.
2. **Hostel Wardens (Administration)**: Triage incoming tickets on an administrative console, assign technicians strictly within the corresponding hostel, adjust deadlines when necessary, and monitor SLA compliance metrics.
3. **Technicians (Maintenance Staff)**: View building-specific work queues, post internal diagnostic notes, update repair progress, and resolve tickets.

---

## Solution
**HostelFlow** transforms hostel complaint handling into an **SLA-governed state machine**:
- Every ticket receives an automated target resolution deadline calculated from its category and priority level.
- When staff request clarification from a student, the SLA timer **pauses**, resuming automatically once the student responds.
- If a deadline expires, an automated background cron daemon flags the ticket as **SLA Breached**, escalating it directly on the Warden's command console.
- Multi-hostel isolation ensures staff are only assigned to tickets within their designated building.

---

## Key Features
- **Dynamic SLA Countdown Engine**: Real-time ticking timers on all active tickets with automated breach detection.
- **SLA Pause & Resume Logic**: Timer pauses automatically when status is set to `Awaiting-Student-Reply` and resumes when the student replies.
- **Hostel Isolation & RBAC**: Strict separation between Neeladri Hostel and Velankani Hostel; technicians cannot be assigned outside their designated hostel.
- **Warden Management Console**: Comprehensive triage interface supporting technician assignment, status transitions, and deadline overrides with full audit logging.
- **3-Way Discussion Thread**: Real-time communication between Students, Wardens, and Technicians, including privacy-filtered staff internal notes.
- **File & Media Evidence**: Document and image uploads (PNG, JPEG, PDF) streamed directly to Cloudinary.
- **Institutional Compliance Analytics**: Real-time metrics tracking total issues, resolution counts, active breaches, and institutional SLA compliance percentage.

---

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Socket.IO Client, Axios, Canvas Confetti
- **Backend**: Node.js, Express.js (ESM), Socket.IO, Mongoose, Node-cron, Multer, Cloudinary, JWT, Bcrypt.js
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary (evidence documents and images)

---

## Architecture

### System Architecture Diagram
```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT (React 19 + Vite)                        │
│   - Student Dashboard                 - Warden Command Console         │
│   - Live Ticking SLA Timers           - 3-Way Threaded Discussion      │
└──────────────────────┬──────────────────────────────────▲──────────────┘
                       │ HTTP REST                        │ WebSocket (Socket.IO)
                       ▼                                  │ Real-time Events
┌─────────────────────────────────────────────────────────┴──────────────┐
│                    BACKEND API (Node.js + Express ESM)                 │
│   - JWT Auth & RBAC Middleware        - SLA State Machine Logic        │
│   - Multi-Hostel Isolation Logic      - Privacy-Filtered Discussions   │
│   - Direct Cloudinary Streamer        - 60-Second Background Cron Audit│
└──────────────┬────────────────────────┬─────────────────┬──────────────┘
               ▼                        ▼                 ▼
     ┌───────────────────┐    ┌───────────────────┐  ┌───────────────────┐
     │   MongoDB Atlas   │    │    Cloudinary     │  │  Background Cron  │
     │ Tickets, Users,   │    │ Evidence images   │  │ Sweeps & detects  │
     │ Comments, Audits  │    │ & documents       │  │ breaches every 60s│
     └───────────────────┘    └───────────────────┘  └───────────────────┘
```

### SLA State Machine Flow
```text
[ Ticket Created ]
        │
        ▼
   Status: 'Open' ──────────────► [ Automated SLA Countdown Starts ]
        │
        ├──────────────────────────────────────────┐
        ▼                                          ▼
[ Warden Assigns Technician ]           [ Staff Requests Info ]
  - Enforces same hostel check            - Status: 'Awaiting-Student-Reply'
  - Status: 'Assigned'                    - ⏸️ SLA Timer PAUSES
        │                                          │
        ▼                                          ▼
[ Work in Progress ]                    [ Student Replies in Chat ]
  - Status: 'Assigned'                    - ▶️ SLA Timer RESUMES
        │                                          │
        ├──────────────────────────────────────────┘
        │
   ┌────┴────────────────────────┐
   ▼                             ▼
[ Resolved Before Deadline ]   [ Deadline Reaches 00:00:00 ]
  - Status: 'Resolved'           - Cron detects breach
  - SLA Met: Compliant           - Flag: 'slaBreached = true'
  - Clock stops                  - Escalates on Warden dashboard
```

---

## Local Setup

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- MongoDB Atlas connection URI

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```
Backend runs on `http://localhost:5005`.

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

### 3. Test Credentials
| Role | Email | Password | Designated Hostel |
| :--- | :--- | :--- | :--- |
| **Warden** | `surender@scaler.com` | `12345678` | Neeladri Hostel |
| **Warden** | `sunil@scaler.com` | `12345678` | Velankani Hostel |
| **Student** | `hardik@gmail.com` | `12345678` | Neeladri Hostel, Room A2-10 |
| **Technician** | `ramesh.work@gmail.com` | `12345678` | Neeladri Hostel (Plumbing) |

---

## Environment Variables

### Backend Configuration (`server/.env`)
```env
PORT=5005
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Database
dbURL=your_mongodb_atlas_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key
COOKIE_SECURE=false

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend Configuration (`client/.env`)
```env
VITE_API_URL=http://localhost:5005
```

---

## Deployment
- **GitHub Repository**: [https://github.com/HardikH25/HostelFlow](https://github.com/HardikH25/HostelFlow)
- **Live Application**: [https://hostel-flow-eta.vercel.app](https://hostel-flow-eta.vercel.app)
- **Backend API**: [https://hostelflow-xdvr.onrender.com](https://hostelflow-xdvr.onrender.com)
- **Demo Video**: *[Insert 3–5 minute video link here]*
