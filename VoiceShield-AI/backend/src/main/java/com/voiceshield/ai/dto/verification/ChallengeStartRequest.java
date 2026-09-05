package com.voiceshield.ai.dto.verification;

import java.util.UUID;

public class ChallengeStartRequest {
    private UUID sessionId;
    private String language = "EN"; // EN, HI, TE

    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
