package com.voiceshield.ai.controller;

import com.voiceshield.ai.client.AiServiceClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final AiServiceClient aiServiceClient;

    public HealthController(AiServiceClient aiServiceClient) {
        this.aiServiceClient = aiServiceClient;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        boolean aiHealthy = aiServiceClient.isHealthy();

        return ResponseEntity.ok(Map.of(
                "status", aiHealthy ? "HEALTHY" : "DEGRADED",
                "backend", "ONLINE",
                "database", "ONLINE",
                "ai_service", aiHealthy ? "ONLINE" : "UNREACHABLE",
                "timestamp", Instant.now().toString()
        ));
    }
}
