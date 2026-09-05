export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Classification = 'HUMAN' | 'SYNTHETIC' | 'VOICE_CLONED' | 'SUSPICIOUS' | 'UNCERTAIN';

export interface RiskSignal {
  signalType: string;
  anomalyDetected: boolean;
  rawMetricValue: number;
  weightPercentage: number;
  contributionScore: number;
  explanation: string;
}

export interface DetectionResult {
  id: string;
  classification: Classification;
  modelConfidence: number;
  securityRiskScore: number;
  threatLevel: ThreatLevel;
  aiGeneratedProbability: number;
  voiceCloneProbability: number;
  speakerSimilarityScore?: number;
  recommendedAction: string;
  isDevelopmentResult: boolean;
  developmentWarning?: string;
  explanationSummary: string;
  inferenceDurationMs: number;
  modelVersion: string;
  signals: RiskSignal[];
}

export interface DetectionSession {
  sessionId: string;
  sessionToken: string;
  status: string;
  channelType: string;
  audioFormat: string;
  durationMs?: number;
  languageCode: string;
  createdAt: string;
  result?: DetectionResult;
}

export interface VerificationChallenge {
  challengeSessionId: string;
  challengePhrase: string;
  language: string;
  status: 'PENDING' | 'PASS' | 'FAIL' | 'UNCERTAIN';
  similarityScore?: number;
  timingAnomalyDetected?: boolean;
  verdict?: string;
  explanation?: string;
  disclaimer: string;
}

export interface SecurityAlert {
  id: string;
  sessionId: string;
  severity: ThreatLevel;
  status: 'NEW' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'FALSE_POSITIVE';
  title: string;
  description: string;
  assignedToUsername?: string;
  investigationNotes?: string;
  actionTaken?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface DashboardMetrics {
  totalAnalyses: number;
  highRiskSessions: number;
  criticalAlerts: number;
  pendingInvestigations: number;
  modelEvaluationStatus: string;
  aiServiceStatus: string;
  databaseStatus: string;
  detectionDistribution: Record<string, number>;
  recentAlerts: SecurityAlert[];
  recentSessions: DetectionSession[];
}
