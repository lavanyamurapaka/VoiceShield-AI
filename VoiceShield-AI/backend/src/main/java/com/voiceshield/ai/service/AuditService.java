package com.voiceshield.ai.service;

import com.voiceshield.ai.entity.AuditLog;
import com.voiceshield.ai.entity.User;
import com.voiceshield.ai.repository.AuditLogRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Async
    @Transactional
    public void logAction(User user, String action, String resourceType, String resourceId, String ipAddress, String status, String details) {
        try {
            AuditLog log = new AuditLog(user, action, resourceType, resourceId, ipAddress, status, details);
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Never fail parent business transaction due to audit logging failure
        }
    }
}
