import React, { useState } from 'react';
import { 
  ShieldAlert, Filter, Download, UserCheck, CheckCircle, 
  AlertOctagon, XCircle, Search, Clock, FileText, ChevronRight
} from 'lucide-react';
import { SecurityAlert, ThreatLevel } from '../types';

interface SocAlertsViewProps {
  alerts: SecurityAlert[];
  onUpdateAlert: (id: string, updates: Partial<SecurityAlert>) => void;
}

export const SocAlertsView: React.FC<SocAlertsViewProps> = ({ alerts, onUpdateAlert }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeAlert, setActiveAlert] = useState<SecurityAlert | null>(alerts[0] || null);
  const [notes, setNotes] = useState<string>('');
  const [actionTaken, setActionTaken] = useState<string>('');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = selectedSeverity === 'ALL' || alert.severity === selectedSeverity;
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alert.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alert.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const selectAlert = (alert: SecurityAlert) => {
    setActiveAlert(alert);
    setNotes(alert.investigationNotes || '');
    setActionTaken(alert.actionTaken || '');
  };

  const saveInvestigation = (status: SecurityAlert['status']) => {
    if (!activeAlert) return;
    onUpdateAlert(activeAlert.id, {
      status,
      investigationNotes: notes,
      actionTaken: actionTaken || (status === 'RESOLVED' ? 'Session terminated and credentials revoked' : 'Marked as false positive after acoustic verification')
    });
    setActiveAlert({
      ...activeAlert,
      status,
      investigationNotes: notes,
      actionTaken: actionTaken || (status === 'RESOLVED' ? 'Session terminated and credentials revoked' : 'Marked as false positive after acoustic verification')
    });
  };

  const exportAuditLogs = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(alerts, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `voiceshield-audit-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const headers = ['ID', 'Session ID', 'Severity', 'Status', 'Risk Score', 'Classification', 'Title', 'Assigned To', 'Created At'];
      const rows = alerts.map(a => [
        a.id, a.sessionId, a.severity, a.status, a.riskScore, a.classification, `"${a.title.replace(/"/g, '""')}"`, a.assignedTo, a.createdAt
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", encodeURI(csvContent));
      downloadAnchor.setAttribute("download", `voiceshield-audit-${Date.now()}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  const getBadgeStyle = (severity: ThreatLevel) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'MEDIUM': return 'bg-orange-400/10 text-orange-300 border-orange-400/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div id="soc-alerts-view" className="space-y-6">
      {/* Top Banner - Sleek Interface */}
      <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                SOC INCIDENT RESPONSE
              </span>
              <span className="text-xs text-zinc-500 font-mono">SIEM & Biometric Impersonation Triage</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-100 mt-1">Security Operations Center Alerts & Logs</h2>
            <p className="text-xs text-zinc-400 max-w-2xl mt-0.5">
              Live triage queue of detected spoofing attacks, vocoder anomalies, and analyst investigation workflows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-json"
              onClick={() => exportAuditLogs('json')}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition uppercase tracking-wider">
              <Download className="w-3.5 h-3.5 text-blue-400" /> Export JSON
            </button>
            <button
              id="btn-export-csv"
              onClick={() => exportAuditLogs('csv')}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition uppercase tracking-wider">
              <Download className="w-3.5 h-3.5 text-emerald-400" /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => {
              const count = sev === 'ALL' ? alerts.length : alerts.filter(a => a.severity === sev).length;
              return (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    selectedSeverity === sev 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}>
                  <span>{sev}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 font-mono">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search session or alert..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Alert List & Investigation Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table List */}
        <div className="lg:col-span-7 bg-[#111114] border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Incident Title</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500">
                      No security incidents match the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert) => (
                    <tr
                      key={alert.id}
                      onClick={() => selectAlert(alert)}
                      className={`cursor-pointer transition hover:bg-zinc-800/40 ${
                        activeAlert?.id === alert.id ? 'bg-zinc-800/60 border-l-2 border-blue-500' : ''
                      }`}>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getBadgeStyle(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-zinc-100">{alert.title}</div>
                        <div className="text-[11px] text-zinc-500 font-mono">Session: {alert.sessionId}</div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-zinc-100">
                        {alert.riskScore.toFixed(1)}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          alert.status === 'RESOLVED' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                          alert.status === 'UNDER_INVESTIGATION' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' :
                          alert.status === 'FALSE_POSITIVE' ? 'bg-zinc-800 text-zinc-400' :
                          'bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse'
                        }`}>
                          {alert.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-500 text-[11px] whitespace-nowrap font-mono">
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Investigation Detail Drawer */}
        <div className="lg:col-span-5 bg-[#111114] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          {activeAlert ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <span className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Forensic Investigation</span>
                  <div className="text-[11px] text-blue-400 font-mono">{activeAlert.id}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getBadgeStyle(activeAlert.severity)}`}>
                  {activeAlert.severity}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-100">{activeAlert.title}</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                  {activeAlert.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block uppercase font-bold">Assigned Analyst</span>
                  <span className="font-semibold text-zinc-200">{activeAlert.assignedTo}</span>
                </div>
                <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] block uppercase font-bold">Calculated Risk Score</span>
                  <span className="font-mono font-bold text-red-500">{activeAlert.riskScore.toFixed(1)} / 100</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Analyst Investigation Log:</label>
                <textarea
                  id="textarea-investigation-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record forensic observations, acoustic spectrum notes..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Remediation Action Taken:</label>
                <input
                  type="text"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="e.g. Session Terminated, Escalated to CISO"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  id="btn-resolve-alert"
                  onClick={() => saveInvestigation('RESOLVED')}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition uppercase tracking-wider">
                  <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
                </button>
                <button
                  id="btn-false-positive"
                  onClick={() => saveInvestigation('FALSE_POSITIVE')}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 text-xs font-bold transition uppercase tracking-wider">
                  <XCircle className="w-3.5 h-3.5 text-zinc-400" /> False Positive
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-zinc-500">
              <ShieldAlert className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
              <p className="text-xs">Select an alert incident from the triage queue to investigate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
