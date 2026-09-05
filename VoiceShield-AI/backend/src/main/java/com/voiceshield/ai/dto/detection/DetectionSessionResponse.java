package com.voiceshield.ai.dto.detection;

import java.time.Instant;
import java.util.UUID;

public class DetectionSessionResponse {
    private UUID sessionId;
    private String sessionToken;
    private String status;
    private String channelType;
    private String audioFormat;
    private Integer durationMs;
    private String languageCode;
    private Instant createdAt;
    private DetectionResultDto result;

    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }
    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getChannelType() { return channelType; }
    public void setChannelType(String channelType) { this.channelType = channelType; }
    public String getAudioFormat() { return audioFormat; }
    public void setAudioFormat(String audioFormat) { this.audioFormat = audioFormat; }
    public Integer getDurationMs() { return durationMs; }
    public void setDurationMs(Integer durationMs) { this.durationMs = durationMs; }
    public String getLanguageCode() { return languageCode; }
    public void setLanguageCode(String languageCode) { this.languageCode = languageCode; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public DetectionResultDto getResult() { return result; }
    public void setResult(DetectionResultDto result) { this.result = result; }
}
