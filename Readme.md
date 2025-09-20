# 📌 Role-Based File Management & Subscription API

This project implements a **role-based authentication and authorization system** with support for file management and subscription plans.  
The system is divided into multiple roles:

- **Super Admin** – manages Admins and subscription plans.  
- **Admin** – manages Managers and subscribes to plans.  
- **Manager** – manages Users and handles file requests.  
- **User** – uploads and manages files.  

---

## 🚀 Features

- JWT-based authentication (`ProtectRoute` middleware).  
- Role-specific routes and permissions.  
- File upload, download, and deletion.  
- Subscription system with Razorpay integration.  
- Super Admin control over Admin approvals and plan creation.  

---

## 📂 API Endpoints

### 🔑 Authentication (`/api/auth`)

| Method | Endpoint | Protected | Body | Description |
|--------|----------|-----------|------|-------------|
| **POST** | `/login` | ❌ | `{ email, password, role }` | Login for all roles. |
| **POST** | `/me` | ✅ | – | Get logged-in user details. |
| **POST** | `/createuser` | ✅ (Manager) | `{ username, email, password }` | Manager creates a new user. |
| **POST** | `/adminsignup` | ❌ | `{ company_name, email, password }` | Super Admin registers a new Admin. |
| **POST** | `/createmanager` | ✅ (Admin) | `{ username, email, password, max_users }` | Admin creates a Manager. |
| **POST** | `/createadmin` | ✅ (Super Admin) | `{ company_name, email, password }` | Super Admin creates an Admin. |

---

### 🏢 Admin (`/api/admin`)

> Requires **Admin authentication**

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| **GET** | `/getusers` | – | Get all users under the Admin. |
| **GET** | `/getmanagers` | – | Get all managers under the Admin. |
| **GET** | `/user/:id` | – | Get a specific user’s files/info by ID. |

---

### 📂 File Management (`/api/file`)

> Requires **authentication**

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| **POST** | `/upload` | `multipart/form-data → { file }` | Upload a file. |
| **GET** | `/download/:id` | – | Download a file by ID. |
| **DELETE** | `/delete/:id` | – | Delete a file by ID. |

---

### 👨‍💼 Manager (`/api/manager`)

> Requires **Manager authentication**

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| **GET** | `/getusers` | – | Get all users under this Manager. |
| **GET** | `/pendingrequests` | – | Get all pending file requests. |
| **PUT** | `/filerequest/:id` | `{ action }` (`approved` or `rejected`) | Handle a file request. |

---

### 📦 Subscription (`/api/plan`)

> Requires **Admin authentication**

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| **GET** | `/getplans` | – | Get all subscription plans. |
| **POST** | `/subscribe` | `{ plan_id }` | Admin subscribes to a plan. |
| **POST** | `/verify` | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` | Verify payment for subscription. |

---

### 👑 Super Admin (`/api/superadmin`)

> Requires **Super Admin authentication**

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| **GET** | `/pendingadmins` | – | Get all admins with pending approval requests. |
| **GET** | `/getadmins` | – | Get all admins in the system. |
| **PUT** | `/adminrequest/:id` | `{ action }` (`approve` or `reject`) | Handle an admin approval request. |
| **POST** | `/createplan` | `{ plan_name, duration_days, max_managers, max_users_per_manager, max_files_per_user, price }` | Create a new subscription plan. |

---

### 👤 User (`/api/user`)

> Requires **User authentication**

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| **GET** | `/files` | – | Get all files uploaded by the logged-in User. |

---

## 🔐 Middleware

- **`ProtectRoute`** – Verifies JWT and ensures the user has permission to access the route.

---

## 🛠 Setup & Run

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd <project-folder>
