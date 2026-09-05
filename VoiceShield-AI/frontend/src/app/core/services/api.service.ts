import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardMetrics, DetectionSession, SecurityAlert, VerificationChallenge } from '../models/detection.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  analyzeAudioUpload(formData: FormData): Observable<DetectionSession> {
    return this.http.post<DetectionSession>(`${this.baseUrl}/detection/upload`, formData);
  }

  analyzeAudioJson(payload: { audioBase64: string; language: string; channelType: string }): Observable<DetectionSession> {
    return this.http.post<DetectionSession>(`${this.baseUrl}/detection/start`, payload);
  }

  getRecentSessions(): Observable<DetectionSession[]> {
    return this.http.get<DetectionSession[]>(`${this.baseUrl}/detection/history`);
  }

  startVerificationChallenge(payload: { language: string; sessionId?: string }): Observable<VerificationChallenge> {
    return this.http.post<VerificationChallenge>(`${this.baseUrl}/verification/challenge/start`, payload);
  }

  completeVerificationChallenge(payload: { challengeSessionId: string; audioBase64: string }): Observable<VerificationChallenge> {
    return this.http.post<VerificationChallenge>(`${this.baseUrl}/verification/challenge/complete`, payload);
  }

  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.baseUrl}/analytics/dashboard`);
  }

  getAlerts(): Observable<SecurityAlert[]> {
    return this.http.get<SecurityAlert[]>(`${this.baseUrl}/alerts/recent`);
  }

  updateAlert(id: string, payload: { status: string; investigationNotes?: string; actionTaken?: string }): Observable<SecurityAlert> {
    return this.http.patch<SecurityAlert>(`${this.baseUrl}/alerts/${id}`, payload);
  }

  getSystemHealth(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/health`);
  }

  getAiModelInfo(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/model-info`);
  }
}
