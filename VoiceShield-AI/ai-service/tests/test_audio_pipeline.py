"""
Voice Shield AI - AI Microservice Unit & Integration Tests
SIH26104 - Voice Impersonation Prevention
"""
import pytest
import numpy as np
import base64
import io
from scipy.io import wavfile

from app.core.audio_pipeline import AudioPipeline
from app.models.development_adapter import DevelopmentModelAdapter
from app.models.risk_engine import RiskEngine


def generate_synthetic_tone(freq=440, duration_sec=1.0, sr=16000):
    """Generates a clean sine wave audio array and WAV bytes for testing."""
    t = np.linspace(0, duration_sec, int(sr * duration_sec), endpoint=False)
    audio = 0.5 * np.sin(2 * np.pi * freq * t)
    audio_int16 = (audio * 32767).astype(np.int16)
    
    buf = io.BytesIO()
    wavfile.write(buf, sr, audio_int16)
    return audio, buf.getvalue()


def test_audio_normalization():
    _, wav_bytes = generate_synthetic_tone(freq=440, duration_sec=0.5)
    audio_norm, sr, duration_ms = AudioPipeline.decode_and_normalize(wav_bytes, target_sr=16000)
    
    assert sr == 16000
    assert 450 <= duration_ms <= 550
    assert np.max(np.abs(audio_norm)) <= 1.0


def test_acoustic_feature_extraction():
    audio, _ = generate_synthetic_tone(freq=1000, duration_sec=0.8)
    features = AudioPipeline.extract_acoustic_features(audio, sr=16000)
    
    assert "spectral_centroid" in features
    assert "zero_crossing_rate" in features
    assert "vocoder_artifact_score" in features
    assert "pitch_variance" in features
    assert features["spectral_centroid"] > 0


def test_speaker_embedding_and_similarity():
    audio1, _ = generate_synthetic_tone(freq=300, duration_sec=0.5)
    audio2, _ = generate_synthetic_tone(freq=300, duration_sec=0.5)
    audio_diff, _ = generate_synthetic_tone(freq=1200, duration_sec=0.5)
    
    emb1 = AudioPipeline.generate_speaker_embedding(audio1)
    emb2 = AudioPipeline.generate_speaker_embedding(audio2)
    emb3 = AudioPipeline.generate_speaker_embedding(audio_diff)
    
    assert len(emb1) == 192
    assert len(emb2) == 192
    
    sim_same = AudioPipeline.calculate_embedding_similarity(emb1, emb2)
    sim_diff = AudioPipeline.calculate_embedding_similarity(emb1, emb3)
    
    assert sim_same > 0.95
    assert sim_diff < sim_same


def test_development_adapter_analysis():
    adapter = DevelopmentModelAdapter()
    audio, _ = generate_synthetic_tone(freq=500, duration_sec=1.0)
    
    result = adapter.analyze(audio, sr=16000)
    
    assert "classification" in result
    assert "security_risk_score" in result
    assert "threat_level" in result
    assert result["is_development_result"] is True
    assert "DEVELOPMENT MODEL" in result["development_warning"]
    assert len(result["signals"]) >= 3


def test_risk_engine_computation():
    engine = RiskEngine()
    risk_score, threat, action, signals, explanation = engine.compute_risk(
        ai_prob=0.85,
        clone_prob=0.80,
        speaker_similarity=0.30,
        prosody_anomaly_score=0.70,
        spectral_anomaly_score=0.65,
        has_enrolled_profile=True
    )
    
    assert risk_score > 60.0
    assert threat in ["HIGH", "CRITICAL"]
    assert len(signals) >= 4
