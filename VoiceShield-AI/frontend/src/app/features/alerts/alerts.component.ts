import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SecurityAlert } from '../../core/models/detection.model';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-3">
            <span class="p-2 bg-red-500/10 text-red-400 rounded-lg">🚨</span>
            SOC Security Operations Alerts & Investigations
          </h1>
          <p class="text-slate-400 text-sm mt-1">
            Triaged security incidents, biometric spoofing attempts, and analyst forensic workflows.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button (click)="exportAuditLog('json')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition">
            Export JSON
          </button>
          <button (click)="exportAuditLog('csv')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition">
            Export CSV
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        <button 
          (click)="selectedSeverity = 'ALL'"
          [class.bg-sky-600]="selectedSeverity === 'ALL'"
          [class.text-white]="selectedSeverity === 'ALL'"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400">
          All Alerts ({{ alerts.length }})
        </button>
        <button 
          (click)="selectedSeverity = 'CRITICAL'"
          [class.bg-red-600]="selectedSeverity === 'CRITICAL'"
          [class.text-white]="selectedSeverity === 'CRITICAL'"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-red-400">
          Critical ({{ countBySeverity('CRITICAL') }})
        </button>
        <button 
          (click)="selectedSeverity = 'HIGH'"
          [class.bg-orange-600]="selectedSeverity === 'HIGH'"
          [class.text-white]="selectedSeverity === 'HIGH'"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-orange-400">
          High ({{ countBySeverity('HIGH') }})
        </button>
        <button 
          (click)="selectedSeverity = 'MEDIUM'"
          [class.bg-amber-600]="selectedSeverity === 'MEDIUM'"
          [class.text-white]="selectedSeverity === 'MEDIUM'"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-amber-400">
          Medium ({{ countBySeverity('MEDIUM') }})
        </button>
        <button 
          (click)="selectedSeverity = 'LOW'"
          [class.bg-emerald-600]="selectedSeverity === 'LOW'"
          [class.text-white]="selectedSeverity === 'LOW'"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-emerald-400">
          Low ({{ countBySeverity('LOW') }})
        </button>
      </div>

      <!-- Main Layout: Alert Table & Detail Drawer -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th class="p-4">Severity</th>
                  <th class="p-4">Incident Title</th>
                  <th class="p-4">Status</th>
                  <th class="p-4">Created</th>
                  <th class="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800 text-slate-300">
                <tr *ngFor="let alert of filteredAlerts" 
                  (click)="selectedAlert = alert"
                  [class.bg-slate-800/60]="selectedAlert?.id === alert.id"
                  class="hover:bg-slate-800/40 cursor-pointer transition">
                  <td class="p-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono" [class]="getSeverityBadge(alert.severity)">
                      {{ alert.severity }}
                    </span>
                  </td>
                  <td class="p-4 font-semibold text-white">{{ alert.title }}</td>
                  <td class="p-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      {{ alert.status }}
                    </span>
                  </td>
                  <td class="p-4 text-slate-400">{{ alert.createdAt | date:'short' }}</td>
                  <td class="p-4 text-right">
                    <button class="text-sky-400 hover:text-sky-300 font-semibold">Inspect</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Investigation Drawer -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div *ngIf="!selectedAlert" class="text-center py-20 text-slate-500 text-sm">
            Select an alert incident from the list to investigate.
          </div>

          <div *ngIf="selectedAlert" class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-xs uppercase font-semibold text-slate-400">Incident Details</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono" [class]="getSeverityBadge(selectedAlert.severity)">
                {{ selectedAlert.severity }}
              </span>
            </div>

            <h3 class="text-base font-bold text-white">{{ selectedAlert.title }}</h3>
            <p class="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
              {{ selectedAlert.description }}
            </p>

            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Status Workflow:</label>
              <select [(ngModel)]="editStatus" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg p-2">
                <option value="NEW">NEW</option>
                <option value="UNDER_INVESTIGATION">UNDER_INVESTIGATION</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Investigation Notes:</label>
              <textarea [(ngModel)]="investigationNotes" rows="3" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg p-2" placeholder="Record forensic observations..."></textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">Remediation Action Taken:</label>
              <input [(ngModel)]="actionTaken" type="text" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg p-2" placeholder="e.g. Session Terminated, Escalated to CISO">
            </div>

            <button (click)="saveAlertUpdate()" class="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition">
              Save Investigation Update
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AlertsComponent implements OnInit {
  alerts: SecurityAlert[] = [];
  selectedSeverity: string = 'ALL';
  selectedAlert: SecurityAlert | null = null;
  editStatus: string = 'NEW';
  investigationNotes: string = '';
  actionTaken: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchAlerts();
  }

  fetchAlerts(): void {
    this.apiService.getAlerts().subscribe({
      next: (data) => {
        this.alerts = data;
        if (data.length > 0 && !this.selectedAlert) {
          this.selectAlert(data[0]);
        }
      },
      error: (err) => console.error(err)
    });
  }

  get filteredAlerts(): SecurityAlert[] {
    if (this.selectedSeverity === 'ALL') return this.alerts;
    return this.alerts.filter((a) => a.severity === this.selectedSeverity);
  }

  countBySeverity(sev: string): number {
    return this.alerts.filter((a) => a.severity === sev).length;
  }

  selectAlert(alert: SecurityAlert): void {
    this.selectedAlert = alert;
    this.editStatus = alert.status;
    this.investigationNotes = alert.investigationNotes || '';
    this.actionTaken = alert.actionTaken || '';
  }

  saveAlertUpdate(): void {
    if (!this.selectedAlert) return;
    this.apiService.updateAlert(this.selectedAlert.id, {
      status: this.editStatus,
      investigationNotes: this.investigationNotes,
      actionTaken: this.actionTaken
    }).subscribe({
      next: (updated) => {
        this.selectedAlert = updated;
        this.fetchAlerts();
      }
    });
  }

  exportAuditLog(format: 'json' | 'csv'): void {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(this.alerts, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voiceshield-alerts-${Date.now()}.json`;
      a.click();
    } else {
      const rows = [['ID', 'Severity', 'Title', 'Status', 'Created']];
      this.alerts.forEach((a) => rows.push([a.id, a.severity, a.title, a.status, a.createdAt]));
      const csvContent = rows.map((e) => e.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voiceshield-alerts-${Date.now()}.csv`;
      a.click();
    }
  }

  getSeverityBadge(sev: string): string {
    switch (sev) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400';
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400';
      default: return 'bg-emerald-500/20 text-emerald-400';
    }
  }
}
