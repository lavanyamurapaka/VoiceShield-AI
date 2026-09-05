# VoiceShield AI - API Reference Specification

## 1. Authentication Endpoints

### `POST /api/v1/auth/login`
Authenticates an enterprise analyst, administrator, or service client.
- **Request Body**:
  ```json
  {
    "username": "soc_analyst@voiceshield.internal",
    "password": "<secure_password>"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "role": "ROLE_ANALYST"
  }
  ```

---

## 2. Audio Ingestion & Live Detection

### `POST /api/v1/detection/analyze`
Performs synchronous forensic acoustic analysis on a transient audio sample.
- **Headers**:
  - `Authorization: Bearer <jwt_token>`
  - `Content-Type: multipart/form-data`
- **Form Parameters**:
  - `audio`: binary audio payload (WAV/MP3/WebM/OGG, mono, 16kHz recommended)
  - `channel`: `TELEPHONY` | `MEETING_STREAM` | `INTERCOM`
  - `language`: `EN` | `HI` | `TE`
- **Response `200 OK`**:
  ```json
  {
    "sessionId": "ses-992a7bf8-a5b1",
    "classification": "VOICE_CLONED",
    "securityRiskScore": 86.4,
    "threatLevel": "CRITICAL",
    "modelConfidence": 0.942,
    "aiGeneratedProbability": 0.961,
    "voiceCloneProbability": 0.884,
    "recommendedAction": "TERMINATE_SESSION_AND_ALERT_SOC",
    "inferenceDurationMs": 28,
    "explanationSummary": "Acoustic signal reveals elevated spectral flatness (Wiener entropy > 0.42) characteristic of neural vocoders, with diffusion phase boundary jumps and absence of physiological micro-jitter.",
    "signals": [
      {
        "signalType": "SPECTRAL_FLATNESS",
        "weightPercentage": 30,
        "contributionScore": 28.5,
        "anomalyDetected": true,
        "explanation": "High Wiener entropy indicates artificial vocoder hiss.",
        "rawMetricValue": "0.461"
      }
    ]
  }
  ```

### `WebSocket /ws/v1/audio/stream`
Full-duplex WebSocket connection for real-time audio chunk streaming and continuous threat score computation.
- **Client Frame**: Binary PCM 16-bit 16kHz audio chunk (100ms slice, 3200 bytes).
- **Server Frame**: JSON `DetectionResult` telemetry update.

---

## 3. Challenge-Response Verification

### `POST /api/v1/verification/challenge`
Generates a dynamic phonetic pass-phrase for zero-trust acoustic verification.
- **Request Body**:
  ```json
  {
    "language": "EN",
    "sessionId": "ses-992a7bf8-a5b1"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "challengeId": "chal-772fa8e",
    "phrase": "The silent river carries ancient wisdom beneath the winter sky.",
    "expiresInSeconds": 60
  }
  ```

---

## 4. SOC Alerts & Incident Response

### `GET /api/v1/soc/alerts`
Lists forensic security incidents with filter and pagination support.
- **Query Parameters**:
  - `severity`: `ALL` | `CRITICAL` | `HIGH` | `MEDIUM` | `LOW`
  - `status`: `ACTIVE` | `UNDER_INVESTIGATION` | `RESOLVED` | `FALSE_POSITIVE`
- **Response `200 OK`**: Array of `SecurityAlert` objects.

### `PATCH /api/v1/soc/alerts/{id}`
Updates incident triage status, analyst investigation notes, and remediation action.
