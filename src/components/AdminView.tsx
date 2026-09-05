import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldCheck, Settings, Sliders, Activity, 
  Search, Lock, CheckCircle2, AlertTriangle, Shield, 
  Terminal, RefreshCw, Eye, ToggleLeft, ToggleRight
} from 'lucide-react';
import { UserProfile, AccountRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  eventType: string;
  resource: string;
  status: 'SUCCESS' | 'WARNING' | 'DENIED';
  ipAddress: string;
}

const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud-9901',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    actor: 'admin@voiceshield.ai',
    eventType: 'ROLE_VALIDATION',
    resource: '/api/v1/auth/session',
    status: 'SUCCESS',
    ipAddress: '192.168.1.104'
  },
  {
    id: 'aud-9902',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    actor: 'analyst@voiceshield.ai',
    eventType: 'INCIDENT_TRIAGE_RESOLVE',
    resource: 'alt-8908',
    status: 'SUCCESS',
    ipAddress: '10.0.4.21'
  },
  {
    id: 'aud-9903',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    actor: 'external-stream-33',
    eventType: 'BIOMETRIC_CHALLENGE_FAIL',
    resource: 'ses-849201',
    status: 'DENIED',
    ipAddress: '198.51.100.42'
  },
  {
    id: 'aud-9904',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    actor: 'user@voiceshield.ai',
    eventType: 'WEBAUDIO_STREAM_INIT',
    resource: 'MIC_STREAM',
    status: 'SUCCESS',
    ipAddress: '172.16.0.88'
  }
];

export function AdminView() {
  const { user } = useAuth();
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'users' | 'security' | 'audit'>('users');
  const [userList, setUserList] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);
  
  // Weights state
  const [flatnessWeight, setFlatnessWeight] = useState(30);
  const [pitchWeight, setPitchWeight] = useState(25);
  const [fluxWeight, setFluxWeight] = useState(20);
  const [hfWeight, setHfWeight] = useState(15);
  const [weightsSaved, setWeightsSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('voiceshield_firestore_users');
      if (raw) {
        setUserList(JSON.parse(raw));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleToggleActive = (targetUid: string) => {
    const updated = userList.map(u => {
      if (u.uid === targetUid) {
        return { ...u, isActive: !u.isActive, updatedAt: new Date().toISOString() };
      }
      return u;
    });
    setUserList(updated);
    localStorage.setItem('voiceshield_firestore_users', JSON.stringify(updated));
  };

  const handleSaveWeights = () => {
    setWeightsSaved(true);
    setTimeout(() => setWeightsSaved(false), 3000);
  };

  const filteredUsers = userList.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.accountRole.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="admin-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ADMIN CONSOLE
              </span>
              <span className="text-xs text-zinc-500 font-mono">Zero-Trust Directory & Policy Controls</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-100 mt-1">Enterprise Security Administration</h2>
            <p className="text-xs text-zinc-400 max-w-2xl mt-0.5">
              Control Firestore user permissions, calibrate acoustic risk weights, and review immutable forensic audit trails.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveAdminSubTab('users')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeAdminSubTab === 'users' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}>
              User Management
            </button>
            <button
              onClick={() => setActiveAdminSubTab('security')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeAdminSubTab === 'security' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}>
              Risk Calibration
            </button>
            <button
              onClick={() => setActiveAdminSubTab('audit')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeAdminSubTab === 'audit' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}>
              Audit Logs
            </button>
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: USER MANAGEMENT */}
      {activeAdminSubTab === 'users' && (
        <div className="bg-[#111114] border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                Registered Firestore Users ({userList.length})
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user, email, role..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800 font-mono text-[11px]">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Organization</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-zinc-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-semibold text-zinc-100">{u.fullName}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">{u.email}</div>
                    </td>
                    <td className="p-3.5 font-mono text-zinc-300">
                      {u.phoneNumber || '—'}
                    </td>
                    <td className="p-3.5">
                      <div className="text-zinc-200">{u.organization || 'VoiceShield Internal'}</div>
                      <div className="text-[11px] text-zinc-500">{u.jobRole || 'Specialist'}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        u.accountRole === 'ADMIN'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : u.accountRole === 'ANALYST'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {u.accountRole}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        u.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {u.uid !== user?.uid ? (
                        <button
                          onClick={() => handleToggleActive(u.uid)}
                          className={`px-3 py-1 rounded text-xs font-semibold transition ${
                            u.isActive 
                              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' 
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}>
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">Current Session</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: RISK WEIGHT CALIBRATION */}
      {activeAdminSubTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#111114] border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mb-4 flex items-center gap-2 font-mono">
              <Sliders className="w-4 h-4 text-blue-400" /> Physical DSP Risk Weights Calibration
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Dynamically calibrate the linear weights of the physical DSP feature extraction pipeline. Changes propagate instantly to all active WebSocket sessions.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-zinc-300 mb-1 font-mono">
                  <span>Vocoder Spectral Flatness (Wiener Entropy)</span>
                  <span className="text-blue-400 font-bold">{flatnessWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={flatnessWeight}
                  onChange={(e) => setFlatnessWeight(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1 font-mono">
                  <span>Pitch Dynamics & F0 Micro-Jitter</span>
                  <span className="text-blue-400 font-bold">{pitchWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  value={pitchWeight}
                  onChange={(e) => setPitchWeight(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1 font-mono">
                  <span>Phase Boundary & Frame Temporal Flux</span>
                  <span className="text-blue-400 font-bold">{fluxWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="35"
                  value={fluxWeight}
                  onChange={(e) => setFluxWeight(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1 font-mono">
                  <span>Neural Codec Bandwidth Rolloff</span>
                  <span className="text-blue-400 font-bold">{hfWeight}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={hfWeight}
                  onChange={(e) => setHfWeight(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800 mt-6">
              <button
                id="btn-save-admin-weights"
                onClick={handleSaveWeights}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-blue-600/20">
                <CheckCircle2 className="w-4 h-4" />
                {weightsSaved ? 'Acoustic Risk Weights Saved & Applied!' : 'Save & Publish Calibration'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#111114] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 mb-4 flex items-center gap-2 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security Policies
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <div className="font-bold text-zinc-200">Zero Raw Audio Storage Policy</div>
                  <p className="text-zinc-500 mt-0.5 text-[11px]">
                    Audio waveforms reside strictly in volatile RAM for FFT analysis and are evicted immediately upon inference.
                  </p>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <div className="font-bold text-zinc-200">Role Invariant Rules</div>
                  <p className="text-zinc-500 mt-0.5 text-[11px]">
                    Non-admin users cannot alter accountRole attributes via client payloads.
                  </p>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <div className="font-bold text-zinc-200">Challenge Verification Threshold</div>
                  <p className="text-zinc-500 mt-0.5 text-[11px]">
                    Triggers automatically when overall security risk exceeds 70.0/100.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-zinc-500 pt-4 border-t border-zinc-800 mt-4">
              Enforced by VoiceShield Gateway JWT security filter chain.
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: AUDIT LOGS */}
      {activeAdminSubTab === 'audit' && (
        <div className="bg-[#111114] border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                Forensic Audit Trail (Immutable)
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Live Append-Only Stream</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800 text-[11px]">
                <tr>
                  <th className="p-3.5">Log ID</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Event Type</th>
                  <th className="p-3.5">Resource</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300 text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/40 transition">
                    <td className="p-3.5 text-blue-400 font-bold">{log.id}</td>
                    <td className="p-3.5 text-zinc-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3.5 text-zinc-200">{log.actor}</td>
                    <td className="p-3.5 text-zinc-300 font-bold">{log.eventType}</td>
                    <td className="p-3.5 text-zinc-400">{log.resource}</td>
                    <td className="p-3.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' :
                        log.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-zinc-500">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
