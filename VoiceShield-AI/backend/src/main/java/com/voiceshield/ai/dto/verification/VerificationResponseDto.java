package com.voiceshield.ai.dto.verification;

import java.math.BigDecimal;
import java.util.UUID;

public class VerificationResponseDto {
    private UUID challengeSessionId;
    private String challengePhrase;
    private String language;
    private String status; // PENDING, PASS, FAIL, UNCERTAIN
    private BigDecimal similarityScore;
    private Boolean timingAnomalyDetected;
    private String verdict;
    private String explanation;
    private String disclaimer = "Secondary verification is an additional security signal and not absolute proof of identity.";

    public UUID getChallengeSessionId() { return challengeSessionId; }
    public void setChallengeSessionId(UUID challengeSessionId) { this.challengeSessionId = challengeSessionId; }
    public String getChallengePhrase() { return challengePhrase; }
    public void setChallengePhrase(String challengePhrase) { this.challengePhrase = challengePhrase; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(BigDecimal similarityScore) { this.similarityScore = similarityScore; }
    public Boolean getTimingAnomalyDetected() { return timingAnomalyDetected; }
    public void setTimingAnomalyDetected(Boolean timingAnomalyDetected) { this.timingAnomalyDetected = timingAnomalyDetected; }
    public String getVerdict() { return verdict; }
    public void setVerdict(String verdict) { this.verdict = verdict; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
