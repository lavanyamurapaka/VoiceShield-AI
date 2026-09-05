"""
VoiceShield AI - Transparent Configurable Risk Engine
AI-Powered Voice Impersonation Attack Prevention
"""
from typing import Dict, Any, List, Tuple


class RiskEngine:
    """
    Transparent risk engine that aggregates multi-modal acoustic, model, and behavioral signals.
    Does not rely on a single black-box score. Computes factor contributions and explains verdicts.
    """

    def __init__(self, config: Dict[str, float] = None):
        # Default configurable weights summing to 1.00 (100%)
        self.weights = config or {
            "ai_detection": 0.30,
            "speaker_mismatch": 0.20,
            "prosody_anomaly": 0.15,
            "spectral_anomaly": 0.15,
            "cross_session": 0.10,
            "contextual_risk": 0.10,
        }

    def compute_risk(
        self,
        ai_prob: float,
        clone_prob: float,
        speaker_similarity: float = None,
        prosody_anomaly_score: float = 0.0,
        spectral_anomaly_score: float = 0.0,
        cross_session_anomaly: float = 0.0,
        context_risk: float = 0.0,
        has_enrolled_profile: bool = False
    ) -> Tuple[float, str, str, List[Dict[str, Any]], str]:
        """
        Calculates composite normalized risk score [0.0 - 100.0], threat level, recommended action,
        and detailed factor contributions for explainability.
        """
        # If speaker profile is enrolled, speaker mismatch = (1.0 - speaker_similarity)
        if has_enrolled_profile and speaker_similarity is not None:
            speaker_mismatch_score = max(0.0, 1.0 - speaker_similarity)
            speaker_weight = self.weights["speaker_mismatch"]
        else:
            # Reallocate speaker mismatch weight proportionally to AI detection and spectral if un-enrolled
            speaker_mismatch_score = 0.0
            speaker_weight = 0.0

        ai_weight = self.weights["ai_detection"] + (0.10 if not has_enrolled_profile else 0.0)
        spectral_weight = self.weights["spectral_anomaly"] + (0.10 if not has_enrolled_profile else 0.0)
        prosody_weight = self.weights["prosody_anomaly"]
        cross_session_weight = self.weights["cross_session"]
        context_weight = self.weights["contextual_risk"]

        # Calculate weighted contributions (scale 0-100)
        c_ai = (max(ai_prob, clone_prob) * 100.0) * ai_weight
        c_speaker = (speaker_mismatch_score * 100.0) * speaker_weight
        c_prosody = (prosody_anomaly_score * 100.0) * prosody_weight
        c_spectral = (spectral_anomaly_score * 100.0) * spectral_weight
        c_cross = (cross_session_anomaly * 100.0) * cross_session_weight
        c_context = (context_risk * 100.0) * context_weight

        total_risk = c_ai + c_speaker + c_prosody + c_spectral + c_cross + c_context
        normalized_risk = round(min(100.0, max(0.0, total_risk)), 2)

        # Determine Threat Level
        if normalized_risk >= 80.0:
            threat_level = "CRITICAL"
            action = "HALT_ACTION_REQUIRE_INDEPENDENT_CALLBACK"
        elif normalized_risk >= 60.0:
            threat_level = "HIGH"
            action = "TRIGGER_CHALLENGE_RESPONSE_VERIFICATION"
        elif normalized_risk >= 30.0:
            threat_level = "MEDIUM"
            action = "MONITOR_SESSION_SECONDARY_CONFIRMATION"
        else:
            threat_level = "LOW"
            action = "ALLOW_SESSION_CONTINUE"

        # Construct Factor Explanations
        signals: List[Dict[str, Any]] = [
            {
                "signal_type": "AI_SYNTHETIC_PROBABILITY",
                "anomaly_detected": ai_prob > 0.50,
                "raw_metric_value": round(ai_prob, 4),
                "weight_percentage": round(ai_weight * 100, 1),
                "contribution_score": round(c_ai, 2),
                "explanation": f"Neural deepfake detection probability is {ai_prob*100:.1f}% based on spectral phase analysis."
            },
            {
                "signal_type": "SPECTRAL_ANOMALY",
                "anomaly_detected": spectral_anomaly_score > 0.45,
                "raw_metric_value": round(spectral_anomaly_score, 4),
                "weight_percentage": round(spectral_weight * 100, 1),
                "contribution_score": round(c_spectral, 2),
                "explanation": "High-frequency vocoder artifacts and harmonic distortion detected in STFT spectrogram."
                if spectral_anomaly_score > 0.45 else "Spectral distribution consistent with natural human acoustic tract."
            },
            {
                "signal_type": "PROSODIC_INCONSISTENCY",
                "anomaly_detected": prosody_anomaly_score > 0.50,
                "raw_metric_value": round(prosody_anomaly_score, 4),
                "weight_percentage": round(prosody_weight * 100, 1),
                "contribution_score": round(c_prosody, 2),
                "explanation": "Pitch variability and cadence indicate mechanical speech timing."
                if prosody_anomaly_score > 0.50 else "Natural pitch variation and human prosody rhythm observed."
            }
        ]

        if has_enrolled_profile:
            signals.append({
                "signal_type": "SPEAKER_CONSISTENCY",
                "anomaly_detected": speaker_similarity is not None and speaker_similarity < 0.70,
                "raw_metric_value": round(speaker_similarity or 0.0, 4),
                "weight_percentage": round(speaker_weight * 100, 1),
                "contribution_score": round(c_speaker, 2),
                "explanation": f"Voice embedding cosine similarity against verified profile is {(speaker_similarity or 0.0)*100:.1f}%."
            })

        if cross_session_anomaly > 0:
            signals.append({
                "signal_type": "CROSS_SESSION_INCONSISTENCY",
                "anomaly_detected": cross_session_anomaly > 0.4,
                "raw_metric_value": round(cross_session_anomaly, 4),
                "weight_percentage": round(cross_session_weight * 100, 1),
                "contribution_score": round(c_cross, 2),
                "explanation": "Significant shift in microphone hardware frequency response across active calls."
            })

        if context_risk > 0:
            signals.append({
                "signal_type": "CONTEXTUAL_RISK",
                "anomaly_detected": context_risk > 0.5,
                "raw_metric_value": round(context_risk, 4),
                "weight_percentage": round(context_weight * 100, 1),
                "contribution_score": round(c_context, 2),
                "explanation": "High urgency and conversational pressure markers detected in caller context."
            })

        # Generate summary narrative
        explanation_summary = (
            f"Risk score evaluated at {normalized_risk}/100 ({threat_level} threat). "
            f"Primary factor: {max(signals, key=lambda s: s['contribution_score'])['explanation']}"
        )

        return normalized_risk, threat_level, action, signals, explanation_summary
