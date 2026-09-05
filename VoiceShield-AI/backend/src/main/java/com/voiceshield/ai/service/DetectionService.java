package com.voiceshield.ai.service;

import com.voiceshield.ai.client.AiServiceClient;
import com.voiceshield.ai.dto.detection.*;
import com.voiceshield.ai.entity.*;
import com.voiceshield.ai.entity.enums.Classification;
import com.voiceshield.ai.entity.enums.ThreatLevel;
import com.voiceshield.ai.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DetectionService {

    private final DetectionSessionRepository sessionRepository;
    private final DetectionResultRepository resultRepository;
    private final RiskSignalRepository signalRepository;
    private final ModelVersionRepository modelVersionRepository;
    private final UserRepository userRepository;
    private final AiServiceClient aiServiceClient;
    private final VoiceProfileService voiceProfileService;
    private final AlertService alertService;
    private final AuditService auditService;

    public DetectionService(
            DetectionSessionRepository sessionRepository,
            DetectionResultRepository resultRepository,
            RiskSignalRepository signalRepository,
            ModelVersionRepository modelVersionRepository,
            UserRepository userRepository,
            AiServiceClient aiServiceClient,
            VoiceProfileService voiceProfileService,
            AlertService alertService,
            AuditService auditService) {
        this.sessionRepository = sessionRepository;
        this.resultRepository = resultRepository;
        this.signalRepository = signalRepository;
        this.modelVersionRepository = modelVersionRepository;
        this.userRepository = userRepository;
        this.aiServiceClient = aiServiceClient;
        this.voiceProfileService = voiceProfileService;
        this.alertService = alertService;
        this.auditService = auditService;
    }

    @Transactional
    public DetectionSessionResponse processAudioAnalysis(DetectionRequestDto request, String clientIp) {
        DetectionSession session = new DetectionSession();
        if (request.getUserId() != null) {
            userRepository.findById(request.getUserId()).ifPresent(session::setUser);
        }
        session.setSessionToken(UUID.randomUUID().toString());
        session.setChannelType(request.getChannelType());
        session.setAudioFormat(request.getAudioFormat());
        session.setSampleRate(request.getSampleRate());
        session.setLanguageCode(request.getLanguage());
        session.setIpAddress(clientIp);
        session.setStatus("PROCESSING");
        session.setCreatedAt(Instant.now());

        DetectionSession savedSession = sessionRepository.save(session);

        // Fetch user reference voice profile embedding if user is enrolled
        List<Double> referenceEmbedding = null;
        if (session.getUser() != null) {
            referenceEmbedding = voiceProfileService.getActiveReferenceEmbedding(session.getUser().getId());
        }

        // Call FastAPI AI Service
        Map<String, Object> aiResponse;
        try {
            aiResponse = aiServiceClient.analyzeAudio(
                    savedSession.getId().toString(),
                    request.getAudioBase64(),
                    request.getAudioFormat(),
                    request.getLanguage(),
                    referenceEmbedding,
                    request.getContextUrgencyScore()
            );
        } catch (Exception ex) {
            savedSession.setStatus("FAILED");
            sessionRepository.save(savedSession);
            throw ex;
        }

        // Parse AI response and build entities
        String classificationStr = (String) aiResponse.getOrDefault("classification", "UNCERTAIN");
        Classification classification = Classification.valueOf(classificationStr.toUpperCase());
        BigDecimal confidence = BigDecimal.valueOf(((Number) aiResponse.getOrDefault("model_confidence", 0.5)).doubleValue());
        BigDecimal riskScore = BigDecimal.valueOf(((Number) aiResponse.getOrDefault("security_risk_score", 0.0)).doubleValue());
        String threatLevelStr = (String) aiResponse.getOrDefault("threat_level", "LOW");
        ThreatLevel threatLevel = ThreatLevel.valueOf(threatLevelStr.toUpperCase());
        BigDecimal aiProb = BigDecimal.valueOf(((Number) aiResponse.getOrDefault("ai_generated_probability", 0.0)).doubleValue());
        BigDecimal cloneProb = BigDecimal.valueOf(((Number) aiResponse.getOrDefault("voice_clone_probability", 0.0)).doubleValue());
        
        BigDecimal speakerSim = null;
        if (aiResponse.get("speaker_similarity_score") != null) {
            speakerSim = BigDecimal.valueOf(((Number) aiResponse.get("speaker_similarity_score")).doubleValue());
        }

        String recommendedAction = (String) aiResponse.getOrDefault("recommended_action", "ALLOW_SESSION_CONTINUE");
        boolean isDevResult = (Boolean) aiResponse.getOrDefault("is_development_result", true);
        String devWarning = (String) aiResponse.getOrDefault("development_warning", null);
        String explanationSummary = (String) aiResponse.getOrDefault("explanation_summary", "");
        Integer inferenceMs = ((Number) aiResponse.getOrDefault("inference_duration_ms", 50)).intValue();

        ModelVersion modelVersion = modelVersionRepository.findFirstByIsActiveTrue().orElse(null);

        DetectionResult result = new DetectionResult();
        result.setSession(savedSession);
        result.setModelVersion(modelVersion);
        result.setClassification(classification);
        result.setModelConfidence(confidence);
        result.setSecurityRiskScore(riskScore);
        result.setThreatLevel(threatLevel);
        result.setAiGeneratedProbability(aiProb);
        result.setVoiceCloneProbability(cloneProb);
        result.setSpeakerSimilarityScore(speakerSim);
        result.setRecommendedAction(recommendedAction);
        result.setDevelopmentResult(isDevResult);
        result.setDevelopmentWarning(devWarning);
        result.setExplanationSummary(explanationSummary);
        result.setInferenceDurationMs(inferenceMs);
        result.setCreatedAt(Instant.now());

        // Parse risk signals
        List<Map<String, Object>> rawSignals = (List<Map<String, Object>>) aiResponse.get("signals");
        if (rawSignals != null) {
            for (Map<String, Object> rawSignal : rawSignals) {
                RiskSignal sig = new RiskSignal();
                sig.setDetectionResult(result);
                sig.setSignalType((String) rawSignal.get("signal_type"));
                sig.setAnomalyDetected((Boolean) rawSignal.getOrDefault("anomaly_detected", false));
                sig.setRawMetricValue(BigDecimal.valueOf(((Number) rawSignal.getOrDefault("raw_metric_value", 0.0)).doubleValue()));
                sig.setWeightPercentage(BigDecimal.valueOf(((Number) rawSignal.getOrDefault("weight_percentage", 0.0)).doubleValue()));
                sig.setContributionScore(BigDecimal.valueOf(((Number) rawSignal.getOrDefault("contribution_score", 0.0)).doubleValue()));
                sig.setExplanation((String) rawSignal.getOrDefault("explanation", ""));
                result.getSignals().add(sig);
            }
        }

        DetectionResult savedResult = resultRepository.save(result);

        savedSession.setStatus("COMPLETED");
        savedSession.setCompletedAt(Instant.now());
        sessionRepository.save(savedSession);

        // Security Alert creation for HIGH or CRITICAL threat level
        if (threatLevel == ThreatLevel.HIGH || threatLevel == ThreatLevel.CRITICAL) {
            alertService.createSecurityAlert(savedSession, threatLevel, recommendedAction, explanationSummary);
        }

        auditService.logAction(
                savedSession.getUser(),
                "VOICE_DETECTION_ANALYSIS",
                "DETECTION_SESSION",
                savedSession.getId().toString(),
                clientIp,
                "SUCCESS",
                "Classification: " + classification.name() + ", Threat: " + threatLevel.name() + ", RiskScore: " + riskScore
        );

        return mapToSessionResponse(savedSession, savedResult);
    }

    @Transactional(readOnly = true)
    public DetectionSessionResponse getSessionById(UUID sessionId) {
        DetectionSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Detection session not found"));
        DetectionResult result = resultRepository.findBySessionId(sessionId).orElse(null);
        return mapToSessionResponse(session, result);
    }

    @Transactional(readOnly = true)
    public List<DetectionSessionResponse> getUserHistory(UUID userId) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(session -> {
                    DetectionResult res = resultRepository.findBySessionId(session.getId()).orElse(null);
                    return mapToSessionResponse(session, res);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<DetectionSessionResponse> getAllSessions(Pageable pageable) {
        return sessionRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(session -> {
                    DetectionResult res = resultRepository.findBySessionId(session.getId()).orElse(null);
                    return mapToSessionResponse(session, res);
                });
    }

    public DetectionSessionResponse mapToSessionResponse(DetectionSession session, DetectionResult result) {
        DetectionSessionResponse resp = new DetectionSessionResponse();
        resp.setSessionId(session.getId());
        resp.setSessionToken(session.getSessionToken());
        resp.setStatus(session.getStatus());
        resp.setChannelType(session.getChannelType());
        resp.setAudioFormat(session.getAudioFormat());
        resp.setDurationMs(session.getDurationMs());
        resp.setLanguageCode(session.getLanguageCode());
        resp.setCreatedAt(session.getCreatedAt());

        if (result != null) {
            DetectionResultDto resultDto = new DetectionResultDto();
            resultDto.setId(result.getId());
            resultDto.setClassification(result.getClassification().name());
            resultDto.setModelConfidence(result.getModelConfidence());
            resultDto.setSecurityRiskScore(result.getSecurityRiskScore());
            resultDto.setThreatLevel(result.getThreatLevel().name());
            resultDto.setAiGeneratedProbability(result.getAiGeneratedProbability());
            resultDto.setVoiceCloneProbability(result.getVoiceCloneProbability());
            resultDto.setSpeakerSimilarityScore(result.getSpeakerSimilarityScore());
            resultDto.setRecommendedAction(result.getRecommendedAction());
            resultDto.setDevelopmentResult(result.isDevelopmentResult());
            resultDto.setDevelopmentWarning(result.getDevelopmentWarning());
            resultDto.setExplanationSummary(result.getExplanationSummary());
            resultDto.setInferenceDurationMs(result.getInferenceDurationMs());
            resultDto.setModelVersion(result.getModelVersion() != null ? result.getModelVersion().getVersionTag() : "v1.0.0-dev");

            List<RiskSignalDto> signalDtos = result.getSignals().stream().map(s -> {
                RiskSignalDto sd = new RiskSignalDto();
                sd.setSignalType(s.getSignalType());
                sd.setAnomalyDetected(s.isAnomalyDetected());
                sd.setRawMetricValue(s.getRawMetricValue());
                sd.setWeightPercentage(s.getWeightPercentage());
                sd.setContributionScore(s.getContributionScore());
                sd.setExplanation(s.getExplanation());
                return sd;
            }).collect(Collectors.toList());

            resultDto.setSignals(signalDtos);
            resp.setResult(resultDto);
        }

        return resp;
    }
}
