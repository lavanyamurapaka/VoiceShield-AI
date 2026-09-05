"""
VoiceShield AI - FastAPI AI Microservice Entry Point
AI-Powered Voice Impersonation Prevention
"""
import os
import time
import base64
import logging
from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.schemas.detection import (
    AudioAnalysisRequest,
    DetectionResponse,
    EmbeddingRequest,
    EmbeddingResponse,
    VerificationRequest,
    VerificationResponse,
    ModelInfoResponse,
    HealthResponse,
    RiskSignalItem
)
from app.core.audio_pipeline import AudioPipeline
from app.models.base import VoiceDetectionModel
from app.models.development_adapter import DevelopmentModelAdapter
from app.models.production_adapter import ProductionModelAdapter

# Setup structured logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("voiceshield-ai-service")

app = FastAPI(
    title="Voice Shield AI Detection Engine",
    description="SIH26104: AI-Powered Real-Time Detection and Prevention of Voice-Cloning Impersonation Attacks",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Adapter selection based on environment configuration
adapter_mode = os.getenv("MODEL_ADAPTER", "development").lower()
if adapter_mode == "production":
    logger.info("Initializing ProductionModelAdapter...")
    model_instance: VoiceDetectionModel = ProductionModelAdapter()
else:
    logger.info("Initializing DevelopmentModelAdapter (Fallback mode)...")
    model_instance: VoiceDetectionModel = DevelopmentModelAdapter()


@app.get("/ai/health", response_model=HealthResponse, tags=["Health & Status"])
def get_health():
    """Health check endpoint for Docker and Spring Boot microservice probes."""
    model_info = model_instance.get_model_info()
    return HealthResponse(
        status="HEALTHY",
        service="voiceshield-ai-service",
        version="1.0.0",
        active_adapter=model_info["adapter_type"],
        cpu_percent=12.4,
        memory_mb=184.2
    )


@app.get("/ai/model-info", response_model=ModelInfoResponse, tags=["Model Governance"])
def get_model_info():
    """Returns technical metadata about the active speech model and validation state."""
    info = model_instance.get_model_info()
    return ModelInfoResponse(**info)


@app.post("/ai/analyze", response_model=DetectionResponse, tags=["Voice Detection"])
def analyze_audio(request: AudioAnalysisRequest):
    """
    Analyzes an audio payload for synthetic speech and voice-cloning indicators.
    Computes spectral metrics, pitch variance, and risk score contributions.
    """
    start_time = time.time()

    if not request.audio_base64:
        raise HTTPException(status_code=400, detail="Missing audio payload in audio_base64 field")

    try:
        audio_bytes = base64.b64decode(request.audio_base64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 encoding: {str(e)}")

    if len(audio_bytes) < 100:
        raise HTTPException(status_code=400, detail="Audio file too short or invalid")

    # Decode and normalize audio
    audio_arr, sr, duration_ms = AudioPipeline.decode_and_normalize(audio_bytes, request.sample_rate or 16000)

    if duration_ms < 300:
        raise HTTPException(status_code=400, detail="Audio duration is too short. Minimum 300ms required for acoustic analysis.")

    # Contextual parameters
    context = {"context_urgency_score": request.context_urgency_score or 0.0}

    # Execute model inference
    result = model_instance.analyze(
        audio=audio_arr,
        sr=sr,
        reference_embedding=request.reference_embedding,
        context=context
    )

    inference_ms = int((time.time() - start_time) * 1000)

    signals_list = [RiskSignalItem(**s) for s in result["signals"]]

    return DetectionResponse(
        session_id=request.session_id,
        classification=result["classification"],
        model_confidence=result["model_confidence"],
        security_risk_score=result["security_risk_score"],
        threat_level=result["threat_level"],
        ai_generated_probability=result["ai_generated_probability"],
        voice_clone_probability=result["voice_clone_probability"],
        speaker_similarity_score=result["speaker_similarity_score"],
        recommended_action=result["recommended_action"],
        is_development_result=result["is_development_result"],
        development_warning=result.get("development_warning"),
        signals=signals_list,
        explanation_summary=result["explanation_summary"],
        inference_duration_ms=inference_ms,
        detected_language=request.language or "EN",
        model_version=result["model_version"]
    )


@app.post("/ai/embedding", response_model=EmbeddingResponse, tags=["Voice Profile"])
def extract_embedding(request: EmbeddingRequest):
    """
    Extracts high-dimensional acoustic speaker embedding for biometric enrollment and verification.
    """
    try:
        audio_bytes = base64.b64decode(request.audio_base64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 encoding: {str(e)}")

    audio_arr, sr, duration_ms = AudioPipeline.decode_and_normalize(audio_bytes, request.sample_rate)
    
    if duration_ms < 500:
        raise HTTPException(status_code=400, detail="Audio sample too short for profile enrollment (minimum 500ms)")

    emb = model_instance.extract_embedding(audio_arr, sr)
    return EmbeddingResponse(
        embedding=emb,
        dimension=len(emb),
        algorithm="MelFilterbank-DCT-Projection",
        sample_rate=sr,
        duration_ms=duration_ms
    )


@app.post("/ai/verify", response_model=VerificationResponse, tags=["Secondary Verification"])
def verify_voice(request: VerificationRequest):
    """
    Performs challenge-response biometric voice verification against reference embedding.
    """
    try:
        audio_bytes = base64.b64decode(request.audio_base64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 encoding: {str(e)}")

    audio_arr, sr, duration_ms = AudioPipeline.decode_and_normalize(audio_bytes, 16000)
    verif = model_instance.verify(audio_arr, request.reference_embedding, request.expected_phrase)

    return VerificationResponse(
        verdict=verif["verdict"],
        similarity_score=verif["similarity_score"],
        threshold_applied=verif["threshold_applied"],
        timing_anomaly=verif["timing_anomaly"],
        phrase_accuracy_score=verif.get("phrase_accuracy_score"),
        explanation=verif["explanation"]
    )
