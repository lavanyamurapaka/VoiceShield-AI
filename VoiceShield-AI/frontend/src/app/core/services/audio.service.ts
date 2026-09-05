import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphoneStream: MediaStream | null = null;

  private isRecordingSubject = new BehaviorSubject<boolean>(false);
  public isRecording$: Observable<boolean> = this.isRecordingSubject.asObservable();

  private audioDataSubject = new BehaviorSubject<Uint8Array>(new Uint8Array(0));
  public audioData$: Observable<Uint8Array> = this.audioDataSubject.asObservable();

  private animationFrameId: number | null = null;

  async startRecording(): Promise<void> {
    this.audioChunks = [];
    this.microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.audioContext = new AudioContext({ sampleRate: 16000 });
    const source = this.audioContext.createMediaStreamSource(this.microphoneStream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);

    this.mediaRecorder = new MediaRecorder(this.microphoneStream);
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(250);
    this.isRecordingSubject.next(true);
    this.startAudioVisualization();
  }

  stopRecording(): Promise<{ blob: Blob; base64: string }> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve({ blob: new Blob(), base64: '' });
        return;
      }

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        const base64 = await this.blobToBase64(audioBlob);

        this.cleanup();
        this.isRecordingSubject.next(false);
        resolve({ blob: audioBlob, base64 });
      };

      this.mediaRecorder.stop();
    });
  }

  private startAudioVisualization(): void {
    if (!this.analyser) return;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVisual = () => {
      if (this.analyser && this.isRecordingSubject.value) {
        this.analyser.getByteFrequencyData(dataArray);
        this.audioDataSubject.next(new Uint8Array(dataArray));
        this.animationFrameId = requestAnimationFrame(updateVisual);
      }
    };
    updateVisual();
  }

  private cleanup(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach((track) => track.stop());
      this.microphoneStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  public blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1] || '';
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
