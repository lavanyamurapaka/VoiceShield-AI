"""
VoiceShield AI - Data Transfer Schemas for FastAPI AI Service
AI-Powered Voice Impersonation Attack Prevention
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AudioAnalysisRequest(BaseModel):
    session_id: str = Field(..., description="Unique UUID of the detection session")
    audio_base64: Optional[str] = Field(None, description="Base64 encoded audio payload (PCM or WAV)")
    audio_format: str = Field("WAV", description="Audio container format: WAV, MP3, WEBM")
    sample_rate: Optional[int] = Field(16000, description="Target sampling rate")
    language: Optional[str] = Field("EN", description="Anticipated language code: EN, HI, TE")
    reference_embedding: Optional[List[float]] = Field(None, description="Optional verified reference speaker embedding")
    context_urgency_score: Optional[float] = Field(0.0, ge=0.0, le=1.0, description="Contextual urgency signal (0.0 - 1.0)")


class RiskSignalItem(BaseModel):
    signal_type: str
    anomaly_detected: bool
    raw_metric_value: float
    weight_percentage: float
    contribution_score: float
    explanation: str


class DetectionResponse(BaseModel):
    session_id: str
    classification: str  # HUMAN, SYNTHETIC, VOICE_CLONED, SUSPICIOUS, UNCERTAIN
    model_confidence: float  # 0.0000 - 1.0000
    security_risk_score: float  # 0.00 - 100.00
    threat_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    ai_generated_probability: float
    voice_clone_probability: float
    speaker_similarity_score: Optional[float] = None
    recommended_action: str
    is_development_result: bool
    development_warning: Optional[str] = None
    signals: List[RiskSignalItem]
    explanation_summary: str
    inference_duration_ms: int
    detected_language: str
    model_version: str


class EmbeddingRequest(BaseModel):
    audio_base64: str
    audio_format: str = "WAV"
    sample_rate: int = 16000


class EmbeddingResponse(BaseModel):
    embedding: List[float]
    dimension: int
    algorithm: str
    sample_rate: int
    duration_ms: int


class VerificationRequest(BaseModel):
    audio_base64: str
    reference_embedding: List[float]
    expected_phrase: Optional[str] = None
    language: str = "EN"


class VerificationResponse(BaseModel):
    verdict: str  # PASS, FAIL, UNCERTAIN
    similarity_score: float
    threshold_applied: float
    timing_anomaly: bool
    phrase_accuracy_score: Optional[float] = None
    explanation: str
    disclaimer: str = "Secondary verification is an additional security signal and not absolute proof of identity."


class ModelInfoResponse(BaseModel):
    model_name: str
    version: str
    adapter_type: str  # PRODUCTION or DEVELOPMENT
    is_production_ready: bool
    validation_status: str
    supported_languages: List[str]
    input_sample_rate: int
    architecture_description: str
    warning: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    active_adapter: str
    cpu_percent: Optional[float] = None
    memory_mb: Optional[float] = None
