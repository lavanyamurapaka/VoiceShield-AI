package com.voiceshield.ai.dto.analytics;

import com.voiceshield.ai.dto.alert.AlertDto;
import com.voiceshield.ai.dto.detection.DetectionSessionResponse;
import java.util.List;
import java.util.Map;

public class DashboardMetricsDto {
    private long totalAnalyses;
    private long highRiskSessions;
    private long criticalAlerts;
    private long pendingInvestigations;
    private String modelEvaluationStatus = "Model evaluation unavailable (Benchmark dataset not mounted in offline environment)";
    private String aiServiceStatus;
    private String databaseStatus;
    private Map<String, Long> detectionDistribution;
    private List<AlertDto> recentAlerts;
    private List<DetectionSessionResponse> recentSessions;

    public long getTotalAnalyses() { return totalAnalyses; }
    public void setTotalAnalyses(long totalAnalyses) { this.totalAnalyses = totalAnalyses; }
    public long getHighRiskSessions() { return highRiskSessions; }
    public void setHighRiskSessions(long highRiskSessions) { this.highRiskSessions = highRiskSessions; }
    public long getCriticalAlerts() { return criticalAlerts; }
    public void setCriticalAlerts(long criticalAlerts) { this.criticalAlerts = criticalAlerts; }
    public long getPendingInvestigations() { return pendingInvestigations; }
    public void setPendingInvestigations(long pendingInvestigations) { this.pendingInvestigations = pendingInvestigations; }
    public String getModelEvaluationStatus() { return modelEvaluationStatus; }
    public void setModelEvaluationStatus(String modelEvaluationStatus) { this.modelEvaluationStatus = modelEvaluationStatus; }
    public String getAiServiceStatus() { return aiServiceStatus; }
    public void setAiServiceStatus(String aiServiceStatus) { this.aiServiceStatus = aiServiceStatus; }
    public String getDatabaseStatus() { return databaseStatus; }
    public void setDatabaseStatus(String databaseStatus) { this.databaseStatus = databaseStatus; }
    public Map<String, Long> getDetectionDistribution() { return detectionDistribution; }
    public void setDetectionDistribution(Map<String, Long> detectionDistribution) { this.detectionDistribution = detectionDistribution; }
    public List<AlertDto> getRecentAlerts() { return recentAlerts; }
    public void setRecentAlerts(List<AlertDto> recentAlerts) { this.recentAlerts = recentAlerts; }
    public List<DetectionSessionResponse> getRecentSessions() { return recentSessions; }
    public void setRecentSessions(List<DetectionSessionResponse> recentSessions) { this.recentSessions = recentSessions; }
}
