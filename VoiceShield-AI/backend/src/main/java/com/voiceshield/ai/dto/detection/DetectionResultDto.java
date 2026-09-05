package com.voiceshield.ai.dto.detection;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class DetectionResultDto {
    private UUID id;
    private String classification;
    private BigDecimal modelConfidence;
    private BigDecimal securityRiskScore;
    private String threatLevel;
    private BigDecimal aiGeneratedProbability;
    private BigDecimal voiceCloneProbability;
    private BigDecimal speakerSimilarityScore;
    private String recommendedAction;
    private boolean isDevelopmentResult;
    private String developmentWarning;
    private String explanationSummary;
    private Integer inferenceDurationMs;
    private String modelVersion;
    private List<RiskSignalDto> signals;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getClassification() { return classification; }
    public void setClassification(String classification) { this.classification = classification; }
    public BigDecimal getModelConfidence() { return modelConfidence; }
    public void setModelConfidence(BigDecimal modelConfidence) { this.modelConfidence = modelConfidence; }
    public BigDecimal getSecurityRiskScore() { return securityRiskScore; }
    public void setSecurityRiskScore(BigDecimal securityRiskScore) { this.securityRiskScore = securityRiskScore; }
    public String getThreatLevel() { return threatLevel; }
    public void setThreatLevel(String threatLevel) { this.threatLevel = threatLevel; }
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
    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
    public List<RiskSignalDto> getSignals() { return signals; }
    public void setSignals(List<RiskSignalDto> signals) { this.signals = signals; }
}
