import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../../core/services/audio.service';
import { ApiService } from '../../core/services/api.service';
import { DetectionResult, DetectionSession } from '../../core/models/detection.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div>
          <h1 class="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <span class="p-2 bg-sky-500/10 text-sky-400 rounded-lg">🎙️</span>
            Live Acoustic Voice Detection Engine
          </h1>
          <p class="text-slate-400 text-sm mt-1">
            Real-time spectral analysis, synthetic vocoder artifact identification, and voice-clone impersonation scoring.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <label class="text-xs font-semibold text-slate-400">Language:</label>
          <select [(ngModel)]="selectedLanguage" class="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2">
            <option value="EN">English (EN)</option>
            <option value="HI">Hindi (HI - हिंदी)</option>
            <option value="TE">Telugu (TE - తెలుగు)</option>
          </select>
        </div>
      </div>

      <!-- Controls & Input Methods -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Input Mode Card -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 class="text-lg font-semibold text-white mb-4">Input Audio Source</h2>
            
            <div class="flex gap-2 p-1 bg-slate-800 rounded-lg mb-6">
              <button 
                (click)="activeTab = 'mic'" 
                [class.bg-sky-600]="activeTab === 'mic'"
                [class.text-white]="activeTab === 'mic'"
                class="flex-1 py-2 text-xs font-semibold rounded-md text-slate-400 transition">
                Microphone Stream
              </button>
              <button 
                (click)="activeTab = 'upload'" 
                [class.bg-sky-600]="activeTab === 'upload'"
                [class.text-white]="activeTab === 'upload'"
                class="flex-1 py-2 text-xs font-semibold rounded-md text-slate-400 transition">
                Upload WAV/MP3
              </button>
            </div>

            <div *ngIf="activeTab === 'mic'" class="space-y-4 text-center py-4">
              <div class="relative inline-flex items-center justify-center">
                <div *ngIf="isRecording" class="absolute w-24 h-24 rounded-full bg-red-500/20 animate-ping"></div>
                <button 
                  (click)="toggleRecording()"
                  [class.bg-red-600]="isRecording"
                  [class.hover:bg-red-500]="isRecording"
                  [class.bg-sky-600]="!isRecording"
                  [class.hover:bg-sky-500]="!isRecording"
                  class="relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all">
                  <span class="text-2xl">{{ isRecording ? '⏹️' : '🎙️' }}</span>
                </button>
              </div>
              <p class="text-xs text-slate-400">
                {{ isRecording ? 'Recording active... click to stop and trigger deep acoustic inference' : 'Click to stream microphone audio' }}
              </p>
            </div>

            <div *ngIf="activeTab === 'upload'" class="space-y-4">
              <div 
                (dragover)="$event.preventDefault()" 
                (drop)="onFileDrop($event)"
                class="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-xl p-8 text-center cursor-pointer transition">
                <input type="file" accept="audio/*" (change)="onFileSelected($event)" class="hidden" #fileInput>
                <div (click)="fileInput.click()">
                  <span class="text-3xl block mb-2">📁</span>
                  <span class="text-sm font-medium text-slate-300">Drag & drop audio file or click to browse</span>
                  <span class="text-xs text-slate-500 block mt-1">Supports WAV, MP3, WebM up to 10MB</span>
                </div>
              </div>
              <div *ngIf="selectedFile" class="text-xs text-slate-300 bg-slate-800 p-3 rounded-lg flex items-center justify-between">
                <span>{{ selectedFile.name }} ({{ (selectedFile.size / 1024).toFixed(1) }} KB)</span>
                <button (click)="uploadAndAnalyze()" [disabled]="isProcessing" class="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium">
                  {{ isProcessing ? 'Analyzing...' : 'Analyze' }}
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="audioUrl" class="mt-4 pt-4 border-t border-slate-800">
            <span class="text-xs text-slate-400 block mb-1">Recorded Audio Playback:</span>
            <audio [src]="audioUrl" controls class="w-full h-8"></audio>
          </div>
        </div>

        <!-- Waveform Spectrum Canvas -->
        <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-white flex items-center gap-2">
              <span>📊</span> Real-Time Acoustic Waveform & Spectrum
            </h2>
            <span class="text-xs px-2.5 py-1 rounded-full font-mono"
              [class.bg-emerald-500/10]="!isRecording" [class.text-emerald-400]="!isRecording"
              [class.bg-red-500/10]="isRecording" [class.text-red-400]="isRecording">
              {{ isRecording ? 'LIVE STREAMING' : 'IDLE' }}
            </span>
          </div>

          <div class="flex-1 min-h-[160px] bg-slate-950 rounded-lg p-3 flex items-end gap-1 overflow-hidden border border-slate-800/60">
            <div 
              *ngFor="let val of frequencyBars" 
              class="flex-1 rounded-t transition-all duration-75"
              [style.height.%]="(val / 255) * 100"
              [class.bg-sky-500]="val < 150"
              [class.bg-amber-400]="val >= 150 && val < 210"
              [class.bg-red-500]="val >= 210">
            </div>
          </div>
          <p class="text-xs text-slate-500 mt-2">
            FFT frequency bins monitored for vocoder artifact phase anomalies and high-frequency spectral flux.
          </p>
        </div>
      </div>

      <!-- Detection Results & Risk Gauge (Shown when result exists) -->
      <div *ngIf="latestResult" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- Risk Score Gauge -->
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center flex flex-col justify-center items-center">
            <span class="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Security Risk Score</span>
            <div class="relative w-36 h-36 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path class="text-slate-800" stroke-width="3.5" stroke="currentColor" fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path [attr.stroke]="getRiskColor(latestResult.securityRiskScore)" stroke-width="3.5" stroke-dasharray="100, 100"
                  [attr.stroke-dashoffset]="100 - latestResult.securityRiskScore" stroke-linecap="round" fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              </svg>
              <div class="absolute flex flex-col items-center">
                <span class="text-3xl font-bold font-mono text-white">{{ latestResult.securityRiskScore.toFixed(1) }}</span>
                <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded mt-1" [class]="getThreatBadgeClass(latestResult.threatLevel)">
                  {{ latestResult.threatLevel }}
                </span>
              </div>
            </div>
            <span class="text-xs text-slate-500 mt-2">Scale: 0 (Safe) - 100 (Impersonation)</span>
          </div>

          <!-- Classification -->
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <span class="text-xs font-semibold uppercase text-slate-400 tracking-wider">Classification</span>
              <div class="mt-3 text-2xl font-bold text-white flex items-center gap-2">
                <span *ngIf="latestResult.classification === 'HUMAN'" class="text-emerald-400">👤 Authentic Human</span>
                <span *ngIf="latestResult.classification === 'SYNTHETIC'" class="text-red-400">🤖 AI Synthetic</span>
                <span *ngIf="latestResult.classification === 'VOICE_CLONED'" class="text-rose-500">🎭 Voice Clone</span>
                <span *ngIf="latestResult.classification === 'SUSPICIOUS'" class="text-amber-400">⚠️ Suspicious</span>
                <span *ngIf="latestResult.classification === 'UNCERTAIN'" class="text-slate-400">❓ Uncertain</span>
              </div>
              <p class="text-xs text-slate-400 mt-2">
                AI probability: <span class="font-mono text-white">{{ (latestResult.aiGeneratedProbability * 100).toFixed(1) }}%</span> | 
                Clone probability: <span class="font-mono text-white">{{ (latestResult.voiceCloneProbability * 100).toFixed(1) }}%</span>
              </p>
            </div>
            <div class="pt-4 border-t border-slate-800">
              <span class="text-xs text-slate-400">Model Confidence: </span>
              <span class="text-xs font-mono font-semibold text-sky-400">{{ (latestResult.modelConfidence * 100).toFixed(1) }}%</span>
            </div>
          </div>

          <!-- Recommended Action Banner -->
          <div class="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase text-slate-400 tracking-wider">Recommended Immediate Action</span>
                <span *ngIf="latestResult.isDevelopmentResult" class="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                  DEVELOPMENT ADAPTER ACTIVE
                </span>
              </div>
              <div class="mt-3 p-3 rounded-lg border text-sm font-semibold flex items-center gap-3"
                [class.bg-emerald-950/40]="latestResult.threatLevel === 'LOW'"
                [class.border-emerald-800]="latestResult.threatLevel === 'LOW'"
                [class.text-emerald-300]="latestResult.threatLevel === 'LOW'"
                [class.bg-red-950/40]="latestResult.threatLevel === 'HIGH' || latestResult.threatLevel === 'CRITICAL'"
                [class.border-red-800]="latestResult.threatLevel === 'HIGH' || latestResult.threatLevel === 'CRITICAL'"
                [class.text-red-200]="latestResult.threatLevel === 'HIGH' || latestResult.threatLevel === 'CRITICAL'">
                <span class="text-xl">🛡️</span>
                <span>{{ latestResult.recommendedAction }}</span>
              </div>
              <p class="text-xs text-slate-400 mt-3">{{ latestResult.explanationSummary }}</p>
            </div>

            <div class="text-[11px] text-slate-500 pt-3 border-t border-slate-800 flex justify-between">
              <span>Inference Duration: {{ latestResult.inferenceDurationMs }}ms</span>
              <span>Model Version: {{ latestResult.modelVersion }}</span>
            </div>
          </div>
        </div>

        <!-- Transparent Signal Breakdown -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🔍</span> Transparent Acoustic Risk Signals (Normalized 0–100)
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngFor="let sig of latestResult.signals" class="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold text-slate-200">{{ formatSignalName(sig.signalType) }}</span>
                <span class="text-xs px-2 py-0.5 rounded font-mono"
                  [class.bg-red-500/10]="sig.anomalyDetected" [class.text-red-400]="sig.anomalyDetected"
                  [class.bg-emerald-500/10]="!sig.anomalyDetected" [class.text-emerald-400]="!sig.anomalyDetected">
                  {{ sig.anomalyDetected ? 'ANOMALY DETECTED' : 'NORMAL RANGE' }}
                </span>
              </div>

              <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                <div class="h-full bg-sky-500 rounded-full" [style.width.%]="sig.contributionScore"></div>
              </div>

              <div class="flex justify-between text-xs text-slate-400">
                <span>Weight: {{ sig.weightPercentage }}%</span>
                <span>Contribution: {{ sig.contributionScore.toFixed(1) }} pts</span>
              </div>
              <p class="text-xs text-slate-400 mt-2">{{ sig.explanation }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DetectionComponent implements OnInit, OnDestroy {
  activeTab: 'mic' | 'upload' = 'mic';
  selectedLanguage: string = 'EN';
  isRecording: boolean = false;
  isProcessing: boolean = false;
  selectedFile: File | null = null;
  audioUrl: string | null = null;
  latestResult: DetectionResult | null = null;

  frequencyBars: number[] = Array(32).fill(10);
  private audioSub: Subscription | null = null;

  constructor(private audioService: AudioService, private apiService: ApiService) {}

  ngOnInit(): void {
    this.audioSub = this.audioService.audioData$.subscribe((data) => {
      if (data.length > 0) {
        const step = Math.floor(data.length / 32);
        this.frequencyBars = Array.from({ length: 32 }, (_, i) => data[i * step] || 10);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.audioSub) this.audioSub.unsubscribe();
  }

  async toggleRecording(): Promise<void> {
    if (this.isRecording) {
      this.isRecording = false;
      this.isProcessing = true;
      const { blob, base64 } = await this.audioService.stopRecording();
      this.audioUrl = URL.createObjectURL(blob);

      this.apiService.analyzeAudioJson({
        audioBase64: base64,
        language: this.selectedLanguage,
        channelType: 'MICROPHONE_STREAM'
      }).subscribe({
        next: (session) => {
          this.latestResult = session.result || null;
          this.isProcessing = false;
        },
        error: (err) => {
          console.error(err);
          this.isProcessing = false;
        }
      });
    } else {
      try {
        await this.audioService.startRecording();
        this.isRecording = true;
      } catch (e) {
        console.error('Microphone access error:', e);
      }
    }
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  uploadAndAnalyze(): void {
    if (!this.selectedFile) return;
    this.isProcessing = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('language', this.selectedLanguage);

    this.apiService.analyzeAudioUpload(formData).subscribe({
      next: (session) => {
        this.latestResult = session.result || null;
        this.isProcessing = false;
      },
      error: (err) => {
        console.error(err);
        this.isProcessing = false;
      }
    });
  }

  getRiskColor(score: number): string {
    if (score < 30) return '#10b981';
    if (score < 70) return '#f59e0b';
    return '#ef4444';
  }

  getThreatBadgeClass(threat: string): string {
    switch (threat) {
      case 'LOW': return 'bg-emerald-500/20 text-emerald-400';
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400';
      case 'CRITICAL': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  }

  formatSignalName(sig: string): string {
    return sig.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
