package com.voiceshield.ai.dto.verification;

import java.util.UUID;

public class ChallengeCompleteRequest {
    private UUID challengeSessionId;
    private String audioBase64;

    public UUID getChallengeSessionId() { return challengeSessionId; }
    public void setChallengeSessionId(UUID challengeSessionId) { this.challengeSessionId = challengeSessionId; }
    public String getAudioBase64() { return audioBase64; }
    public void setAudioBase64(String audioBase64) { this.audioBase64 = audioBase64; }
}
