-- ==============================================================================
-- VoiceShield AI - Flyway Migration V1
-- PostgreSQL Initial Relational Schema with UUIDs, Constraints & Indexes
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    department VARCHAR(100) DEFAULT 'SecOps',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_locked BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. User-Role Association
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- 4. Voice Profiles Table (Stores speaker embeddings securely)
CREATE TABLE IF NOT EXISTS voice_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_name VARCHAR(100) NOT NULL,
    embedding_vector JSONB NOT NULL,
    sample_rate INT NOT NULL DEFAULT 16000,
    embedding_dimension INT NOT NULL DEFAULT 192,
    algorithm_version VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, REVOKED, RE_ENROLL_REQUIRED
    enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Model Versions Table
CREATE TABLE IF NOT EXISTS model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL,
    version_tag VARCHAR(50) NOT NULL UNIQUE,
    adapter_type VARCHAR(50) NOT NULL, -- 'PRODUCTION', 'DEVELOPMENT'
    validation_status VARCHAR(50) NOT NULL, -- 'VALIDATED', 'UNVALIDATED_FALLBACK'
    architecture VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Detection Sessions Table
CREATE TABLE IF NOT EXISTS detection_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_token VARCHAR(128) NOT NULL UNIQUE,
    channel_type VARCHAR(50) NOT NULL, -- 'MICROPHONE_STREAM', 'AUDIO_UPLOAD', 'REST_API'
    audio_format VARCHAR(20) NOT NULL, -- 'WAV', 'MP3', 'WEBM'
    sample_rate INT,
    duration_ms INT,
    language_code VARCHAR(10) DEFAULT 'EN', -- 'EN', 'HI', 'TE', 'UNKNOWN'
    status VARCHAR(30) NOT NULL DEFAULT 'PROCESSING', -- 'PROCESSING', 'COMPLETED', 'FAILED'
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 7. Detection Results Table
CREATE TABLE IF NOT EXISTS detection_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES detection_sessions(id) ON DELETE CASCADE,
    model_version_id UUID REFERENCES model_versions(id) ON DELETE SET NULL,
    classification VARCHAR(40) NOT NULL, -- 'HUMAN', 'SYNTHETIC', 'VOICE_CLONED', 'SUSPICIOUS', 'UNCERTAIN'
    model_confidence NUMERIC(5, 4) NOT NULL, -- 0.0000 - 1.0000
    security_risk_score NUMERIC(5, 2) NOT NULL, -- 0.00 - 100.00
    threat_level VARCHAR(20) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    ai_generated_probability NUMERIC(5, 4) NOT NULL,
    voice_clone_probability NUMERIC(5, 4) NOT NULL,
    speaker_similarity_score NUMERIC(5, 4),
    recommended_action VARCHAR(100) NOT NULL,
    is_development_result BOOLEAN NOT NULL DEFAULT FALSE,
    development_warning VARCHAR(255),
    explanation_summary TEXT,
    inference_duration_ms INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Risk Signals Breakdown (Explainable AI / Factor contribution)
CREATE TABLE IF NOT EXISTS risk_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    detection_result_id UUID NOT NULL REFERENCES detection_results(id) ON DELETE CASCADE,
    signal_type VARCHAR(60) NOT NULL, -- 'SPECTRAL_ANOMALY', 'PROSODY_INCONSISTENCY', 'PHONETIC_DISCONTINUITY', etc.
    anomaly_detected BOOLEAN NOT NULL DEFAULT FALSE,
    raw_metric_value NUMERIC(8, 4),
    weight_percentage NUMERIC(5, 2) NOT NULL,
    contribution_score NUMERIC(5, 2) NOT NULL,
    explanation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    detection_session_id UUID NOT NULL REFERENCES detection_sessions(id) ON DELETE CASCADE,
    severity VARCHAR(20) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    status VARCHAR(30) NOT NULL DEFAULT 'NEW', -- 'NEW', 'UNDER_INVESTIGATION', 'RESOLVED', 'FALSE_POSITIVE'
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    investigation_notes TEXT,
    action_taken VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 10. Secondary Verification Sessions (Challenge-Response)
CREATE TABLE IF NOT EXISTS verification_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    detection_session_id UUID REFERENCES detection_sessions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    challenge_phrase TEXT NOT NULL,
    language_code VARCHAR(10) NOT NULL DEFAULT 'EN',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PASS', 'FAIL', 'UNCERTAIN'
    phrase_accuracy_score NUMERIC(5, 4),
    timing_anomaly_detected BOOLEAN DEFAULT FALSE,
    acoustic_match_score NUMERIC(5, 4),
    final_verdict VARCHAR(30),
    explanation TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 11. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(60) NOT NULL,
    resource_id VARCHAR(64),
    ip_address VARCHAR(45),
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. System Configuration (Configurable weights & thresholds)
CREATE TABLE IF NOT EXISTS system_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'RISK_WEIGHT', 'THRESHOLD', 'PRIVACY', 'MODEL'
    description TEXT,
    updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid querying and foreign key performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON detection_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON detection_sessions(status);
CREATE INDEX IF NOT EXISTS idx_detection_results_session ON detection_results(session_id);
CREATE INDEX IF NOT EXISTS idx_detection_results_threat ON detection_results(threat_level);
CREATE INDEX IF NOT EXISTS idx_risk_signals_result ON risk_signals(detection_result_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
