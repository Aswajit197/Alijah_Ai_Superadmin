# How to Run: Elijah AI SuperAdmin Frontend (Platform Operations Console)

The **SuperAdmin Frontend** is the central administration portal for the Elijah AI platform. Platform administrators use this portal to provision and manage contractor tenants (companies), monitor multi-tenant usage and billing, manage dynamic RBAC roles, configure system-wide permissions, and monitor platform health.

---

## 1. Quick Specifications

- **Framework:** Next.js 14 (App Router) + React 18 + Tailwind CSS
- **Default Port:** `3001` (`http://localhost:3001`)
- **Key Integrations:**
  - Elijah Backend SuperAdmin API (`http://localhost:5000/api/v1/super`)

---

## 2. Prerequisites

1. **Node.js**: v18.17.0+ or v20+ installed.
2. **Backend API**: The Elijah Core Backend (`http://localhost:5000`) must be running with the SuperAdmin seed account created (`npm.cmd run prisma:seed` in the `backend` folder).

---

## 3. Environment Configuration

Check or create the file `superadmin-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## 4. Installation & Startup

Open a terminal in `d:\PODS\ElijahAi\superadmin-frontend`:

### Step 1: Install Dependencies
```powershell
# On Windows PowerShell:
npm.cmd install

# On macOS/Linux:
npm install
```

### Step 2: Start the Development Server
```powershell
# On Windows PowerShell:
npm.cmd run dev

# On macOS/Linux:
npm run dev
```

The application will start at **`http://localhost:3001`**.

---

## 5. SuperAdmin Login Credentials

Navigate to **`http://localhost:3001/login`** and log in with the platform administrator credentials:

| Field | Value |
|---|---|
| **Email** | `superadmin@elijah.ai` |
| **Password** | `SuperSecretPassword123!` |
| **Role** | Platform SuperAdmin |

---

## 6. Key Pages & Features

| Page Route | Purpose | Key Operations |
|---|---|---|
| `http://localhost:3001/login` | SuperAdmin Auth | Secure authentication and platform session issuance. |
| `http://localhost:3001/` | Platform Dashboard | System-wide metrics, active tenant count, AI call volume, revenue, and infrastructure health. |
| `http://localhost:3001/tenants` | Tenant Management | View registered contractor companies, create/provision new tenants, suspend/activate companies, and inspect tenant settings. |
| `http://localhost:3001/roles` | Dynamic RBAC & Permissions | Global permission definitions (30+ permissions across dispatch, CRM, finance, pricing, AI configurations, and audit logs). |
| `http://localhost:3001/billing` | Multi-Tenant Billing | Monthly contractor subscription tracking, telephony usage, and gross profit analytics. |
| `http://localhost:3001/system` | System & Telephony Health | Status of Retell, Twilio carriers, PostgreSQL database, and microservice connectivity. |

---

## 7. Build for Production

```powershell
npm.cmd run build
npm.cmd run start
```
Runs production Next.js build on port 3001.
