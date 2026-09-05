-- ==============================================================================
-- VoiceShield AI - Flyway Migration V2
-- Seed Initial Roles, System Configurations and Model Registry
-- ==============================================================================

-- 1. Insert Standard Security Roles
INSERT INTO roles (id, name, description) VALUES
    ('11111111-1111-1111-1111-111111111101', 'ROLE_USER', 'Standard User with access to voice verification and personal analysis history'),
    ('11111111-1111-1111-1111-111111111102', 'ROLE_ANALYST', 'Security Analyst with access to incident investigation, threat triaging and risk signals'),
    ('11111111-1111-1111-1111-111111111103', 'ROLE_ADMIN', 'System Administrator with full platform controls, configuration and audit logs')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Default Configurable Risk Engine Weights
INSERT INTO system_configurations (config_key, config_value, category, description) VALUES
    ('RISK_WEIGHT_AI_DETECTION', '0.30', 'RISK_WEIGHT', 'Weight contribution of AI model deepfake probability (30%)'),
    ('RISK_WEIGHT_SPEAKER_MISMATCH', '0.20', 'RISK_WEIGHT', 'Weight contribution of voice embedding distance from enrolled profile (20%)'),
    ('RISK_WEIGHT_PROSODY_ANOMALY', '0.15', 'RISK_WEIGHT', 'Weight contribution of unnatural pitch jitter and prosodic cadence (15%)'),
    ('RISK_WEIGHT_SPECTRAL_ANOMALY', '0.15', 'RISK_WEIGHT', 'Weight contribution of high-frequency spectral artifacts and phase distortion (15%)'),
    ('RISK_WEIGHT_CROSS_SESSION', '0.10', 'RISK_WEIGHT', 'Weight contribution of cross-session anomaly or rapid geographic/IP switching (10%)'),
    ('RISK_WEIGHT_CONTEXTUAL', '0.10', 'RISK_WEIGHT', 'Weight contribution of transaction risk, call urgency and metadata cues (10%)'),
    ('THRESHOLD_LOW_MAX', '29', 'THRESHOLD', 'Maximum risk score threshold for LOW threat level'),
    ('THRESHOLD_MEDIUM_MAX', '59', 'THRESHOLD', 'Maximum risk score threshold for MEDIUM threat level'),
    ('THRESHOLD_HIGH_MAX', '79', 'THRESHOLD', 'Maximum risk score threshold for HIGH threat level'),
    ('THRESHOLD_CRITICAL_MIN', '80', 'THRESHOLD', 'Minimum risk score threshold for CRITICAL threat level'),
    ('PRIVACY_AUDIO_RETENTION_SECONDS', '0', 'PRIVACY', 'Raw audio retention policy in seconds (0 = immediate deletion after feature extraction)'),
    ('PRIVACY_STORE_SPECTROGRAMS', 'false', 'PRIVACY', 'Whether to retain derived visual spectrogram representations'),
    ('ACTIVE_MODEL_ADAPTER', 'DEVELOPMENT', 'MODEL', 'Active model adapter: PRODUCTION or DEVELOPMENT')
ON CONFLICT (config_key) DO NOTHING;

-- 3. Register Active and Fallback Model Versions
INSERT INTO model_versions (id, model_name, version_tag, adapter_type, validation_status, architecture, description, is_active) VALUES
    ('22222222-2222-2222-2222-222222222201', 'VoiceShield-AASIST-Adapter', 'v1.0.0-dev', 'DEVELOPMENT', 'UNVALIDATED_FALLBACK', 'Spectral-Prosodic Feature Extractor + Isolation Forest', 'DEVELOPMENT MODEL — NOT VALIDATED FOR PRODUCTION. Uses acoustic and prosodic feature extraction algorithms for localized evaluation.', TRUE),
    ('22222222-2222-2222-2222-222222222202', 'Wav2Vec2-Synthetic-Detector', 'v2.1.0-prod', 'PRODUCTION', 'VALIDATED', 'Wav2Vec2-XLSR Fine-Tuned on ASVspoof 2021 Deepfake Corpus', 'Production-grade transformer model for synthetic speech and neural voice clone detection.', FALSE)
ON CONFLICT (version_tag) DO NOTHING;
