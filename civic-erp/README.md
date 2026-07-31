# CivicOS: Enterprise Operations ERP & Multi-Agent Intelligence Platform

## Executive Overview

CivicOS is a configurable, multi-tenant Enterprise Resource Planning (ERP) platform and operational management ecosystem designed for municipal governance, local administrative bodies, and public service management. The platform unifies public grievance intake, automated workload distribution, field team execution, inventory logistics, and executive analytics into a seamless, data-driven workflow.

Driven by five specialized Google Gemini Artificial Intelligence agents and supported by real-time WebSocket communication channels, CivicOS bridges the communication gap between citizens and municipal administrators while drastically reducing issue resolution turnaround times.

---

## Strategic Objectives and Problem Statement

Municipal administration frequently suffers from operational bottlenecks caused by fragmented software tools, manual grievance triaging, duplicate reporting, lack of field activity visibility, and absent strategic insights. 

CivicOS solves these challenges through:

1. Autonomous AI Triaging: Instant evaluation of complaint priority, geographic routing, and duplicate identification upon submission.
2. Unified Role-Based Portals: Tailored interfaces for Administrators, Department Managers, Field Personnel, and Citizens.
3. High Availability and Resilience: Dual-engine architecture featuring AI-driven operations with automatic deterministic rule-based fallbacks to guarantee 100% operational uptime.
4. Real-Time Status Synchronization: Instant bidirectional notification delivery via WebSockets across all user portals.

---

## System Architecture

CivicOS is engineered as a decoupled, modular client-server architecture. The backend utilizes FastAPI with asynchronous database drivers to ensure non-blocking I/O operations under high concurrency. The frontend is built on React 18 and Vite, offering a fast, responsive interface with minimal overhead.

```
+-------------------------------------------------------------------------------+
|                               Citizen Interface                               |
|                  (Complaint Submission, Chatbot, Live Tracking)               |
+-------------------------------------------------------------------------------+
                                       |
                                       v
+-------------------------------------------------------------------------------+
|                       FastAPI API Gateway & Auth Layer                        |
|                  (OAuth2 JWT Authentication, RBAC, WebSockets)                 |
+-------------------------------------------------------------------------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
                   v                                       v
+------------------------------------+   +--------------------------------------+
|     Multi-Agent AI Engine          |   |     Async Database Storage Layer     |
|  - Priority Agent                  |   |  - SQLite (aiosqlite dev engine)    |
|  - Department Routing Agent        |   |  - PostgreSQL (asyncpg prod engine)  |
|  - Duplicate Detection Agent       |   |  - SQLAlchemy 2.0 Async ORM         |
|  - Predictive Analytics Agent      |   +--------------------------------------+
|  - Citizen Chatbot Agent           |
+------------------------------------+
                   |
                   v
+-------------------------------------------------------------------------------+
|                 Deterministic Rule-Based Fallback Controller                  |
|          (Ensures continuous uptime if LLM services are unavailable)          |
+-------------------------------------------------------------------------------+
                                       |
                                       v
+-------------------------------------------------------------------------------+
|                   Operational & Management User Portals                       |
|        (Admin Portal, Department Portal, Field Officer Portal)                |
+-------------------------------------------------------------------------------+
```

---

## Core Implementations and AI Agent Ecosystem

### 1. Multi-Agent Artificial Intelligence System

CivicOS incorporates five domain-specific AI agents built using the Google Gemini SDK. Every agent operates within an isolated module and implements a standard protocol for prompt engineering, structured JSON extraction, and rule-based fallback handling.

* Priority Scoring Agent (`app/agents/priority_agent.py`):
  Evaluates incoming grievance titles, descriptions, categories, locations, and attachment references. It assigns an objective priority rating (`Critical`, `High`, `Medium`, `Low`) along with a numerical urgency score and explicit reasoning.

* Department Routing Agent (`app/agents/routing_agent.py`):
  Analyzes complaint semantics against active municipal department taxonomies (e.g., Water Supply, Public Works, Electrical Maintenance, Sanitation, Traffic Infrastructure) to assign the optimal resolving department.

* Duplicate Detection Agent (`app/agents/duplicate_agent.py`):
  Cross-checks new incoming complaints with recently reported incidents within geographical and categorical windows, calculating similarity scores and identifying master ticket IDs to prevent redundant field dispatches.

* Predictive Analytics Agent (`app/agents/analytics_agent.py`):
  Aggregates municipal operational metrics, open ticket counts, average resolution durations, and inventory consumption trends to synthesize executive strategic summaries and operational recommendations.

* Citizen Conversational Chatbot Agent (`app/agents/chatbot_agent.py`):
  Provides a conversational natural-language assistant capable of guiding citizens through complaint submission, checking real-time ticket status, and answering common municipal inquiries.

### 2. Autonomous Resilience Protocol (Rule-Based Fallbacks)

To ensure zero operational disruption in high-load scenarios, network latency, or unconfigured LLM credentials, all AI agents feature a fallback protocol. If `GEMINI_API_KEY` is omitted, invalid, or rate-limited, the system seamlessly transitions to deterministic rule-based algorithms (e.g., keyword matching, geospatial bounds checking, heuristic analytics) without raising unhandled exceptions or failing HTTP requests.

### 3. Role-Based Access Control (RBAC) & Portal Implementations

* Admin Portal: Comprehensive platform management including municipal organization setup, department creation, user role provisioning, system analytics overview, and global configuration.
* Department Portal: Queue management for department managers to inspect routed complaints, evaluate AI priority scores, reassign tasks, track SLA metrics, and log inventory usage.
* Field Officer Portal: Streamlined interface for field technicians to view assigned work orders, update task progress, upload verification data, and change ticket statuses in real time.
* Citizen Portal: Accessible interface allowing citizens to register complaints, upload image evidence, monitor live progress, receive push notifications, and interact with the AI chatbot.

---

## Tech Stack and Engineering Specifications

| Layer | Technologies & Libraries |
| :--- | :--- |
| Backend Runtime | Python 3.11+, FastAPI (ASGI Framework) |
| Database & ORM | SQLAlchemy 2.0 (Async), Alembic, SQLite (`aiosqlite`), PostgreSQL (`asyncpg`) |
| AI Integration | Google Gemini SDK (`google-genai`), Custom JSON extraction pipeline |
| Authentication | OAuth2 Password Bearer, JWT (JSON Web Tokens), Passlib (bcrypt) |
| Realtime Layer | WebSockets (`fastapi.websockets`) |
| Frontend Runtime | Node.js, React 18, Vite |
| Styling & UI | Vanilla CSS, Tailwind CSS, Lucide React Icons |
| State & Networking | Axios API Client, React Context API |

---

## Directory Structure

```
civic-erp/
├── backend/
│   ├── app/
│   │   ├── agents/            # Specialized Google Gemini AI agents & fallback logic
│   │   │   ├── analytics_agent.py
│   │   │   ├── chatbot_agent.py
│   │   │   ├── duplicate_agent.py
│   │   │   ├── gemini_client.py
│   │   │   ├── orchestrator.py
│   │   │   ├── priority_agent.py
│   │   │   └── routing_agent.py
│   │   ├── alembic/           # Database migration configurations
│   │   ├── core/              # Config settings, DB session, security helpers
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── routers/           # REST API endpoints & WebSocket handler
│   │   ├── schemas/           # Pydantic data validation models
│   │   ├── services/          # Core business logic services
│   │   ├── main.py            # FastAPI entry point & CORS configuration
│   │   └── seed.py            # Database seeding script for development
│   ├── .env.example           # Backend environment configuration reference
│   ├── alembic.ini            # Alembic configuration
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI component library
│   │   ├── lib/               # Axios API client setup and utilities
│   │   ├── portals/           # Role-specific dashboard views
│   │   │   ├── admin/
│   │   │   ├── citizen/
│   │   │   ├── department/
│   │   │   └── officer/
│   │   ├── App.jsx            # Main React application component
│   │   ├── index.css          # Core CSS styling and design system
│   │   └── router.jsx         # Application routing structure
│   ├── .env.example           # Frontend environment configuration reference
│   ├── package.json           # Node dependencies and scripts
│   └── vite.config.js         # Vite bundler configuration
└── .env.example               # Root project environment configuration reference
```

---

## Environment Variables Reference

| Variable Name | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Yes | `sqlite+aiosqlite:///./civicos.db` | Async connection string for SQLite or PostgreSQL. |
| `SECRET_KEY` | Yes | `civicos_super_secret...` | Cryptographic secret key used to sign JWT authentication tokens. |
| `ALGORITHM` | Yes | `HS256` | JWT signing algorithm standard. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Yes | `1440` | Token expiration duration in minutes (24 hours). |
| `CORS_ORIGINS` | Yes | `http://localhost:5173` | Comma-separated allowed origin HTTP addresses for CORS. |
| `GEMINI_API_KEY` | Optional | None | Google Gemini API Key for live AI operations (triggers fallback if omitted). |
| `GEMINI_MODEL` | Optional | `gemini-2.5-flash` | Selected Gemini model version (`gemini-2.5-flash`, `gemini-3.6-flash`). |
| `VITE_API_BASE_URL` | Yes | `http://localhost:8000` | Backend API root URL used by the frontend application. |

---

## Quick Setup and Installation Guide

### Prerequisites

* Python 3.11 or higher installed on your system.
* Node.js v18.0.0 or higher along with `npm`.

### 1. Backend Setup

Navigate to the `backend` directory:

```bash
cd civic-erp/backend
```

Create and activate a virtual environment:

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Configure environment variables:

```bash
cp .env.example .env
```

Initialize the database tables and populate mock seed data:

```bash
python -m app.seed
```

Start the FastAPI application development server:

```bash
uvicorn app.main:app --reload --port 8000
```

The REST API documentation (Interactive Swagger UI) will be accessible at: `http://localhost:8000/docs`.

### 2. Frontend Setup

Open a separate terminal window and navigate to the `frontend` directory:

```bash
cd civic-erp/frontend
```

Install Node.js dependencies:

```bash
npm install
```

Configure frontend environment variables:

```bash
cp .env.example .env
```

Launch the Vite development server:

```bash
npm run dev
```

The user application will be accessible in your web browser at: `http://localhost:5173`.

---

## API Endpoints Summary

### Authentication and Access Control
* `POST /auth/token`: Log in with email and password to acquire OAuth2 JWT access token.
* `POST /auth/register`: Register new citizen accounts.

### Complaint Operations
* `GET /complaints`: List complaints with optional filtering by status, department, or priority.
* `POST /complaints`: Submit a new complaint (triggers AI Orchestrator for priority, routing, and duplicate check).
* `GET /complaints/{id}`: Retrieve detailed complaint record.
* `PATCH /complaints/{id}`: Update complaint status, department assignment, or officer allocation.

### AI Agent Operations
* `POST /ai/orchestrate`: Run the complete AI pipeline (Priority, Routing, Duplicate Detection) on arbitrary complaint data.
* `POST /ai/chatbot`: Send messages to the conversational citizen assistant.
* `GET /ai/analytics`: Generate strategic executive insights using the analytics agent.

### Realtime Synchronization
* `WS /ws/notifications`: WebSocket channel for real-time notification broadcasting across clients.

---

## Hackathon Evaluation Criteria Compliance

1. Impact and Relevance: Resolves major operational challenges in municipal administration by eliminating manual overhead and accelerating civic issue resolution.
2. Technical Depth and Complexity: Features asynchronous Python micro-services, real-time WebSocket streams, multi-agent LLM orchestration, and robust database architecture.
3. Resilience and Production Readiness: Built with deterministic rule-based fallback mechanisms ensuring total availability even when external AI APIs face quotas or network failure.
4. User Experience: Provides tailored, polished interfaces designed specifically for four distinct user archetypes (Admins, Managers, Officers, Citizens).
