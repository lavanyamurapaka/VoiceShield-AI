import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AudioService } from '../../core/services/audio.service';
import { VerificationChallenge } from '../../core/models/detection.model';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h1 class="text-2xl font-bold text-white flex items-center gap-3">
          <span class="p-2 bg-purple-500/10 text-purple-400 rounded-lg">🔐</span>
          Secondary Challenge-Response Verification
        </h1>
        <p class="text-slate-400 text-sm mt-1">
          Dynamic cryptographic challenge phrase validation assessing phrase accuracy, acoustic speech characteristics, and acoustic consistency.
        </p>

        <!-- Prominent Disclaimer -->
        <div class="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-center gap-2">
          <span>⚠️</span>
          <span><strong>Security Disclaimer:</strong> Secondary verification is an additional biometric signal and not absolute proof of identity. Follow multi-factor authorization procedures.</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Challenge Configuration -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <h2 class="text-lg font-semibold text-white">Step 1: Generate Challenge</h2>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-2">Challenge Language</label>
            <select [(ngModel)]="language" class="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5">
              <option value="EN">English (EN)</option>
              <option value="HI">Hindi (HI - हिंदी)</option>
              <option value="TE">Telugu (TE - తెలుగు)</option>
            </select>
          </div>

          <button (click)="generateChallenge()" [disabled]="isLoading" class="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition text-sm">
            {{ isLoading ? 'Generating...' : 'Generate Dynamic Phrase' }}
          </button>

          <div *ngIf="currentChallenge" class="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <span class="text-xs text-slate-400 font-semibold block">Please read aloud:</span>
            <p class="text-base font-bold text-sky-400 font-mono italic">
              "{{ currentChallenge.challengePhrase }}"
            </p>
          </div>
        </div>

        <!-- Recording & Response -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 flex flex-col justify-between">
          <div>
            <h2 class="text-lg font-semibold text-white mb-4">Step 2: Voice Response</h2>

            <div *ngIf="!currentChallenge" class="text-center py-12 text-slate-500 text-sm">
              Generate a challenge phrase first to begin recording.
            </div>

            <div *ngIf="currentChallenge" class="space-y-6 text-center py-4">
              <div class="relative inline-flex items-center justify-center">
                <div *ngIf="isRecording" class="absolute w-24 h-24 rounded-full bg-red-500/20 animate-ping"></div>
                <button 
                  (click)="toggleRecording()"
                  [class.bg-red-600]="isRecording"
                  [class.hover:bg-red-500]="isRecording"
                  [class.bg-purple-600]="!isRecording"
                  [class.hover:bg-purple-500]="!isRecording"
                  class="relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all">
                  <span class="text-2xl">{{ isRecording ? '⏹️' : '🎙️' }}</span>
                </button>
              </div>
              <p class="text-xs text-slate-400">
                {{ isRecording ? 'Recording response... speak clearly' : 'Click microphone to record challenge response' }}
              </p>
            </div>
          </div>

          <div *ngIf="recordedAudioUrl" class="pt-4 border-t border-slate-800">
            <span class="text-xs text-slate-400 block mb-1">Preview Response:</span>
            <audio [src]="recordedAudioUrl" controls class="w-full h-8"></audio>
          </div>
        </div>

        <!-- Verification Result -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 class="text-lg font-semibold text-white mb-4">Step 3: Verification Verdict</h2>

            <div *ngIf="!verificationResult" class="text-center py-12 text-slate-500 text-sm">
              Verification verdict and speech acoustic match will appear here.
            </div>

            <div *ngIf="verificationResult" class="space-y-4">
              <div class="p-6 rounded-xl text-center border"
                [class.bg-emerald-950/30]="verificationResult.status === 'PASS'"
                [class.border-emerald-800]="verificationResult.status === 'PASS'"
                [class.bg-red-950/30]="verificationResult.status === 'FAIL'"
                [class.border-red-800]="verificationResult.status === 'FAIL'"
                [class.bg-amber-950/30]="verificationResult.status === 'UNCERTAIN'"
                [class.border-amber-800]="verificationResult.status === 'UNCERTAIN'">
                
                <span class="text-4xl block mb-2">
                  {{ verificationResult.status === 'PASS' ? '✅' : (verificationResult.status === 'FAIL' ? '❌' : '⚠️') }}
                </span>
                <span class="text-2xl font-bold font-mono"
                  [class.text-emerald-400]="verificationResult.status === 'PASS'"
                  [class.text-red-400]="verificationResult.status === 'FAIL'"
                  [class.text-amber-400]="verificationResult.status === 'UNCERTAIN'">
                  VERDICT: {{ verificationResult.status }}
                </span>
                <p class="text-xs text-slate-400 mt-2">
                  Similarity Score: <span class="font-mono text-white font-bold">{{ ((verificationResult.similarityScore || 0) * 100).toFixed(1) }}%</span>
                </p>
              </div>

              <div class="p-3 bg-slate-950 rounded-lg text-xs text-slate-300 space-y-1">
                <span class="font-semibold block text-slate-200">Acoustic Analysis Details:</span>
                <p class="text-slate-400">{{ verificationResult.explanation }}</p>
                <div class="flex justify-between pt-2 text-slate-500">
                  <span>Timing Anomaly: {{ verificationResult.timingAnomalyDetected ? 'DETECTED' : 'NONE' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="verificationResult" class="pt-4 border-t border-slate-800 text-[11px] text-slate-500 italic">
            {{ verificationResult.disclaimer }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class VerificationComponent {
  language: string = 'EN';
  isLoading: boolean = false;
  isRecording: boolean = false;
  currentChallenge: VerificationChallenge | null = null;
  recordedAudioUrl: string | null = null;
  verificationResult: VerificationChallenge | null = null;

  constructor(private apiService: ApiService, private audioService: AudioService) {}

  generateChallenge(): void {
    this.isLoading = true;
    this.verificationResult = null;
    this.recordedAudioUrl = null;

    this.apiService.startVerificationChallenge({ language: this.language }).subscribe({
      next: (res) => {
        this.currentChallenge = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  async toggleRecording(): Promise<void> {
    if (this.isRecording) {
      this.isRecording = false;
      const { blob, base64 } = await this.audioService.stopRecording();
      this.recordedAudioUrl = URL.createObjectURL(blob);

      if (this.currentChallenge) {
        this.apiService.completeVerificationChallenge({
          challengeSessionId: this.currentChallenge.challengeSessionId,
          audioBase64: base64
        }).subscribe({
          next: (result) => {
            this.verificationResult = result;
          },
          error: (err) => console.error(err)
        });
      }
    } else {
      await this.audioService.startRecording();
      this.isRecording = true;
    }
  }
}
