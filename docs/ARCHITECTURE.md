# VoiceShield AI - System Architecture & Engineering Specifications

## 1. Executive System Overview
VoiceShield AI is a real-time biometric defense system engineered to detect and prevent unauthorized voice-cloning impersonation attacks across critical voice communication channels (financial transactions, executive authorization, emergency dispatch, and enterprise SOC triage).

## 2. Integrated Microservices Architecture
The platform operates on a distributed, zero-trust microservice topology:
- **Client Tier (Web Audio & React UI)**: High-resolution 16kHz/44.1kHz audio ingestion via Web Audio API, transient DSP acoustic feature extraction, and real-time WebSocket telemetry.
- **API Gateway & Core Service (Spring Boot 3 / Java 21)**: Handles stateless JWT authentication, session lifecycle, rate limiting, and incident event dispatching to Redis/PostgreSQL.
- **Acoustic Detection Service (FastAPI / Python 3.11)**: Physical acoustic DSP feature extraction alongside neural vocoder artifact detection models wrapped behind clean adapter abstractions.
- **Cache & Event Bus (Redis 7)**: Distributed session tracking, stream buffering, and pub/sub for live SOC alerts.
- **Relational Datastore (PostgreSQL 16)**: Forensic telemetry, audit logs, and challenge-response records.

```
       +-------------------------------------------------------------+
       |                  User / Audio Ingestion                     |
       |  (Web Audio API / 16kHz PCM / Microphone / File Upload)      |
       +------------------------------+------------------------------+
                                      | WebSocket (100ms chunks)
                                      v
       +-------------------------------------------------------------+
       |               Spring Boot 3 API Gateway                     |
       |  - WebSocket AudioStreamHandler                             |
       |  - JWT Authentication & RBAC Filter                         |
       |  - Session Context & Audit Logging                          |
       +--------------+------------------------------+---------------+
                      |                              |
                      v gRPC / REST                  v Pub/Sub
       +------------------------------+ +----------------------------+
       |    FastAPI Inference Service | |       Redis Event Bus      |
       |  - Development DSP Adapter   | |  - Active Session State    |
       |  - Production PyTorch/ONNX   | |  - SOC Alert Fan-out       |
       +--------------+---------------+ +--------------+-------------+
                      |                              |
                      +--------------+---------------+
                                     |
                                     v Persistence
       +-------------------------------------------------------------+
       |                     PostgreSQL Database                     |
       |  - detection_events  |  - security_alerts  |  - audit_logs  |
       +-------------------------------------------------------------+
```

## 3. Explainable DSP Acoustic Signals
VoiceShield AI computes an explainable, deterministic score derived from 5 core physical acoustic signals:
1. **Spectral Flatness (Wiener Entropy)**: Detects neural vocoder high-frequency white-noise floors and harmonic buzz.
2. **Phase Boundary Continuity**: Detects phase cancellation and diffusion stitching discontinuities between generative frames.
3. **Pitch Dynamics & F0 Micro-Jitter**: Measures human vocal cord perturbation (~1.2–2.8%) versus unnaturally stable parametric synthesis.
4. **Spectral Flux & Spectral Centroid**: Measures energy shift rate across time windows.
5. **Zero Crossing Rate (ZCR) Stability**: Validates consonant-vowel transitions against rigid algorithmic synthesis.

## 4. Model Adapter Pattern
To fulfill the requirement for strict decoupling between development heuristics and production neural networks, detection models implement the `VoiceDetectionModel` contract:
- `DevelopmentModelAdapter`: Executes real-time physical acoustic DSP calculations in real time without external GPUs.
- `ProductionModelAdapter`: Routes feature tensors to RawNet2, WavLM, and AASIST deep neural network inference pipelines.

## 5. Security & Privacy Guarantees
- **Zero Audio Storage Default**: Raw voice waveforms are held only in volatile memory during FFT processing and discarded immediately unless an explicit opt-in forensic audit flag is set.
- **Zero-Trust Challenge-Response MFA**: Multilingual phonetic challenges (English, Hindi, Telugu) detect generative speech latency and replay attacks.
- **Role-Based Access Control (RBAC)**: Strictly enforced endpoints for `ROLE_ADMIN`, `ROLE_ANALYST`, and `ROLE_USER`.
