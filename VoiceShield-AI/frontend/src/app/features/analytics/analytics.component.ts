import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { DashboardMetrics, DetectionSession } from '../../core/models/detection.model';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h1 class="text-2xl font-bold text-white flex items-center gap-3">
          <span class="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">📈</span>
          Enterprise Voice Threat Analytics & Detection History
        </h1>
        <p class="text-slate-400 text-sm mt-1">
          Historical telemetry, classification distribution, and acoustic risk trend logs.
        </p>
      </div>

      <!-- Top KPI Metric Cards -->
      <div *ngIf="metrics" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span class="text-xs font-semibold text-slate-400 uppercase">Total Analyses</span>
          <div class="text-3xl font-bold font-mono text-white mt-1">{{ metrics.totalAnalyses }}</div>
          <span class="text-xs text-sky-400 mt-1 block">Continuous acoustic pipeline</span>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span class="text-xs font-semibold text-slate-400 uppercase">High-Risk Sessions</span>
          <div class="text-3xl font-bold font-mono text-orange-400 mt-1">{{ metrics.highRiskSessions }}</div>
          <span class="text-xs text-slate-500 mt-1 block">Risk score &gt; 70</span>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span class="text-xs font-semibold text-slate-400 uppercase">Critical SOC Alerts</span>
          <div class="text-3xl font-bold font-mono text-red-400 mt-1">{{ metrics.criticalAlerts }}</div>
          <span class="text-xs text-red-500/80 mt-1 block">Immediate intervention triggered</span>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <span class="text-xs font-semibold text-slate-400 uppercase">Model Evaluation State</span>
          <div class="text-xs font-semibold text-amber-300 mt-2 p-2 bg-amber-500/10 rounded border border-amber-500/20">
            {{ metrics.modelEvaluationStatus }}
          </div>
        </div>
      </div>

      <!-- Detection Distribution & Threat Breakdown -->
      <div *ngIf="metrics" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 class="text-base font-bold text-white mb-4">Detection Classification Distribution</h2>
          <div class="space-y-3">
            <div *ngFor="let item of getDistributionEntries()" class="space-y-1">
              <div class="flex justify-between text-xs">
                <span class="text-slate-300 font-semibold">{{ item.key }}</span>
                <span class="font-mono text-slate-400">{{ item.value }} sessions</span>
              </div>
              <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="h-full rounded-full" 
                  [style.width.%]="metrics.totalAnalyses > 0 ? (item.value / metrics.totalAnalyses) * 100 : 0"
                  [class.bg-emerald-500]="item.key === 'HUMAN'"
                  [class.bg-red-500]="item.key === 'SYNTHETIC' || item.key === 'VOICE_CLONED'"
                  [class.bg-amber-500]="item.key === 'SUSPICIOUS'"
                  [class.bg-slate-500]="item.key === 'UNCERTAIN'">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 class="text-base font-bold text-white mb-2">Service Core Health Overview</h2>
            <div class="space-y-2 text-xs">
              <div class="p-3 bg-slate-950 rounded-lg flex justify-between items-center border border-slate-800">
                <span class="text-slate-300">FastAPI AI Ingestion:</span>
                <span class="font-mono text-emerald-400">{{ metrics.aiServiceStatus }}</span>
              </div>
              <div class="p-3 bg-slate-950 rounded-lg flex justify-between items-center border border-slate-800">
                <span class="text-slate-300">PostgreSQL Relational DB:</span>
                <span class="font-mono text-emerald-400">{{ metrics.databaseStatus }}</span>
              </div>
            </div>
          </div>

          <p class="text-xs text-slate-500 mt-4">
            Acoustic risk scores are calculated deterministically across 5 feature pipelines with zero simulated responses.
          </p>
        </div>
      </div>

      <!-- History Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 class="text-base font-bold text-white mb-4">Historical Detection Logs</h2>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th class="p-3">Session Token</th>
                <th class="p-3">Channel</th>
                <th class="p-3">Classification</th>
                <th class="p-3">Risk Score</th>
                <th class="p-3">Threat</th>
                <th class="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-slate-300">
              <tr *ngFor="let s of metrics?.recentSessions" class="hover:bg-slate-800/40">
                <td class="p-3 font-mono text-sky-400">{{ s.sessionToken.substring(0, 8) }}...</td>
                <td class="p-3">{{ s.channelType }}</td>
                <td class="p-3 font-semibold">{{ s.result?.classification || 'PENDING' }}</td>
                <td class="p-3 font-mono font-bold">{{ s.result ? s.result.securityRiskScore.toFixed(1) : '-' }}</td>
                <td class="p-3">
                  <span *ngIf="s.result" class="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                    [class.bg-emerald-500/20]="s.result.threatLevel === 'LOW'"
                    [class.text-emerald-400]="s.result.threatLevel === 'LOW'"
                    [class.bg-red-500/20]="s.result.threatLevel === 'HIGH' || s.result.threatLevel === 'CRITICAL'"
                    [class.text-red-400]="s.result.threatLevel === 'HIGH' || s.result.threatLevel === 'CRITICAL'">
                    {{ s.result.threatLevel }}
                  </span>
                </td>
                <td class="p-3 text-slate-500">{{ s.createdAt | date:'short' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  metrics: DashboardMetrics | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getDashboardMetrics().subscribe({
      next: (data) => (this.metrics = data),
      error: (err) => console.error(err)
    });
  }

  getDistributionEntries(): { key: string; value: number }[] {
    if (!this.metrics || !this.metrics.detectionDistribution) return [];
    return Object.entries(this.metrics.detectionDistribution).map(([key, value]) => ({ key, value }));
  }
}
