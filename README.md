# Blog API

A full-stack blogging ecosystem consisting of a RESTful API and two distinct clients: a **Reader App** for the public and an **Author Dashboard** for content management.

## 🏗️ Architecture

- **Backend:** Node.js, Express, Prisma ORM (PostgreSQL/Supabase)
- **Authentication:** JWT (JSON Web Tokens) with Passport.js
- **Frontend:** React
- **Deployment:** Render (API), Netlify (Clients)

---

## 🛠️ Project Structure

This project is organized as a **monorepo** for easier local development:

```text
.
├── api/                 # Express backend & Prisma schema
├── client-reader/      # Public-facing blog site
└── client-author/      # Protected authoring dashboard
```

---

## 💾 Database Schema (Prisma)

The core data model focuses on relational integrity:

- **User:** Handles authentication and identifies authors.
- **Post:** Stores content with a `published` toggle for draft management.
- **Comment:** Linked to specific posts and optional user accounts.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or Supabase)

### 2. Installation
```bash
# Clone the repository
git clone [https://github.com/yourusername/blog-api.git](https://github.com/yourusername/blog-api.git)
cd blog-api

# Install dependencies for the API
cd api
npm install

# Setup environment variables
cp .env.example .env
```

### 3. Database Migration
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Running the Project
```bash
# Start the API
npm run dev
```

---

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/auth/login` | Returns JWT on successful login |
| POST | `/auth/signup` | Create a new author/user |

### Posts
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/posts` | Get all published posts | No |
| GET | `/posts/:id` | Get single post & comments | No |
| POST | `/posts` | Create a new post (Draft) | Yes |
| PUT | `/posts/:id` | Update post / Toggle Publish | Yes |
| DELETE| `/posts/:id` | Remove a post | Yes |

---

## 📝 Learning Objectives Completed
- [x] Designing relational schemas with **Prisma**.
- [x] Implementing **JWT** authentication via the `Authorization: Bearer` header.
- [x] Building **RESTful** controllers for CRUD operations.
- [x] Managing **CORS** for communication between different domains/ports.
- [x] Securing sensitive routes with custom middleware.

---

## 🛡️ License
MIT

---
