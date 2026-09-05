package com.voiceshield.ai.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "risk_signals")
public class RiskSignal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "detection_result_id", nullable = false)
    private DetectionResult detectionResult;

    @Column(name = "signal_type", nullable = false, length = 60)
    private String signalType;

    @Column(name = "anomaly_detected", nullable = false)
    private boolean anomalyDetected = false;

    @Column(name = "raw_metric_value", precision = 8, scale = 4)
    private BigDecimal rawMetricValue;

    @Column(name = "weight_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal weightPercentage;

    @Column(name = "contribution_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal contributionScore;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public RiskSignal() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public DetectionResult getDetectionResult() { return detectionResult; }
    public void setDetectionResult(DetectionResult detectionResult) { this.detectionResult = detectionResult; }
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
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
