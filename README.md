# VocaboostAI

> An end-to-end AI-powered English grammar learning platform — from LLM fine-tuning to production deployment.

[![Live](https://img.shields.io/badge/Status-Live%20in%20Production-brightgreen?style=flat-square)](https://github.com/Tyruntz/vocaboostAI)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Astro](https://img.shields.io/badge/Astro-5.x-FF5D01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)

---

## Overview

VocaboostAI is a full-stack intelligent tutoring system built as an S.Kom thesis project. It combines a self-hosted fine-tuned LLM with a multi-layer AI pipeline, a real-time exercise engine, and a production-grade backend — deployed on GPU infrastructure via Docker and RunPod.

The system serves two core functions: an interactive English grammar chatbot powered by a QLoRA fine-tuned Llama2-7B, and an adaptive exercise engine that generates and tracks grammar exercises per user session.

### Why this was built

This project started from an interest in NLP and the question of what a genuinely useful language learning tool would look like — not a toy demo, but something that could handle real user sessions, persist progress, generate exercises on demand, and explain grammar in a way that actually helps. Fine-tuning a 7B-parameter model end-to-end — from dataset preparation to production inference — was the most technically honest way to answer that question.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Browser — Astro.js + React                 │
│     Auth (Supabase) · Chat UI · Exercise Engine         │
└────────────┬───────────────────────┬────────────────────┘
             │ REST / Supabase SDK   │ API fetch
┌────────────▼───────────┐  ┌───────▼──────────────────────┐
│  Supabase (PostgreSQL) │  │  FastAPI — Llama2-7B Endpoint│
│  Auth · RLS · DB       │  │  QLoRA · Docker · RunPod GPU │
│  Anon + Admin clients  │  └───────┬──────────────────────┘
└────────────────────────┘          │ chained output
                           ┌────────▼──────────────────────┐
                           │  Hugging Face Space           │
                           │  Secondary NLP endpoint       │
                           └───────────────────────────────┘
                                    +
                           ┌────────────────────────────────┐
                           │  Gemini API                    │
                           │  Response refinement layer     │
                           └────────────────────────────────┘
```

---

## Features

### AI / ML
- **QLoRA Fine-tuning** — Llama2-7B fine-tuned with PEFT + bitsandbytes 4-bit quantization for domain-specific English tutoring. Managed the full pipeline: dataset prep, LoRA adapter training, evaluation, and inference optimization.
- **Multi-layer AI pipeline** — Llama2 output is passed through a secondary Gemini refinement layer for improved response quality and Indonesian-language consistency.
- **Hybrid exercise generation** — Grammar exercises are sourced from a Supabase question bank and supplemented on-demand with Gemini-generated questions. AI-generated questions are automatically persisted to the database with `is_ai_generated: true` flagging.

### Backend
- **FastAPI inference server** — Serves the fine-tuned Llama2-7B model with streaming-ready REST endpoints. Dockerized and deployed to RunPod GPU infrastructure.
- **Astro.js API routes** — Server-side TypeScript endpoints for all business logic: auth, grammar exercises, user progress, chatbot session management.
- **Supabase integration** — Dual-client architecture: `supabase` (anon key, client-side) and `supabaseAdmin` (service role, server-side) with strict RLS on all tables.

### Product
- **Interactive chatbot** — Persistent conversation sessions with history, new conversation flow, and conversation list management with delete support.
- **Exercise engine** — 10-question sessions per topic with pilihan ganda, isian kosong, and benar/salah question types. Per-question progress tracking with session UUIDs.
- **Progress & analytics** — Session replay, accuracy metrics, per-topic breakdown, and a full admin dashboard with user statistics.
- **Role-based access** — Admin vs. user roles with route-level guards. Admin dashboard includes user management, question management (CRUD), and platform-wide statistics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Astro.js 5.x, React 19, Tailwind CSS 4 |
| Backend (inference) | Python 3.11, FastAPI, Gunicorn |
| LLM | Llama2-7B (QLoRA fine-tuned via HuggingFace) |
| Training framework | PyTorch, HuggingFace Transformers, PEFT, bitsandbytes |
| Secondary AI | Gemini API (`gemini-1.5-flash`), HuggingFace Space (FastAPI) |
| Database | Supabase (PostgreSQL 16), Row-Level Security |
| Auth | Supabase Auth (JWT) |
| Containerization | Docker, Docker Compose |
| Deployment | RunPod (inference), Vercel (frontend) |
| CI/CD | GitHub Actions → DockerHub |

---

## Project Structure

```
vocaboostAI/
├── app.py                        # FastAPI inference server (Llama2)
├── start.sh                      # Server bootstrap script
├── Dockerfile                    # Multi-stage Docker build
├── requirements.txt              # Python dependencies
├── .github/workflows/docker.yml  # CI/CD pipeline
│
├── src/
│   ├── pages/
│   │   ├── index.astro           # Landing page
│   │   ├── auth/                 # Login, register pages
│   │   ├── vocaboostAI-home/     # Main app shell
│   │   ├── admin-dashboard/      # Admin-only dashboard
│   │   └── api/
│   │       ├── auth/             # Register, login endpoints
│   │       ├── chatbot/          # Conversation CRUD + AI service
│   │       │   ├── apiService.js # Llama2 + Gemini pipeline
│   │       │   └── chatApi.js    # HuggingFace Space connector
│   │       ├── grammar/
│   │       │   ├── materi/       # Topic management
│   │       │   └── soal/         # Question CRUD + AI generation
│   │       ├── progress/         # Session tracking + detail replay
│   │       └── user/             # User management + statistics
│   │
│   ├── components/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # Main app layout + state
│   │   │   ├── AdminPage.jsx     # Admin dashboard
│   │   │   └── Content/          # Feature panels (chat, exercise, results)
│   │   ├── useChatbotHandler.js  # Chatbot state + message send logic
│   │   ├── useLatihanHandler.js  # Exercise navigation state
│   │   └── useAuthSession.js     # Auth session + role redirect
│   │
│   └── lib/
│       ├── supabaseClient.ts     # Anon client (browser-safe)
│       ├── supabaseServer.ts     # Admin client (server-only)
│       ├── generateSoalDenganAI.js # AI question generation pipeline
│       └── model.ts              # Gemini SDK wrapper
```

---

## Local Development

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker (optional, for local inference)
- Supabase project with the required tables

### Setup

```bash
# Clone the repo
git clone https://github.com/Tyruntz/vocaboostAI.git
cd vocaboostAI

# Install frontend dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in: PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# PUBLIC_API_KEY (Gemini), RunPod inference endpoint URL

# Start dev server
npm run dev
# → http://localhost:4321
```

### Run inference server locally

```bash
pip install -r requirements.txt
python app.py
# → http://localhost:8000
```

### Docker

```bash
docker compose up --build
```

---

## Deployment

### Frontend → Vercel

The Astro app is configured with `@astrojs/vercel` adapter. Push to `main` triggers automatic deployment.

### Inference → RunPod via Docker

```bash
# Build and push (handled by GitHub Actions on push to main)
docker build -t tyruntzz/vocaboost-inference:latest .
docker push tyruntzz/vocaboost-inference:latest

# On RunPod: pull and run the image, expose port 8000
```

CI/CD pipeline: `.github/workflows/docker.yml` → DockerHub → RunPod.

---

## Database Schema (key tables)

| Table | Purpose |
|---|---|
| `profiles` | User accounts, roles (user / admin) |
| `topik_grammar` | Grammar topic catalog |
| `soal_latihan` | Question bank (manual + AI-generated) |
| `progress_pengguna` | Per-question answer tracking with session UUID |
| `percakapan_chatbot` | Chat sessions with full message history as JSONB |

---

## Model

The fine-tuned model is published on HuggingFace:

```
ogaa12/skripsi-llama2-vocaboost-lora-model
```

Base: `meta-llama/Llama-2-7b-hf`
Method: QLoRA (LoRA + 4-bit quantization via bitsandbytes)
Framework: HuggingFace PEFT + Transformers

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

> Built as an S.Kom thesis project at Universitas Widya Dharma Pontianak, 2025.
> Open for freelance AI/ML and full-stack web projects — reach out via [GitHub Issues](https://github.com/Tyruntz/vocaboostAI/issues).
