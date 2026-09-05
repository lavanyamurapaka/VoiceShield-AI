import React, { useState } from 'react';
import { 
  FolderTree, FileCode, Terminal, BookOpen, Layers, 
  Database, ShieldCheck, Check, Copy
} from 'lucide-react';

export const ArchitectureDocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'docker' | 'api' | 'security'>('architecture');
  const [copied, setCopied] = useState(false);

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="architecture-docs-view" className="space-y-6">
      <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                SYSTEM DOCUMENTATION
              </span>
              <span className="text-xs text-slate-400">Microservice Architecture & Specifications</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Platform Architecture & Deployment Documentation</h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
              Comprehensive reference for the Spring Boot backend, FastAPI DSP AI service, PostgreSQL schema, Docker orchestration, and security model.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${activeTab === 'architecture' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              Architecture
            </button>
            <button
              onClick={() => setActiveTab('docker')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${activeTab === 'docker' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              Docker Compose
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${activeTab === 'api' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              API Specs
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${activeTab === 'security' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              Security & Privacy
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'architecture' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-[#111827] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> End-to-End Service Topology
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <strong className="text-cyan-400 font-mono block mb-1">1. Ingestion & Gateway Layer (Spring Boot :8080)</strong>
                Authenticates requests using JWT, routes audio upload and WebSocket audio streams, enforces rate limiting via Redis sliding window, and orchestrates verification.
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <strong className="text-purple-400 font-mono block mb-1">2. AI & DSP Inference Engine (FastAPI :8000)</strong>
                Performs physical acoustic digital signal processing (FFT spectral centroid, flatness, pitch micro-variance, phase flux) via NumPy and SciPy. Encapsulated behind `VoiceDetectionModel` contract.
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <strong className="text-emerald-400 font-mono block mb-1">3. Relational Persistence (PostgreSQL 16 :5432)</strong>
                Flyway-managed tables: `detection_sessions`, `detection_results`, `risk_signals`, `security_alerts`, `audit_logs`, `voice_profiles`.
              </div>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <strong className="text-amber-400 font-mono block mb-1">4. Session Cache & Sliding Window (Redis :6379)</strong>
                Maintains sliding window audio buffers for WebSocket live chunk processing and tracks client rate limits.
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#111827] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-400" /> Codebase Repository Structure
            </h3>

            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`VoiceShield-AI/
├── backend/                  # Spring Boot 3.2 (Java 21)
│   ├── src/main/java/com/voiceshield/ai/
│   │   ├── config/           # WebSocket & DataInitializer
│   │   ├── controller/       # REST API Endpoints
│   │   ├── dto/              # Request / Response Schemas
│   │   ├── entity/           # JPA Database Entities
│   │   ├── repository/       # Spring Data Repositories
│   │   ├── security/         # JWT Filter, RBAC, UserDetails
│   │   ├── service/          # Orchestration & Risk Engine
│   │   └── websocket/        # Real-time Sliding Window Buffer
│   └── pom.xml
├── ai-service/               # FastAPI & DSP Signal Engine (Python 3.11)
│   ├── app/
│   │   ├── main.py           # FastAPI Ingestion & Endpoints
│   │   ├── models/           # VoiceDetectionModel Contract
│   │   ├── pipeline/         # DSP FFT & Acoustic Extractor
│   │   └── risk/             # Risk Scoring & Threat Evaluator
│   └── Dockerfile
├── frontend/                 # Angular 17 Enterprise SPA
│   ├── src/app/              # Standalone Components & Services
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml        # Multi-Container Topology`}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'docker' && (
        <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" /> Docker Compose Production Orchestration
            </h3>
            <button
              onClick={() => copyCode('docker compose up --build')}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>docker compose up --build</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: voiceshield
      POSTGRES_USER: voiceshield_user
      POSTGRES_PASSWORD: \${DB_PASSWORD:-voiceshield_secure_pwd_2026}
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U voiceshield_user -d voiceshield"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]

  ai-service:
    build: { context: ./ai-service }
    ports: ["8000:8000"]
    environment:
      - MODEL_MODE=development

  backend:
    build: { context: ./backend }
    ports: ["8080:8080"]
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
      ai-service: { condition: service_started }

  frontend:
    build: { context: ./frontend }
    ports: ["80:80"]
    depends_on: ["backend"]`}
          </pre>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" /> Key REST & WebSocket API Endpoints
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">POST /api/detection/upload</span>
              <p className="text-slate-400">Multipart audio upload (WAV/MP3). Performs immediate acoustic DSP analysis, records session result, and dispatches SOC alert if high risk.</p>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400">WS /ws/audio-stream</span>
              <p className="text-slate-400">Bi-directional WebSocket connection. Ingests binary audio chunks into 16KB-128KB sliding window buffer with low-latency feedback.</p>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400">POST /api/verification/challenge/*</span>
              <p className="text-slate-400">Dynamic phrase generation and audio response biometric validation in English, Hindi, and Telugu.</p>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400">GET /api/alerts/recent</span>
              <p className="text-slate-400">SOC alert stream filterable by severity (Critical, High, Medium, Low) with analyst investigation note updates.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security, Privacy & Ephemeral Storage Architecture
          </h3>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <strong className="text-white block mb-1">Zero Permanent Raw Audio Storage:</strong>
              Raw voice audio streams are processed in ephemeral memory buffers during the inference lifecycle. Only mathematical acoustic feature vectors, normalized risk scores, and audit logs are persisted in PostgreSQL.
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <strong className="text-white block mb-1">Role-Based Access Control (RBAC):</strong>
              Spring Security enforces granular permission gates (`ROLE_ADMIN`, `ROLE_ANALYST`, `ROLE_USER`). Only administrators can calibrate acoustic weight thresholds; analysts triage incidents; operators view active session results.
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <strong className="text-white block mb-1">Defense-In-Depth & Explainability:</strong>
              Every risk score is directly decomposable into 5 acoustic features (Vocoder flatness, pitch variance, spectral flux, HF codec rolloff, and zero-crossing rate) to ensure total transparency.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
