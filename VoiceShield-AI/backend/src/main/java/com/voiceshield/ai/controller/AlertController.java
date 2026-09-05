package com.voiceshield.ai.controller;

import com.voiceshield.ai.dto.alert.AlertDto;
import com.voiceshield.ai.dto.alert.AlertUpdateRequest;
import com.voiceshield.ai.security.UserPrincipal;
import com.voiceshield.ai.service.AlertService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/alerts")
@PreAuthorize("hasAnyAuthority('ROLE_ANALYST', 'ROLE_ADMIN')")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping("/recent")
    public ResponseEntity<List<AlertDto>> getRecentAlerts() {
        return ResponseEntity.ok(alertService.getRecentAlerts());
    }

    @GetMapping
    public ResponseEntity<Page<AlertDto>> getAllAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(alertService.getAllAlerts(PageRequest.of(page, size)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AlertDto> updateAlert(
            @PathVariable("id") UUID id,
            @RequestBody AlertUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UUID analystId = userPrincipal != null ? userPrincipal.getId() : null;
        return ResponseEntity.ok(alertService.updateAlert(id, request, analystId));
    }
}
