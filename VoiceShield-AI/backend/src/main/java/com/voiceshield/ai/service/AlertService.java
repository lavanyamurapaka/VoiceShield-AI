package com.voiceshield.ai.service;

import com.voiceshield.ai.dto.alert.AlertDto;
import com.voiceshield.ai.dto.alert.AlertUpdateRequest;
import com.voiceshield.ai.entity.Alert;
import com.voiceshield.ai.entity.DetectionSession;
import com.voiceshield.ai.entity.User;
import com.voiceshield.ai.entity.enums.AlertSeverity;
import com.voiceshield.ai.entity.enums.AlertStatus;
import com.voiceshield.ai.entity.enums.ThreatLevel;
import com.voiceshield.ai.repository.AlertRepository;
import com.voiceshield.ai.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public AlertService(AlertRepository alertRepository, UserRepository userRepository, AuditService auditService) {
        this.alertRepository = alertRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Alert createSecurityAlert(DetectionSession session, ThreatLevel threatLevel, String recommendedAction, String explanation) {
        AlertSeverity severity = switch (threatLevel) {
            case CRITICAL -> AlertSeverity.CRITICAL;
            case HIGH -> AlertSeverity.HIGH;
            case MEDIUM -> AlertSeverity.MEDIUM;
            default -> AlertSeverity.LOW;
        };

        Alert alert = new Alert();
        alert.setSession(session);
        alert.setSeverity(severity);
        alert.setStatus(AlertStatus.NEW);
        alert.setTitle("Voice Impersonation Risk: " + threatLevel.name());
        alert.setDescription("Threat level flagged as " + threatLevel.name() + ". Recommended action: " + recommendedAction + ". Details: " + explanation);
        alert.setCreatedAt(Instant.now());

        Alert saved = alertRepository.save(alert);
        auditService.logAction(session.getUser(), "SECURITY_ALERT_GENERATED", "ALERT", saved.getId().toString(), null, "SUCCESS", "Severity: " + severity.name());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<AlertDto> getRecentAlerts() {
        return alertRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<AlertDto> getAllAlerts(Pageable pageable) {
        return alertRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToDto);
    }

    @Transactional
    public AlertDto updateAlert(UUID alertId, AlertUpdateRequest request, UUID analystId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found"));

        if (request.getStatus() != null) {
            alert.setStatus(AlertStatus.valueOf(request.getStatus().toUpperCase()));
            if (alert.getStatus() == AlertStatus.RESOLVED || alert.getStatus() == AlertStatus.FALSE_POSITIVE) {
                alert.setResolvedAt(Instant.now());
            }
        }
        if (request.getInvestigationNotes() != null) {
            alert.setInvestigationNotes(request.getInvestigationNotes());
        }
        if (request.getActionTaken() != null) {
            alert.setActionTaken(request.getActionTaken());
        }
        if (analystId != null) {
            userRepository.findById(analystId).ifPresent(alert::setAssignedTo);
        }

        Alert updated = alertRepository.save(alert);
        auditService.logAction(alert.getAssignedTo(), "ALERT_UPDATED", "ALERT", alertId.toString(), null, "SUCCESS", "New status: " + alert.getStatus().name());
        return mapToDto(updated);
    }

    public AlertDto mapToDto(Alert alert) {
        AlertDto dto = new AlertDto();
        dto.setId(alert.getId());
        dto.setSessionId(alert.getSession().getId());
        dto.setSeverity(alert.getSeverity().name());
        dto.setStatus(alert.getStatus().name());
        dto.setTitle(alert.getTitle());
        dto.setDescription(alert.getDescription());
        dto.setAssignedToUsername(alert.getAssignedTo() != null ? alert.getAssignedTo().getUsername() : null);
        dto.setInvestigationNotes(alert.getInvestigationNotes());
        dto.setActionTaken(alert.getActionTaken());
        dto.setCreatedAt(alert.getCreatedAt());
        dto.setResolvedAt(alert.getResolvedAt());
        return dto;
    }
}
