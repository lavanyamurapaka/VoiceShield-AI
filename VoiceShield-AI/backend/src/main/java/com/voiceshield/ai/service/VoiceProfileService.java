package com.voiceshield.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voiceshield.ai.client.AiServiceClient;
import com.voiceshield.ai.entity.User;
import com.voiceshield.ai.entity.VoiceProfile;
import com.voiceshield.ai.repository.UserRepository;
import com.voiceshield.ai.repository.VoiceProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class VoiceProfileService {

    private final VoiceProfileRepository voiceProfileRepository;
    private final UserRepository userRepository;
    private final AiServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;
    private final AuditService auditService;

    public VoiceProfileService(
            VoiceProfileRepository voiceProfileRepository,
            UserRepository userRepository,
            AiServiceClient aiServiceClient,
            ObjectMapper objectMapper,
            AuditService auditService) {
        this.voiceProfileRepository = voiceProfileRepository;
        this.userRepository = userRepository;
        this.aiServiceClient = aiServiceClient;
        this.objectMapper = objectMapper;
        this.auditService = auditService;
    }

    @Transactional
    public VoiceProfile enrollVoiceProfile(UUID userId, String profileName, String audioBase64) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Map<String, Object> embeddingResponse = aiServiceClient.extractEmbedding(audioBase64, "WAV");
        List<Double> embedding = (List<Double>) embeddingResponse.get("embedding");

        String embeddingJson;
        try {
            embeddingJson = objectMapper.writeValueAsString(embedding);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize embedding", e);
        }

        VoiceProfile profile = new VoiceProfile();
        profile.setUser(user);
        profile.setProfileName(profileName);
        profile.setEmbeddingVector(embeddingJson);
        profile.setSampleRate((Integer) embeddingResponse.getOrDefault("sample_rate", 16000));
        profile.setEmbeddingDimension((Integer) embeddingResponse.getOrDefault("dimension", 192));
        profile.setAlgorithmVersion((String) embeddingResponse.getOrDefault("algorithm", "MelFilterbank-DCT-Projection"));
        profile.setStatus("ACTIVE");
        profile.setEnrolledAt(Instant.now());
        profile.setUpdatedAt(Instant.now());

        VoiceProfile saved = voiceProfileRepository.save(profile);
        auditService.logAction(user, "VOICE_PROFILE_ENROLLMENT", "VOICE_PROFILE", saved.getId().toString(), null, "SUCCESS", "New voice embedding profile created");
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Double> getActiveReferenceEmbedding(UUID userId) {
        return voiceProfileRepository.findFirstByUserIdAndStatusOrderByEnrolledAtDesc(userId, "ACTIVE")
                .map(profile -> {
                    try {
                        return objectMapper.readValue(profile.getEmbeddingVector(), new TypeReference<List<Double>>() {});
                    } catch (Exception e) {
                        return Collections.<Double>emptyList();
                    }
                })
                .orElse(null);
    }
}
