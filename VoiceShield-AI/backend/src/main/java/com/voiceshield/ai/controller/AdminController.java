package com.voiceshield.ai.controller;

import com.voiceshield.ai.client.AiServiceClient;
import com.voiceshield.ai.dto.admin.AuditLogDto;
import com.voiceshield.ai.dto.admin.SystemConfigDto;
import com.voiceshield.ai.dto.admin.UserDto;
import com.voiceshield.ai.entity.AuditLog;
import com.voiceshield.ai.entity.SystemConfiguration;
import com.voiceshield.ai.entity.User;
import com.voiceshield.ai.repository.AuditLogRepository;
import com.voiceshield.ai.repository.SystemConfigurationRepository;
import com.voiceshield.ai.repository.UserRepository;
import com.voiceshield.ai.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final SystemConfigurationRepository systemConfigurationRepository;
    private final AiServiceClient aiServiceClient;

    public AdminController(
            UserRepository userRepository,
            AuditLogRepository auditLogRepository,
            SystemConfigurationRepository systemConfigurationRepository,
            AiServiceClient aiServiceClient) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.systemConfigurationRepository = systemConfigurationRepository;
        this.aiServiceClient = aiServiceClient;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> listUsers() {
        List<UserDto> users = userRepository.findAll().stream().map(u -> {
            UserDto dto = new UserDto();
            dto.setId(u.getId());
            dto.setUsername(u.getUsername());
            dto.setEmail(u.getEmail());
            dto.setFirstName(u.getFirstName());
            dto.setLastName(u.getLastName());
            dto.setDepartment(u.getDepartment());
            dto.setEnabled(u.isEnabled());
            dto.setRoles(u.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()));
            dto.setCreatedAt(u.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLogDto>> listAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLogDto> logs = auditLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(log -> {
                    AuditLogDto dto = new AuditLogDto();
                    dto.setId(log.getId());
                    dto.setUsername(log.getUser() != null ? log.getUser().getUsername() : "SYSTEM");
                    dto.setAction(log.getAction());
                    dto.setResourceType(log.getResourceType());
                    dto.setResourceId(log.getResourceId());
                    dto.setIpAddress(log.getIpAddress());
                    dto.setStatus(log.getStatus());
                    dto.setDetails(log.getDetails());
                    dto.setCreatedAt(log.getCreatedAt());
                    return dto;
                });
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/config")
    public ResponseEntity<List<SystemConfigDto>> listConfigurations() {
        List<SystemConfigDto> configs = systemConfigurationRepository.findAll().stream()
                .map(c -> new SystemConfigDto(c.getConfigKey(), c.getConfigValue(), c.getCategory(), c.getDescription()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(configs);
    }

    @PutMapping("/config/{key}")
    public ResponseEntity<SystemConfigDto> updateConfiguration(
            @PathVariable("key") String key,
            @RequestBody SystemConfigDto dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        SystemConfiguration config = systemConfigurationRepository.findByConfigKey(key)
                .orElseGet(() -> new SystemConfiguration(key, dto.getConfigValue(), dto.getCategory() != null ? dto.getCategory() : "CUSTOM", dto.getDescription()));

        config.setConfigValue(dto.getConfigValue());
        if (dto.getDescription() != null) config.setDescription(dto.getDescription());
        config.setUpdatedAt(Instant.now());
        if (userPrincipal != null) {
            userRepository.findById(userPrincipal.getId()).ifPresent(config::setUpdatedBy);
        }

        SystemConfiguration saved = systemConfigurationRepository.save(config);
        return ResponseEntity.ok(new SystemConfigDto(saved.getConfigKey(), saved.getConfigValue(), saved.getCategory(), saved.getDescription()));
    }

    @GetMapping("/model-info")
    public ResponseEntity<Map<String, Object>> getAiModelInfo() {
        return ResponseEntity.ok(aiServiceClient.getModelInfo());
    }
}
