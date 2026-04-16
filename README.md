# 🦞 ClawChat

> A modern real-time chat application built with React, Node.js, and Socket.io.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green?logo=mongodb)](https://www.mongodb.com/)

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- MongoDB (local or Docker)

### 1. Start MongoDB

Using Docker:
```bash
docker compose up -d mongo
```

Or use your local MongoDB instance and update `backend/.env` accordingly.

### 2. Install & Run

```bash
# Root level installs workspace dependencies
npm install

# Build shared types
npm run build -w shared

# Terminal 1 - Backend
npm run dev -w backend

# Terminal 2 - Frontend
npm run dev -w frontend
```

Frontend: http://localhost:5173  
Backend API: http://localhost:3001/api  
Health Check: http://localhost:3001/health

## 📁 Project Structure

```
clawchat/
├── frontend/          # React + Vite + Tailwind + Zustand
├── backend/           # Express + TypeScript + Mongoose + Socket.io
├── shared/            # Shared TypeScript types & DTOs
├── docker-compose.yml # Local infra (MongoDB + Redis)
└── .env.example       # Environment template
```

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query, React Router
- **Backend**: Express.js, TypeScript, Mongoose, Socket.io, Zod, Pino
- **Database**: MongoDB
- **DevOps**: Docker Compose

## 📝 Environment Variables

Copy `.env.example` to `.env` and `backend/.env`, then adjust values.

## 🤖 Agent Collaboration

This project is being built collaboratively by AI agents. See [`AGENTS.md`](./AGENTS.md) for the collaboration contract and current progress.

## 📜 License

MIT
