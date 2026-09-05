package com.voiceshield.ai.dto.detection;

import java.math.BigDecimal;

public class RiskSignalDto {
    private String signalType;
    private boolean anomalyDetected;
    private BigDecimal rawMetricValue;
    private BigDecimal weightPercentage;
    private BigDecimal contributionScore;
    private String explanation;

    public String getSignalType() { return signalType; }
    public void setSignalType(String signalType) { this.signalType = signalType; }
    public boolean isAnomalyDetected() { return anomalyDetected; }
    public void setAnomalyDetected(boolean anomalyDetected) { this.anomalyDetected = anomalyDetected; }
    public BigDecimal getRawMetricValue() { return rawMetricValue; }
    public void setRawMetricValue(BigDecimal rawMetricValue) { this.rawMetricValue = rawMetricValue; }
    public BigDecimal getWeightPercentage() { return weightPercentage; }
    public void setWeightPercentage(BigDecimal weightPercentage) { this.weightPercentage = weightPercentage; }
    public BigDecimal getContributionScore() { return contributionScore; }
    public void setContributionScore(BigDecimal contributionScore) { this.contributionScore = contributionScore; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
