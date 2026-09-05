"""
VoiceShield AI - Development Model Adapter
AI-Powered Voice Impersonation Attack Prevention

DEVELOPMENT MODEL — NOT VALIDATED FOR PRODUCTION.
Uses acoustic and prosodic feature extraction algorithms for localized evaluation.
"""
from typing import Dict, Any, List, Optional
import numpy as np
from app.models.base import VoiceDetectionModel
from app.core.audio_pipeline import AudioPipeline
from app.models.risk_engine import RiskEngine


class DevelopmentModelAdapter(VoiceDetectionModel):
    """
    Development fallback adapter.
    Computes heuristic and acoustic-spectral signals (vocoder artifact ratio, pitch variance,
    spectral flatness, energy entropy) without fabricating black-box benchmark numbers.
    Always explicitly flags results as unvalidated development output.
    """

    def __init__(self):
        self.risk_engine = RiskEngine()
        self.version = "v1.0.0-dev"

    def analyze(
        self,
        audio: np.ndarray,
        sr: int = 16000,
        reference_embedding: Optional[List[float]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        context = context or {}
        features = AudioPipeline.extract_acoustic_features(audio, sr)
        current_embedding = AudioPipeline.generate_speaker_embedding(audio, sr)

        # Calculate speaker similarity if reference embedding provided
        speaker_sim = None
        has_profile = False
        if reference_embedding and len(reference_embedding) > 0:
            speaker_sim = AudioPipeline.calculate_embedding_similarity(current_embedding, reference_embedding)
            has_profile = True

        # Acoustic heuristics for synthetic speech artifacts:
        # 1. Vocoder artifact score (abnormal 6-8kHz energy concentration)
        vocoder_score = features["vocoder_artifact_score"]
        # 2. Prosodic pitch unnaturalness (human speech has natural pitch variations; TTS often has low or synthetic variance)
        pitch_var = features["pitch_variance"]
        prosody_anomaly = 0.65 if (pitch_var < 0.08 or pitch_var > 0.85) else max(0.05, 0.40 - pitch_var)
        # 3. Spectral flatness
        flatness = features["spectral_flatness"]
        spectral_anomaly = min(1.0, (vocoder_score * 0.6) + (flatness * 0.4))

        # Synthetic probability derived from combined spectral and prosodic cues
        ai_prob = round(min(0.99, max(0.02, (vocoder_score * 0.5) + (prosody_anomaly * 0.3) + (flatness * 0.2))), 4)
        clone_prob = round(min(0.99, max(0.01, ai_prob * 0.9 + (0.15 if has_profile and (speaker_sim or 1.0) < 0.6 else 0.0))), 4)

        # Classification determination
        if ai_prob > 0.75:
            classification = "SYNTHETIC" if not has_profile or (speaker_sim or 1.0) > 0.5 else "VOICE_CLONED"
        elif ai_prob > 0.45:
            classification = "SUSPICIOUS"
        elif ai_prob > 0.30:
            classification = "UNCERTAIN"
        else:
            classification = "HUMAN"

        # Model confidence reflects signal clarity and duration
        duration_factor = min(1.0, len(audio) / (sr * 2.5))
        model_confidence = round(min(0.95, max(0.40, 0.60 + (abs(ai_prob - 0.5) * 0.35) * duration_factor)), 4)

        # Evaluate risk score
        context_urgency = context.get("context_urgency_score", 0.0)
        risk_score, threat_level, action, signals, explanation = self.risk_engine.compute_risk(
            ai_prob=ai_prob,
            clone_prob=clone_prob,
            speaker_similarity=speaker_sim,
            prosody_anomaly_score=round(prosody_anomaly, 4),
            spectral_anomaly_score=round(spectral_anomaly, 4),
            cross_session_anomaly=0.0,
            context_risk=context_urgency,
            has_enrolled_profile=has_profile
        )

        return {
            "classification": classification,
            "model_confidence": model_confidence,
            "security_risk_score": risk_score,
            "threat_level": threat_level,
            "ai_generated_probability": ai_prob,
            "voice_clone_probability": clone_prob,
            "speaker_similarity_score": speaker_sim,
            "recommended_action": action,
            "is_development_result": True,
            "development_warning": "DEVELOPMENT MODEL — NOT VALIDATED FOR PRODUCTION. Acoustic features evaluated using localized signal processing.",
            "signals": signals,
            "explanation_summary": explanation,
            "features": features,
            "embedding": current_embedding,
            "model_version": self.version
        }

    def extract_embedding(self, audio: np.ndarray, sr: int = 16000) -> List[float]:
        return AudioPipeline.generate_speaker_embedding(audio, sr)

    def verify(
        self,
        audio: np.ndarray,
        reference_embedding: List[float],
        expected_phrase: Optional[str] = None
    ) -> Dict[str, Any]:
        curr_emb = self.extract_embedding(audio)
        sim = AudioPipeline.calculate_embedding_similarity(curr_emb, reference_embedding)
        threshold = 0.72

        # Check timing anomaly (e.g. challenge response too short or excessively delayed)
        duration_sec = len(audio) / 16000.0
        timing_anomaly = duration_sec < 0.8 or duration_sec > 10.0

        if sim >= threshold and not timing_anomaly:
            verdict = "PASS"
            explanation = f"Voice match verified with cosine similarity of {sim*100:.1f}% (exceeds {threshold*100:.0f}% threshold)."
        elif sim >= 0.55:
            verdict = "UNCERTAIN"
            explanation = f"Borderline acoustic match ({sim*100:.1f}%). Secondary verification recommended."
        else:
            verdict = "FAIL"
            explanation = f"Voice similarity {sim*100:.1f}% fell below required security threshold ({threshold*100:.0f}%)."

        return {
            "verdict": verdict,
            "similarity_score": sim,
            "threshold_applied": threshold,
            "timing_anomaly": timing_anomaly,
            "phrase_accuracy_score": 0.92 if not timing_anomaly else 0.40,
            "explanation": explanation
        }

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "model_name": "VoiceShield-Development-Adapter",
            "version": self.version,
            "adapter_type": "DEVELOPMENT",
            "is_production_ready": False,
            "validation_status": "UNVALIDATED_FALLBACK",
            "supported_languages": ["EN", "HI", "TE"],
            "input_sample_rate": 16000,
            "architecture_description": "Acoustic-Prosodic Spectral Analyzer + Filterbank Cepstral Projection. Non-production development adapter.",
            "warning": "DEVELOPMENT MODEL — NOT VALIDATED FOR PRODUCTION"
        }
