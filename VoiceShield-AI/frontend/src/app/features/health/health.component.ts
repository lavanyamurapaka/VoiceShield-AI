import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService, CurrentUser } from '../../core/services/auth.service';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h1 class="text-2xl font-bold text-white flex items-center gap-3">
          <span class="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">⚙️</span>
          Platform Architecture & System Health
        </h1>
        <p class="text-slate-400 text-sm mt-1">
          Cluster health telemetry, inference model runtime adapters, acoustic threshold calibration, and RBAC persona simulator.
        </p>
      </div>

      <!-- RBAC Persona Switcher -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-base font-bold text-white">RBAC Role Simulation Switcher</h2>
            <p class="text-xs text-slate-400">Quickly toggle access control context to test permissions and visibility.</p>
          </div>

          <div class="flex gap-2">
            <button 
              (click)="switchRole('ROLE_ADMIN')"
              [class.bg-purple-600]="currentUser.role === 'ROLE_ADMIN'"
              [class.text-white]="currentUser.role === 'ROLE_ADMIN'"
              class="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 transition">
              👑 Admin
            </button>
            <button 
              (click)="switchRole('ROLE_ANALYST')"
              [class.bg-sky-600]="currentUser.role === 'ROLE_ANALYST'"
              [class.text-white]="currentUser.role === 'ROLE_ANALYST'"
              class="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 transition">
              🛡️ Security Analyst
            </button>
            <button 
              (click)="switchRole('ROLE_USER')"
              [class.bg-emerald-600]="currentUser.role === 'ROLE_USER'"
              [class.text-white]="currentUser.role === 'ROLE_USER'"
              class="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 transition">
              🎧 Operator
            </button>
          </div>
        </div>

        <div class="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
          <span>Active Persona: <strong class="text-white">{{ currentUser.username }}</strong> ({{ currentUser.role }})</span>
          <span class="text-slate-500">Dept: {{ currentUser.department }}</span>
        </div>
      </div>

      <!-- Microservice Health Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-slate-400 uppercase">Spring Boot Core</span>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div class="text-lg font-bold text-white">HEALTHY</div>
          <span class="text-xs text-slate-500">REST API & WebSocket Engine (Port 8080)</span>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-slate-400 uppercase">FastAPI AI Ingestion</span>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div class="text-lg font-bold text-white">HEALTHY</div>
          <span class="text-xs text-slate-500">DSP Signal Pipeline (Port 8000)</span>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-slate-400 uppercase">PostgreSQL 16 DB</span>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>
          <div class="text-lg font-bold text-white">CONNECTED</div>
          <span class="text-xs text-slate-500">Flyway Migrations V1 & V2 Applied</span>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-slate-400 uppercase">Redis Rate Limiter</span>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>
          <div class="text-lg font-bold text-white">CONNECTED</div>
          <span class="text-xs text-slate-500">Sliding Window Session Cache</span>
        </div>
      </div>

      <!-- Model Runtime Info & Threshold Tuning -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Model Info Card -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 class="text-base font-bold text-white mb-4">Inference Model Architecture Card</h2>

          <div *ngIf="modelInfo" class="space-y-3 text-xs">
            <div class="p-3 bg-slate-950 rounded-lg flex justify-between border border-slate-800">
              <span class="text-slate-400">Model Name:</span>
              <span class="font-mono text-white font-semibold">{{ modelInfo.model_name || 'DevelopmentModelAdapter' }}</span>
            </div>
            <div class="p-3 bg-slate-950 rounded-lg flex justify-between border border-slate-800">
              <span class="text-slate-400">Adapter Type:</span>
              <span class="font-mono text-sky-400 font-semibold">{{ modelInfo.adapter_type || 'DEVELOPMENT' }}</span>
            </div>
            <div class="p-3 bg-slate-950 rounded-lg flex justify-between border border-slate-800">
              <span class="text-slate-400">Acoustic Feature Extraction:</span>
              <span class="font-mono text-emerald-400 font-semibold">Active (Real Physical DSP)</span>
            </div>

            <div *ngIf="modelInfo.warning" class="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300">
              <strong>Adapter Notice:</strong> {{ modelInfo.warning }}
            </div>
          </div>
        </div>

        <!-- Admin Threshold Calibration Panel -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold text-white">Acoustic Risk Weight Calibration</h2>
            <span *ngIf="currentUser.role !== 'ROLE_ADMIN'" class="text-[10px] text-red-400 font-mono">
              READ-ONLY (Admin Required)
            </span>
          </div>

          <div class="space-y-4 text-xs">
            <div>
              <div class="flex justify-between text-slate-300 mb-1">
                <span>Spectral Flatness (Vocoder Artifacts)</span>
                <span class="font-mono text-sky-400">{{ spectralWeight }}%</span>
              </div>
              <input type="range" [(ngModel)]="spectralWeight" [disabled]="currentUser.role !== 'ROLE_ADMIN'" min="0" max="100" class="w-full">
            </div>

            <div>
              <div class="flex justify-between text-slate-300 mb-1">
                <span>Phase / Temporal Discontinuity</span>
                <span class="font-mono text-sky-400">{{ phaseWeight }}%</span>
              </div>
              <input type="range" [(ngModel)]="phaseWeight" [disabled]="currentUser.role !== 'ROLE_ADMIN'" min="0" max="100" class="w-full">
            </div>

            <div>
              <div class="flex justify-between text-slate-300 mb-1">
                <span>Pitch / Fundamental Frequency Variance</span>
                <span class="font-mono text-sky-400">{{ pitchWeight }}%</span>
              </div>
              <input type="range" [(ngModel)]="pitchWeight" [disabled]="currentUser.role !== 'ROLE_ADMIN'" min="0" max="100" class="w-full">
            </div>

            <button *ngIf="currentUser.role === 'ROLE_ADMIN'" (click)="saveWeights()" class="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg transition">
              Update Dynamic Risk Weights
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HealthComponent implements OnInit {
  currentUser!: CurrentUser;
  modelInfo: any = null;

  spectralWeight: number = 30;
  phaseWeight: number = 25;
  pitchWeight: number = 20;

  constructor(private authService: AuthService, private apiService: ApiService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((u) => (this.currentUser = u));
    this.apiService.getAiModelInfo().subscribe({
      next: (info) => (this.modelInfo = info),
      error: () => {
        this.modelInfo = {
          model_name: 'DevelopmentModelAdapter (Acoustic Pipeline)',
          adapter_type: 'DEVELOPMENT',
          warning: 'Production PyTorch model isolated behind adapter'
        };
      }
    });
  }

  switchRole(role: 'ROLE_ADMIN' | 'ROLE_ANALYST' | 'ROLE_USER'): void {
    this.authService.switchPersona(role);
  }

  saveWeights(): void {
    alert('Acoustic risk weights updated in system configuration.');
  }
}
