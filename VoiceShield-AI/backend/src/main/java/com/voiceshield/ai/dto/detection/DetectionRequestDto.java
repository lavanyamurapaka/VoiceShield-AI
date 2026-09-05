package com.voiceshield.ai.dto.detection;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class DetectionRequestDto {
    private UUID userId;
    
    @NotBlank
    private String channelType = "AUDIO_UPLOAD"; // MICROPHONE_STREAM, AUDIO_UPLOAD
    
    private String audioFormat = "WAV";
    private Integer sampleRate = 16000;
    private String language = "EN"; // EN, HI, TE
    private String audioBase64;
    private Double contextUrgencyScore = 0.0;

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getChannelType() { return channelType; }
    public void setChannelType(String channelType) { this.channelType = channelType; }
    public String getAudioFormat() { return audioFormat; }
    public void setAudioFormat(String audioFormat) { this.audioFormat = audioFormat; }
    public Integer getSampleRate() { return sampleRate; }
    public void setSampleRate(Integer sampleRate) { this.sampleRate = sampleRate; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getAudioBase64() { return audioBase64; }
    public void setAudioBase64(String audioBase64) { this.audioBase64 = audioBase64; }
    public Double getContextUrgencyScore() { return contextUrgencyScore; }
    public void setContextUrgencyScore(Double contextUrgencyScore) { this.contextUrgencyScore = contextUrgencyScore; }
}
