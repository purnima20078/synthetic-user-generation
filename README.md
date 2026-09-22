# Synthetic User Generation Platform

An AI-powered synthetic user research platform for generating realistic consumer personas, running multi-persona quantitative surveys, conducting deep conversational multi-turn interviews, and extracting actionable product validation insights.

---

## 📁 Repository Structure

The project is organized into clean, decoupled **Frontend** and **Backend** directories:

```text
new-synthetic-user-generation2/
├── frontend/                     # React 19 + Vite + Tailwind CSS Single-Page Application
│   ├── src/                      # Source code (Components, Pages, Context, Services)
│   │   ├── components/           # Reusable UI components & navigation
│   │   ├── context/              # React Context (Auth, Workspace, Active Job states)
│   │   ├── pages/                # Views (Personas, Surveys, Interviews, Insights, Validation)
│   │   ├── services/             # API clients & Firestore sync connectors
│   │   ├── types/                # TypeScript data model interfaces
│   │   ├── App.tsx               # Main layout and screen router
│   │   └── main.tsx              # React DOM entry point
│   ├── index.html                # HTML document entrypoint
│   ├── vite.config.ts            # Vite bundler config with backend API proxy
│   ├── tsconfig.json             # Frontend TypeScript compiler configuration
│   ├── package.json              # Frontend dependencies and scripts
│   ├── Dockerfile                # Production Nginx container build
│   └── .env.example              # Sample frontend environment variables
│
├── backend/                      # API Backend Services
│   ├── server.ts                 # Full Node.js / Express backend (Gemini AI & background jobs)
│   ├── package.json              # Node.js backend dependencies and scripts
│   ├── tsconfig.json             # Backend TypeScript configuration
│   ├── main.py                   # FastAPI backend service (Python alternative)
│   ├── requirements.txt          # Python dependencies for FastAPI service
│   ├── Dockerfile                # Backend container build
│   └── .env.example              # Sample backend environment variables
│
├── .gitignore                    # Git ignore definitions
└── README.md                     # Project documentation
```

---

## ⚡ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Framer Motion, Recharts |
| **Backend (Node.js)** | Node.js, Express, TypeScript, `@google/genai`, Nodemailer, WebSocket (`ws`), CORS |
| **Backend (Python)** | FastAPI, Uvicorn, Pydantic v2, `google-genai` |
| **DevOps / Container** | Docker, Docker Compose, Nginx |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** / **yarn**
- **Python**: 3.10+ *(only if choosing the Python FastAPI backend)*
- **Gemini API Key**: [Get a Gemini API Key](https://aistudio.google.com/app/apikey)

---

### Option A: Standard Full-Stack (React Frontend + Node.js Express Backend)

#### 1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
```
*Add your `GEMINI_API_KEY` in `backend/.env`.*

Start the backend API server:
```bash
npm run dev
```
> The Node backend starts on **`http://localhost:5000`** with CORS enabled.

#### 2. Setup Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
> The Vite frontend starts on **`http://localhost:3000`**.  
> In local development, all `/api/*` calls are automatically proxied to `http://localhost:5000`.

---

### Option B: Python FastAPI Backend + React Frontend

#### 1. Setup FastAPI Backend
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python main.py
```
> The FastAPI backend starts on **`http://localhost:8000`** (Interactive docs at `http://localhost:8000/docs`).

#### 2. Point Frontend to FastAPI
In `frontend/`, create or update `.env`:
```env
VITE_BACKEND_URL=http://localhost:8000
```
Then start the frontend:
```bash
cd frontend
npm run dev
```

---

### Option C: Run Everything with Docker Compose

To spin up Frontend, Backend, and Mailhog SMTP relay in a single command:
```bash
docker-compose up --build
```
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **Mailhog Web UI**: `http://localhost:8025`

---

## 🛠️ Service Scripts Reference

### Frontend (`frontend/`)
| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite development server (`http://localhost:3000`) |
| `npm run build` | Builds production bundle into `frontend/dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs TypeScript compiler typecheck |

### Backend (`backend/`)
| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Node.js Express server (`http://localhost:5000`) |
| `npm run build` | Bundles Node backend to `backend/dist/server.cjs` |
| `npm run start` | Runs the compiled production bundle |
| `python main.py` | Starts the Python FastAPI server (`http://localhost:8000`) |

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | API server listening port | `5000` |
| `GEMINI_API_KEY` | Google Gemini API key for persona & interview generation | *Required for live AI* |
| `JWT_SECRET` | Secret key for JWT token generation | `super-secret-jwt-key` |
| `SMTP_HOST` | Host for SMTP mail dispatch | `smtp-relay.brevo.com` |
| `SMTP_PORT` | Port for SMTP mail dispatch | `587` |
| `SMTP_USER` | SMTP username / address | `""` |
| `SMTP_PASS` | SMTP password / app password | `""` |
| `SMTP_FROM` | Sender display name and email address | `"Synthetic User Gen <noreply@example.com>"` |

### Frontend (`frontend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_BACKEND_URL` | Backend target URL for Vite dev proxy | `http://localhost:5000` |
| `VITE_API_URL` | Direct backend base URL (optional, for non-proxy setups) | `""` (uses proxy) |

---

## 📡 Core API Endpoints

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/signup` | Register user and trigger 6-digit OTP |
| | `POST` | `/api/auth/login` | Login user and send verification code |
| | `POST` | `/api/auth/verify-otp` | Validate OTP code and issue JWT token |
| | `GET` | `/api/auth/me` | Fetch active researcher session |
| **Workspaces** | `GET` | `/api/workspaces` | List research workspaces |
| | `POST` | `/api/workspaces` | Create new workspace |
| | `GET` | `/api/workspaces/:id` | Get workspace details |
| **Personas** | `GET` | `/api/workspaces/:id/personas` | Get synthesized personas |
| | `POST` | `/api/workspaces/:id/personas/generate` | Generate realistic synthetic personas |
| **Surveys** | `POST` | `/api/workspaces/:id/surveys` | Create product discovery survey |
| | `POST` | `/api/surveys/:id/run` | Execute simulation across persona cohort |
| **Interviews** | `POST` | `/api/workspaces/:id/interviews` | Start multi-turn interview |
| | `POST` | `/api/interviews/:id/messages` | Send message and receive persona response |
| **Insights** | `POST` | `/api/workspaces/:id/insights/generate` | Synthesize themes, drivers & risks |
| **Validation** | `GET` | `/api/workspaces/:id/would-use` | Compute product-market fit score |
| **Export** | `GET` | `/api/workspaces/:id/export/csv` | Download personas in CSV format |

---

## 📄 License
MIT
