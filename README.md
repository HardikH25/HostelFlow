# HostelFlow - SLA-Driven Issue Resolution & Governance Engine

> **An enterprise-grade, real-time Service Level Agreement (SLA) governance and maintenance tracking platform built for Scaler School of Technology (SST) student hostels.**

[![Live Frontend](https://img.shields.io/badge/Live%20App-hostel--flow--eta.vercel.app-3fd6c6?style=for-the-badge&logo=vercel&logoColor=white)](https://hostel-flow-eta.vercel.app)
[![Live Backend](https://img.shields.io/badge/Backend%20API-hostelflow--xdvr.onrender.com-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://hostelflow-xdvr.onrender.com/health)
[![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Socket.IO-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://github.com/HardikH25/HostelFlow)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)

---

## 📌 Problem Statement

In student residential campuses—specifically across Scaler School of Technology's **Neeladri** and **Velankani** hostels—infrastructure maintenance operations historically rely on scattered WhatsApp messages, verbal complaints at reception desks, or unstructured Google Sheets.

This operational model breaks down in three critical ways:

1. **Zero Accountability & Indefinite Deadlines**: Maintenance requests remain unresolved for days or weeks because tickets lack an enforceable resolution window or escalation pathway.
2. **Communication Black Hole**: Students have no visibility into ticket progress, whether spare parts have been ordered, or when a technician will arrive, leading to repetitive manual inquiries.
3. **Cross-Hostel Resource Fragmentation**: Maintenance technicians frequently get dispatched across different buildings without geographical isolation, leading to misrouted tasks, wasted travel time, and dropped repairs.

---

## 🎯 Target Users & Persona Matrix

| User Persona | Scope & Environment | Core Capabilities & Permissions |
| :--- | :--- | :--- |
| **Students** | Room & Personal Tickets (SST Hostels) | • Lodge categorized maintenance tickets with photo/document evidence.<br>• Monitor dynamic ticking SLA countdown clocks.<br>• Engage in real-time ticket discussions.<br>• Verify issue resolutions and view technician assignments. |
| **Hostel Wardens** (Admins) | Building & Campus Level (Neeladri / Velankani) | • Real-time triage board with status, category, and hostel filters.<br>• Assign technicians strictly within the corresponding hostel building.<br>• Extend or override SLA deadlines with mandatory audit logging.<br>• Onboard new wardens and technicians with automated credential generation.<br>• Monitor institutional compliance rates and breach analytics. |
| **Technicians** (Staff) | Assigned Building Work Queue (Plumbing, Electrical, Carpentry) | • View building-scoped active work orders with room numbers and student contacts.<br>• Post private internal diagnostic notes (visible only to staff).<br>• Request student clarification (automatically pausing the SLA timer).<br>• Advance ticket lifecycle through resolution. |

---

## 💡 Solution: The SLA State Machine

**HostelFlow** replaces ad-hoc complaints with an **SLA-governed state machine**. 

Every raised complaint is classified by **Category** (Electrical, Plumbing, Carpentry, Appliance, Network) and **Priority** (Low, Medium, High, Critical), automatically establishing a binding target resolution deadline.

```text
                               ┌─────────────────────────────────┐
                               │   Student Submits Complaint     │
                               │  (Category, Priority, Evidence) │
                               └────────────────┬────────────────┘
                                                │
                                                ▼
                               ┌─────────────────────────────────┐
                        ┌─────►│          Status: 'Open'         │
                        │      │   SLA Timer Starts Ticking      │
                        │      └────────────────┬────────────────┘
                        │                       │
           Warden Unassigns                     ▼
                        │      ┌─────────────────────────────────┐
                        └──────┤        Status: 'Assigned'       │
                               │   Technician Dispatched (Same)  │
                               └────────┬───────────────┬────────┘
                                        │               │
                 Technician Requests Info               │ Fixed
                                        │               │ Before
                                        ▼               │ Deadline
                      ┌───────────────────────────────────┐     │
                      │  Status: 'Awaiting-Student-Reply' │     │
                      │   ⏸️ SLA TIMER PAUSED             │     │
                      └─────────────────┬─────────────────┘     │
                                        │                       │
                          Student Replies in Thread             │
                                        │                       │
                                        ▼                       │
                      ┌───────────────────────────────────┐     │
                      │   ▶️ SLA TIMER RESUMED            │     │
                      │  (Recalculated with remaining ms) │     │
                      └─────────────────┬─────────────────┘     │
                                        │                       │
                                        ▼                       ▼
   ┌───────────────────────────────────────────┐    ┌─────────────────────────┐
   │        Deadline Reaches 00:00:00          │    │   Status: 'Resolved'    │
   │  - Background Cron audits ticket          │    │  - Clock stops          │
   │  - Flags 'slaBreached = true'             │    │  - 100% SLA Compliant   │
   │  - Escalates alert to Warden Console      │    │  - Confetti celebration │
   └───────────────────────────────────────────┘    └─────────────────────────┘
```

---

## ⚡ Key Features & Engineering Workflows

### 1. Dynamic SLA Countdown Engine with State Preservation
- **Real-Time Ticking Timers**: Every ticket calculates a remaining resolution window down to the second, rendering high-contrast countdown badges across dashboards.
- **Pause & Resume Logic**: When staff change status to `Awaiting-Student-Reply`, the engine stores `slaPausedAt` and freezes `slaRemainingMs`. Once the student responds in the comment thread, the deadline is recalculated forward in time and the clock resumes.
- **Autonomous Background Cron (`slaCron.js`)**: A resilient `node-cron` daemon sweeps all active tickets every 60 seconds, detecting overdue deadlines and setting `slaBreached: true` without requiring client page reloads.

### 2. Multi-Hostel Isolation & Scoped RBAC
- **Architectural Boundary**: Strict partition between **Neeladri Hostel** and **Velankani Hostel**.
- **Geographic Staff Scoping**: Technicians registered to Neeladri cannot be assigned to Velankani tickets. Validation occurs at the database controller level, rejecting cross-hostel misallocations.
- **Granular Middleware**: Route protection enforced using `verifyRole('Warden')` and `verifyTicketAccess` middlewares to guarantee students only see their own tickets while wardens retain global operational visibility.

### 3. Warden Management & Governance Console
- **Unified Operational Board**: Interactive ticket management matrix with quick filters by status, urgency, hostel, and breach state.
- **Target Deadline Adjustment**: Wardens can adjust SLA target deadlines using quick presets (`+4h`, `+12h`, `+24h`, `+48h`) or custom date-time pickers. All overrides append an immutable audit log entry.
- **Staff Provisioning**: Administrative onboarding allowing Wardens to provision new Technician and Warden accounts with role-based location tags.

### 4. 3-Way Threaded Discussion with Privacy Filtering
- **Duplex Ticket Chat**: Real-time comment threads connecting Student, Warden, and Assigned Technician.
- **Staff-Only Internal Notes**: Wardens and Technicians can post internal diagnostic notes (`isInternal: true`) for technical analysis, parts ordering, or vendor coordination.
- **Privacy Filter Middleware**: The database controller automatically filters out internal notes from student API payloads, ensuring staff communications remain confidential.

### 5. Media Attachments & Institutional Compliance Analytics
- **Cloudinary Direct Streaming**: Document and image uploads (JPEG, PNG, WEBP, PDF) streamed directly into cloud storage via Multer memory buffers.
- **Compliance Metrics Engine**: Real-time institution-wide analytics computing total volume, active tickets, breach rates, and overall SLA compliance percentages.

---

## 🏗️ System Architecture & Infrastructure Topology

```text
[ CLIENT TIER ]
   │
   ├── Vercel Edge Network (https://hostel-flow-eta.vercel.app)
   │     ├── React 19 Single Page Application (SPA)
   │     ├── Vite Build Engine (Chunk Splitting & Minification)
   │     ├── Tailwind CSS v4 Neo-Brutalist / Modern Dark Design System
   │     ├── Socket.IO Client (Auto-reconnection & Polling Handshake)
   │     └── SPA Rewrite Engine (vercel.json -> /index.html)
   │
[ NETWORK LAYER ]
   │  HTTPS REST Calls (Axios with Credentials)
   │  WSS Full-Duplex WebSockets (Socket.IO Rooms: ticket:<id>, role:Warden)
   │
[ APPLICATION TIER ]
   │
   ├── Render Web Service (https://hostelflow-xdvr.onrender.com)
   │     ├── Node.js (v18+ ESM) + Express.js API
   │     ├── Helmet Security Headers & Dynamic CORS Whitelist
   │     ├── JWT Stateless Authentication (SameSite=None, Secure Cookies)
   │     ├── SLA State Machine Controller (Pause / Resume / Recalculate)
   │     ├── Multi-Hostel Isolation Layer (Neeladri vs. Velankani Guard)
   │     ├── Background Cron Sweeper (node-cron: 60s breach audit daemon)
   │     └── Multer Memory Buffer Streamer
   │
[ PERSISTENCE & STORAGE TIER ]
   │
   ├── MongoDB Atlas (Replica Set Cluster)
   │     ├── Users Collection (Role-indexed, hostel-scoped, bcrypt salted)
   │     ├── Tickets Collection (SLA deadlines, audit trail, indexed queries)
   │     └── Comments Collection (isInternal privacy flag, sender relations)
   │
   └── Cloudinary CDN Storage
         └── Evidence Photos, Receipts, and Technical Schematics (PDF/Images)
```

---

## 🛠️ Tech Stack & Engineering Rationale

| Layer | Technologies | Engineering Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19, Vite** | Sub-millisecond HMR during development and optimized tree-shaken static production bundles. |
| **Styling & Design** | **Tailwind CSS v4** | Consistent, low-overhead design tokens supporting high-contrast dark theme and responsive cards. |
| **Backend Runtime** | **Node.js, Express.js (ESM)** | Asynchronous, non-blocking I/O ideal for handling concurrent REST requests and persistent WebSocket connections. |
| **Real-Time Duplex** | **Socket.IO (v4)** | Low-latency bi-directional messaging with fallback transports, rooms, and targeted role broadcasting. |
| **Database** | **MongoDB Atlas, Mongoose (v8)** | Flexible document schema capable of housing dynamic ticket audit logs, nested staff profiles, and rich query indexing. |
| **Scheduling** | **Node-cron** | Autonomous in-process background daemon executing 60-second sweeps for SLA breach detection. |
| **File Storage** | **Cloudinary, Multer** | Zero-disk-footprint streaming of evidence images and documents to a globally distributed media CDN. |
| **Security & Auth** | **JWT, Bcrypt.js, Helmet** | Stateless token auth with HTTP-only cross-domain cookies and salted password hashing (factor 10). |

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- Active **MongoDB Atlas** connection URI
- **Cloudinary** developer account credentials

### 1. Clone Repository & Setup Backend
```bash
# Clone the repository
git clone https://github.com/HardikH25/HostelFlow.git
cd HostelFlow/server

# Install backend dependencies
npm install

# Configure environment variables
cp .env.example .env
# Fill in your dbURL, JWT_SECRET, and Cloudinary credentials in server/.env

# Start development server
npm run dev
# Server listening on http://localhost:5005
```

### 2. Setup Frontend Client
```bash
# Navigate to client directory
cd ../client

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
# Client active on http://localhost:5173
```

---

## 👥 Seed Accounts for Evaluation & Testing

The system comes pre-seeded with accounts configured across both hostels and all roles:

| Role | Email | Password | Assigned Hostel Scope | Operational Context |
| :--- | :--- | :--- | :--- | :--- |
| **Warden** | `surender@scaler.com` | `12345678` | Neeladri Hostel | Triage console, technician assignment, deadline overrides |
| **Warden** | `sunil@scaler.com` | `12345678` | Velankani Hostel | Velankani building administration & staff onboarding |
| **Student** | `hardik@gmail.com` | `12345678` | Neeladri Hostel (Room A2-10) | Lodge complaints, view live countdown clock, chat with staff |
| **Technician** | `ramesh.work@gmail.com` | `12345678` | Neeladri Hostel (Plumbing) | View assigned tasks, post diagnostic internal notes, advance status |

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
PORT=5005
CLIENT_URL=https://hostel-flow-eta.vercel.app
NODE_ENV=production

# Database
dbURL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hostel_sla_db?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_jwt_secret_key_scaler_2026
COOKIE_SECURE=true

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend (`client/.env`)
```env
VITE_API_URL=https://hostelflow-xdvr.onrender.com
```

---

## 🌐 Production Deployment

| Asset | Deployment Provider | Production URL |
| :--- | :--- | :--- |
| **Live Web Application** | **Vercel** | [https://hostel-flow-eta.vercel.app](https://hostel-flow-eta.vercel.app) |
| **Backend REST & WebSocket API** | **Render** | [https://hostelflow-xdvr.onrender.com](https://hostelflow-xdvr.onrender.com) |
| **API Health Status** | **Render** | [https://hostelflow-xdvr.onrender.com/health](https://hostelflow-xdvr.onrender.com/health) |
| **Source Code Repository** | **GitHub** | [https://github.com/HardikH25/HostelFlow](https://github.com/HardikH25/HostelFlow) |
| **Demo Video (3–5 Minutes)** | **Public Link** | *[Insert Loom / YouTube / Drive link here]* |

---

## 📄 License

This software is developed and maintained as the End-Term Software Engineering Project for **Scaler School of Technology (SST)**. Licensed under the [MIT License](LICENSE).
