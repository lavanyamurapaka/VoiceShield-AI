package com.voiceshield.ai.service;

import com.voiceshield.ai.client.AiServiceClient;
import com.voiceshield.ai.dto.verification.ChallengeCompleteRequest;
import com.voiceshield.ai.dto.verification.ChallengeStartRequest;
import com.voiceshield.ai.dto.verification.VerificationResponseDto;
import com.voiceshield.ai.entity.DetectionSession;
import com.voiceshield.ai.entity.User;
import com.voiceshield.ai.entity.VerificationSession;
import com.voiceshield.ai.entity.enums.VerificationStatus;
import com.voiceshield.ai.repository.DetectionSessionRepository;
import com.voiceshield.ai.repository.UserRepository;
import com.voiceshield.ai.repository.VerificationSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class VerificationService {

    private final VerificationSessionRepository verificationRepository;
    private final DetectionSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final VoiceProfileService voiceProfileService;
    private final AiServiceClient aiServiceClient;
    private final AuditService auditService;

    // Multilingual Challenge Phrases (English, Hindi, Telugu)
    private static final Map<String, List<String>> CHALLENGE_PHRASES = Map.of(
            "EN", List.of(
                    "The blue sparrow sang softly under the morning sunlight.",
                    "Quick silver flows across the digital security barrier.",
                    "Authorize verification code seven four two nine for Voice Shield.",
                    "Security protocol delta requires authentic biometric validation."
            ),
            "HI", List.of(
                    "सुरक्षा सत्यापन के लिए कृपया इस वाक्य को स्पष्ट रूप से पढ़ें।",
                    "नीला आकाश और शांत हवा आज के मौसम का परिचय देते हैं।",
                    "वॉइस शील्ड प्रमाणीकरण कोड नौ आठ सात छह है।"
            ),
            "TE", List.of(
                    "భద్రతా ధృవీకరణ కోసం దయచేసి ఈ వాక్యాన్ని స్పష్టంగా చదవండి.",
                    "సూర్యోదయపు వెలుగులో పక్షుల కిలకిలా రావాలు వినిపిస్తున్నాయి.",
                    "వాయిస్ షీల్డ్ ఆథెంటికేషన్ కోడ్ ఐదు మూడు ఎనిమిది ఒకటి."
            )
    );

    public VerificationService(
            VerificationSessionRepository verificationRepository,
            DetectionSessionRepository sessionRepository,
            UserRepository userRepository,
            VoiceProfileService voiceProfileService,
            AiServiceClient aiServiceClient,
            AuditService auditService) {
        this.verificationRepository = verificationRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.voiceProfileService = voiceProfileService;
        this.aiServiceClient = aiServiceClient;
        this.auditService = auditService;
    }

    @Transactional
    public VerificationResponseDto initiateChallenge(ChallengeStartRequest request, UUID userId) {
        String lang = (request.getLanguage() != null && CHALLENGE_PHRASES.containsKey(request.getLanguage().toUpperCase()))
                ? request.getLanguage().toUpperCase() : "EN";

        List<String> pool = CHALLENGE_PHRASES.get(lang);
        String selectedPhrase = pool.get(new Random().nextInt(pool.size()));

        VerificationSession session = new VerificationSession();
        if (request.getSessionId() != null) {
            sessionRepository.findById(request.getSessionId()).ifPresent(session::setDetectionSession);
        }
        if (userId != null) {
            userRepository.findById(userId).ifPresent(session::setUser);
        }

        session.setChallengePhrase(selectedPhrase);
        session.setLanguageCode(lang);
        session.setStatus(VerificationStatus.PENDING);
        session.setExpiresAt(Instant.now().plus(5, ChronoUnit.MINUTES));
        session.setCreatedAt(Instant.now());

        VerificationSession saved = verificationRepository.save(session);

        VerificationResponseDto response = new VerificationResponseDto();
        response.setChallengeSessionId(saved.getId());
        response.setChallengePhrase(selectedPhrase);
        response.setLanguage(lang);
        response.setStatus("PENDING");
        return response;
    }

    @Transactional
    public VerificationResponseDto completeChallenge(ChallengeCompleteRequest request, UUID userId) {
        VerificationSession session = verificationRepository.findById(request.getChallengeSessionId())
                .orElseThrow(() -> new IllegalArgumentException("Verification session not found"));

        if (session.getExpiresAt().isBefore(Instant.now())) {
            session.setStatus(VerificationStatus.FAIL);
            session.setFinalVerdict("FAIL");
            session.setExplanation("Challenge expired. Response must be submitted within 5 minutes.");
            verificationRepository.save(session);
            throw new IllegalStateException("Verification challenge expired");
        }

        List<Double> referenceEmbedding = null;
        if (session.getUser() != null) {
            referenceEmbedding = voiceProfileService.getActiveReferenceEmbedding(session.getUser().getId());
        }

        Map<String, Object> aiVerifyResult = aiServiceClient.verifyVoice(
                request.getAudioBase64(),
                referenceEmbedding,
                session.getChallengePhrase(),
                session.getLanguageCode()
        );

        String verdictStr = (String) aiVerifyResult.getOrDefault("verdict", "UNCERTAIN");
        VerificationStatus status = VerificationStatus.valueOf(verdictStr.toUpperCase());
        double sim = ((Number) aiVerifyResult.getOrDefault("similarity_score", 0.0)).doubleValue();
        boolean timingAnomaly = (Boolean) aiVerifyResult.getOrDefault("timing_anomaly", false);
        String explanation = (String) aiVerifyResult.getOrDefault("explanation", "");

        session.setStatus(status);
        session.setFinalVerdict(status.name());
        session.setSimilarityScore(BigDecimal.valueOf(sim));
        session.setTimingAnomalyDetected(timingAnomaly);
        session.setExplanation(explanation);
        session.setCompletedAt(Instant.now());

        verificationRepository.save(session);

        auditService.logAction(
                session.getUser(),
                "SECONDARY_VERIFICATION_COMPLETED",
                "VERIFICATION_SESSION",
                session.getId().toString(),
                null,
                status.name(),
                "Verdict: " + status.name() + ", Similarity: " + sim
        );

        VerificationResponseDto resp = new VerificationResponseDto();
        resp.setChallengeSessionId(session.getId());
        resp.setChallengePhrase(session.getChallengePhrase());
        resp.setLanguage(session.getLanguageCode());
        resp.setStatus(status.name());
        resp.setVerdict(status.name());
        resp.setSimilarityScore(BigDecimal.valueOf(sim));
        resp.setTimingAnomalyDetected(timingAnomaly);
        resp.setExplanation(explanation);
        return resp;
    }
}
