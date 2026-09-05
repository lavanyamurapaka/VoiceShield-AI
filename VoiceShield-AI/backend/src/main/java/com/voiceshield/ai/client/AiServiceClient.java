package com.voiceshield.ai.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(AiServiceClient.class);

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public AiServiceClient(
            RestTemplateBuilder builder,
            @Value("${app.ai-service.base-url:http://localhost:8000}") String baseUrl,
            @Value("${app.ai-service.timeout-ms:8000}") long timeoutMs) {
        this.baseUrl = baseUrl;
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofMillis(timeoutMs))
                .setReadTimeout(Duration.ofMillis(timeoutMs))
                .build();
    }

    public Map<String, Object> analyzeAudio(String sessionId, String audioBase64, String format, String language, List<Double> referenceEmbedding, Double contextUrgency) {
        String url = baseUrl + "/ai/analyze";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = new HashMap<>();
        payload.put("session_id", sessionId);
        payload.put("audio_base64", audioBase64);
        payload.put("audio_format", format != null ? format : "WAV");
        payload.put("language", language != null ? language : "EN");
        payload.put("reference_embedding", referenceEmbedding);
        payload.put("context_urgency_score", contextUrgency != null ? contextUrgency : 0.0);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
        } catch (Exception ex) {
            logger.error("AI Service /ai/analyze failed: {}", ex.getMessage());
            throw new RuntimeException("AI service is temporarily unavailable: " + ex.getMessage(), ex);
        }
    }

    public Map<String, Object> extractEmbedding(String audioBase64, String format) {
        String url = baseUrl + "/ai/embedding";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = new HashMap<>();
        payload.put("audio_base64", audioBase64);
        payload.put("audio_format", format != null ? format : "WAV");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
        } catch (Exception ex) {
            logger.error("AI Service /ai/embedding failed: {}", ex.getMessage());
            throw new RuntimeException("AI embedding extraction failed: " + ex.getMessage(), ex);
        }
    }

    public Map<String, Object> verifyVoice(String audioBase64, List<Double> referenceEmbedding, String expectedPhrase, String language) {
        String url = baseUrl + "/ai/verify";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = new HashMap<>();
        payload.put("audio_base64", audioBase64);
        payload.put("reference_embedding", referenceEmbedding);
        payload.put("expected_phrase", expectedPhrase);
        payload.put("language", language != null ? language : "EN");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
        } catch (Exception ex) {
            logger.error("AI Service /ai/verify failed: {}", ex.getMessage());
            throw new RuntimeException("AI verification service failed: " + ex.getMessage(), ex);
        }
    }

    public Map<String, Object> getModelInfo() {
        String url = baseUrl + "/ai/model-info";
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getBody();
        } catch (Exception ex) {
            logger.warn("Could not retrieve AI model info: {}", ex.getMessage());
            return Map.of("model_name", "Offline-Fallback", "adapter_type", "DEVELOPMENT", "warning", "AI Service unreachable");
        }
    }

    public boolean isHealthy() {
        String url = baseUrl + "/ai/health";
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception ex) {
            return false;
        }
    }
}
