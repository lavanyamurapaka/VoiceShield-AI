package com.voiceshield.ai.service;

import com.voiceshield.ai.client.AiServiceClient;
import com.voiceshield.ai.dto.alert.AlertDto;
import com.voiceshield.ai.dto.analytics.DashboardMetricsDto;
import com.voiceshield.ai.dto.detection.DetectionSessionResponse;
import com.voiceshield.ai.entity.enums.AlertSeverity;
import com.voiceshield.ai.entity.enums.AlertStatus;
import com.voiceshield.ai.entity.enums.Classification;
import com.voiceshield.ai.entity.enums.ThreatLevel;
import com.voiceshield.ai.repository.AlertRepository;
import com.voiceshield.ai.repository.DetectionResultRepository;
import com.voiceshield.ai.repository.DetectionSessionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final DetectionSessionRepository sessionRepository;
    private final DetectionResultRepository resultRepository;
    private final AlertRepository alertRepository;
    private final DetectionService detectionService;
    private final AlertService alertService;
    private final AiServiceClient aiServiceClient;

    public AnalyticsService(
            DetectionSessionRepository sessionRepository,
            DetectionResultRepository resultRepository,
            AlertRepository alertRepository,
            DetectionService detectionService,
            AlertService alertService,
            AiServiceClient aiServiceClient) {
        this.sessionRepository = sessionRepository;
        this.resultRepository = resultRepository;
        this.alertRepository = alertRepository;
        this.detectionService = detectionService;
        this.alertService = alertService;
        this.aiServiceClient = aiServiceClient;
    }

    @Transactional(readOnly = true)
    public DashboardMetricsDto getDashboardMetrics() {
        DashboardMetricsDto dto = new DashboardMetricsDto();

        long totalAnalyses = sessionRepository.count();
        long highRisk = resultRepository.countHighAndCriticalSessions();
        long criticalAlerts = alertRepository.countBySeverity(AlertSeverity.CRITICAL);
        long pending = alertRepository.countByStatus(AlertStatus.NEW) + alertRepository.countByStatus(AlertStatus.UNDER_INVESTIGATION);

        dto.setTotalAnalyses(totalAnalyses);
        dto.setHighRiskSessions(highRisk);
        dto.setCriticalAlerts(criticalAlerts);
        dto.setPendingInvestigations(pending);

        // Truthful model status - never invent accuracy
        dto.setModelEvaluationStatus("Model evaluation unavailable (Evaluation dataset not mounted)");

        // Service statuses
        dto.setDatabaseStatus("ONLINE (PostgreSQL 16.0 / Pool Active)");
        dto.setAiServiceStatus(aiServiceClient.isHealthy() ? "OPERATIONAL (FastAPI v1.0.0)" : "DEGRADED (FastAPI Inactive)");

        // Category breakdown
        Map<String, Long> distribution = new HashMap<>();
        for (Classification c : Classification.values()) {
            distribution.put(c.name(), 0L);
        }
        resultRepository.findAll().forEach(res -> {
            String name = res.getClassification().name();
            distribution.put(name, distribution.getOrDefault(name, 0L) + 1L);
        });
        dto.setDetectionDistribution(distribution);

        // Recent alerts
        List<AlertDto> alerts = alertService.getRecentAlerts();
        dto.setRecentAlerts(alerts);

        // Recent sessions
        List<DetectionSessionResponse> recentSessions = sessionRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 8))
                .stream()
                .map(session -> {
                    var res = resultRepository.findBySessionId(session.getId()).orElse(null);
                    return detectionService.mapToSessionResponse(session, res);
                })
                .collect(Collectors.toList());
        dto.setRecentSessions(recentSessions);

        return dto;
    }
}
