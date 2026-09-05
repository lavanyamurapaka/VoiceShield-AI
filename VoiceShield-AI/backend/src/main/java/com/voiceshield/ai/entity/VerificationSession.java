package com.voiceshield.ai.entity;

import com.voiceshield.ai.entity.enums.VerificationStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "verification_sessions")
public class VerificationSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "detection_session_id")
    private DetectionSession detectionSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "challenge_phrase", nullable = false, columnDefinition = "TEXT")
    private String challengePhrase;

    @Column(name = "language_code", nullable = false, length = 10)
    private String languageCode = "EN";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private VerificationStatus status = VerificationStatus.PENDING;

    @Column(name = "phrase_accuracy_score", precision = 5, scale = 4)
    private BigDecimal phraseAccuracyScore;

    @Column(name = "timing_anomaly_detected")
    private Boolean timingAnomalyDetected = false;

    @Column(name = "acoustic_match_score", precision = 5, scale = 4)
    private BigDecimal acousticMatchScore;

    @Column(name = "final_verdict", length = 30)
    private String finalVerdict;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    public VerificationSession() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public DetectionSession getDetectionSession() { return detectionSession; }
    public void setDetectionSession(DetectionSession detectionSession) { this.detectionSession = detectionSession; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getChallengePhrase() { return challengePhrase; }
    public void setChallengePhrase(String challengePhrase) { this.challengePhrase = challengePhrase; }
    public String getLanguageCode() { return languageCode; }
    public void setLanguageCode(String languageCode) { this.languageCode = languageCode; }
    public VerificationStatus getStatus() { return status; }
    public void setStatus(VerificationStatus status) { this.status = status; }
    public BigDecimal getPhraseAccuracyScore() { return phraseAccuracyScore; }
    public void setPhraseAccuracyScore(BigDecimal phraseAccuracyScore) { this.phraseAccuracyScore = phraseAccuracyScore; }
    public Boolean getTimingAnomalyDetected() { return timingAnomalyDetected; }
    public void setTimingAnomalyDetected(Boolean timingAnomalyDetected) { this.timingAnomalyDetected = timingAnomalyDetected; }
    public BigDecimal getAcousticMatchScore() { return acousticMatchScore; }
    public void setAcousticMatchScore(BigDecimal acousticMatchScore) { this.acousticMatchScore = acousticMatchScore; }
    public String getFinalVerdict() { return finalVerdict; }
    public void setFinalVerdict(String finalVerdict) { this.finalVerdict = finalVerdict; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
}
