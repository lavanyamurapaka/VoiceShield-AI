package com.voiceshield.ai.entity;

import com.voiceshield.ai.entity.enums.Classification;
import com.voiceshield.ai.entity.enums.ThreatLevel;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "detection_results")
public class DetectionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private DetectionSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_version_id")
    private ModelVersion modelVersion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Classification classification;

    @Column(name = "model_confidence", nullable = false, precision = 5, scale = 4)
    private BigDecimal modelConfidence;

    @Column(name = "security_risk_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal securityRiskScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "threat_level", nullable = false, length = 20)
    private ThreatLevel threatLevel;

    @Column(name = "ai_generated_probability", nullable = false, precision = 5, scale = 4)
    private BigDecimal aiGeneratedProbability;

    @Column(name = "voice_clone_probability", nullable = false, precision = 5, scale = 4)
    private BigDecimal voiceCloneProbability;

    @Column(name = "speaker_similarity_score", precision = 5, scale = 4)
    private BigDecimal speakerSimilarityScore;

    @Column(name = "recommended_action", nullable = false, length = 100)
    private String recommendedAction;

    @Column(name = "is_development_result", nullable = false)
    private boolean isDevelopmentResult = false;

    @Column(name = "development_warning")
    private String developmentWarning;

    @Column(name = "explanation_summary", columnDefinition = "TEXT")
    private String explanationSummary;

    @Column(name = "inference_duration_ms", nullable = false)
    private Integer inferenceDurationMs;

    @OneToMany(mappedBy = "detectionResult", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RiskSignal> signals = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public DetectionResult() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public DetectionSession getSession() { return session; }
    public void setSession(DetectionSession session) { this.session = session; }
    public ModelVersion getModelVersion() { return modelVersion; }
    public void setModelVersion(ModelVersion modelVersion) { this.modelVersion = modelVersion; }
    public Classification getClassification() { return classification; }
    public void setClassification(Classification classification) { this.classification = classification; }
    public BigDecimal getModelConfidence() { return modelConfidence; }
    public void setModelConfidence(BigDecimal modelConfidence) { this.modelConfidence = modelConfidence; }
    public BigDecimal getSecurityRiskScore() { return securityRiskScore; }
    public void setSecurityRiskScore(BigDecimal securityRiskScore) { this.securityRiskScore = securityRiskScore; }
    public ThreatLevel getThreatLevel() { return threatLevel; }
    public void setThreatLevel(ThreatLevel threatLevel) { this.threatLevel = threatLevel; }
    public BigDecimal getAiGeneratedProbability() { return aiGeneratedProbability; }
    public void setAiGeneratedProbability(BigDecimal aiGeneratedProbability) { this.aiGeneratedProbability = aiGeneratedProbability; }
    public BigDecimal getVoiceCloneProbability() { return voiceCloneProbability; }
    public void setVoiceCloneProbability(BigDecimal voiceCloneProbability) { this.voiceCloneProbability = voiceCloneProbability; }
    public BigDecimal getSpeakerSimilarityScore() { return speakerSimilarityScore; }
    public void setSpeakerSimilarityScore(BigDecimal speakerSimilarityScore) { this.speakerSimilarityScore = speakerSimilarityScore; }
    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }
    public boolean isDevelopmentResult() { return isDevelopmentResult; }
    public void setDevelopmentResult(boolean developmentResult) { isDevelopmentResult = developmentResult; }
    public String getDevelopmentWarning() { return developmentWarning; }
    public void setDevelopmentWarning(String developmentWarning) { this.developmentWarning = developmentWarning; }
    public String getExplanationSummary() { return explanationSummary; }
    public void setExplanationSummary(String explanationSummary) { this.explanationSummary = explanationSummary; }
    public Integer getInferenceDurationMs() { return inferenceDurationMs; }
    public void setInferenceDurationMs(Integer inferenceDurationMs) { this.inferenceDurationMs = inferenceDurationMs; }
    public List<RiskSignal> getSignals() { return signals; }
    public void setSignals(List<RiskSignal> signals) { this.signals = signals; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
