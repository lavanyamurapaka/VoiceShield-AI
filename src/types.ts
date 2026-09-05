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
  sessionId: string;
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
  timestamp: string;
  channelType: string;
  fileName?: string;
}

export interface VerificationChallenge {
  id: string;
  phrase: string;
  language: 'EN' | 'HI' | 'TE';
  status: 'IDLE' | 'RECORDING' | 'ANALYZING' | 'PASS' | 'FAIL' | 'UNCERTAIN';
  similarityScore?: number;
  timingAnomaly?: boolean;
  verdict?: 'PASS' | 'FAIL' | 'UNCERTAIN';
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
  assignedTo: string;
  investigationNotes?: string;
  actionTaken?: string;
  createdAt: string;
  riskScore: number;
  classification: Classification;
}

export interface UserPersona {
  id: string;
  username: string;
  role: 'ROLE_ADMIN' | 'ROLE_ANALYST' | 'ROLE_USER';
  roleName: 'System Administrator' | 'Security Analyst' | 'Operations Agent';
  department: string;
}

export type AccountRole = 'USER' | 'ANALYST' | 'ADMIN';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  organization?: string;
  jobRole?: string;
  accountRole: AccountRole;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  isActive: boolean;
  authProvider: 'password' | 'google';
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  organization?: string;
  jobRole?: string;
  accountRole: 'USER' | 'ANALYST';
}
