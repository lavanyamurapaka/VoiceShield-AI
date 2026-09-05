package com.voiceshield.ai.controller;

import com.voiceshield.ai.dto.detection.DetectionRequestDto;
import com.voiceshield.ai.dto.detection.DetectionSessionResponse;
import com.voiceshield.ai.security.UserPrincipal;
import com.voiceshield.ai.service.DetectionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/detection")
public class DetectionController {

    private final DetectionService detectionService;

    public DetectionController(DetectionService detectionService) {
        this.detectionService = detectionService;
    }

    @PostMapping("/start")
    public ResponseEntity<DetectionSessionResponse> startDetection(
            @Valid @RequestBody DetectionRequestDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest servletRequest) {
        if (userPrincipal != null) {
            request.setUserId(userPrincipal.getId());
        }
        String clientIp = servletRequest.getRemoteAddr();
        return ResponseEntity.ok(detectionService.processAudioAnalysis(request, clientIp));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DetectionSessionResponse> uploadAudioFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "language", defaultValue = "EN") String language,
            @RequestParam(value = "contextUrgency", defaultValue = "0.0") Double contextUrgency,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest servletRequest) throws IOException {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded audio file cannot be empty");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("Uploaded audio exceeds maximum allowed size of 10MB");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename().toUpperCase() : "AUDIO.WAV";
        String format = "WAV";
        if (originalFilename.endsWith(".MP3")) format = "MP3";
        else if (originalFilename.endsWith(".WEBM")) format = "WEBM";

        String base64Audio = Base64.getEncoder().encodeToString(file.getBytes());

        DetectionRequestDto requestDto = new DetectionRequestDto();
        if (userPrincipal != null) {
            requestDto.setUserId(userPrincipal.getId());
        }
        requestDto.setChannelType("AUDIO_UPLOAD");
        requestDto.setAudioFormat(format);
        requestDto.setLanguage(language);
        requestDto.setAudioBase64(base64Audio);
        requestDto.setContextUrgencyScore(contextUrgency);

        String clientIp = servletRequest.getRemoteAddr();
        return ResponseEntity.ok(detectionService.processAudioAnalysis(requestDto, clientIp));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetectionSessionResponse> getSessionById(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(detectionService.getSessionById(id));
    }

    @GetMapping("/history")
    public ResponseEntity<List<DetectionSessionResponse>> getUserHistory(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(detectionService.getUserHistory(userPrincipal.getId()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ROLE_ANALYST', 'ROLE_ADMIN')")
    public ResponseEntity<Page<DetectionSessionResponse>> getAllSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(detectionService.getAllSessions(PageRequest.of(page, size)));
    }
}
