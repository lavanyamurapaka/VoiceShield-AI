package com.voiceshield.ai.controller;

import com.voiceshield.ai.dto.verification.ChallengeCompleteRequest;
import com.voiceshield.ai.dto.verification.ChallengeStartRequest;
import com.voiceshield.ai.dto.verification.VerificationResponseDto;
import com.voiceshield.ai.security.UserPrincipal;
import com.voiceshield.ai.service.VerificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/verification")
public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping("/challenge/start")
    public ResponseEntity<VerificationResponseDto> startChallenge(
            @Valid @RequestBody ChallengeStartRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UUID userId = userPrincipal != null ? userPrincipal.getId() : null;
        return ResponseEntity.ok(verificationService.initiateChallenge(request, userId));
    }

    @PostMapping("/challenge/complete")
    public ResponseEntity<VerificationResponseDto> completeChallenge(
            @Valid @RequestBody ChallengeCompleteRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UUID userId = userPrincipal != null ? userPrincipal.getId() : null;
        return ResponseEntity.ok(verificationService.completeChallenge(request, userId));
    }
}
