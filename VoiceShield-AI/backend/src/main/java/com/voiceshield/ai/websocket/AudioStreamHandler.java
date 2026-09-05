package com.voiceshield.ai.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voiceshield.ai.client.AiServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AudioStreamHandler extends AbstractWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(AudioStreamHandler.class);
    private final AiServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;

    // Buffer audio chunks per session until sufficient window (e.g. ~16KB - 32KB)
    private final Map<String, ByteArrayOutputStream> audioBuffers = new ConcurrentHashMap<>();
    private final Map<String, Integer> chunkCounters = new ConcurrentHashMap<>();

    public AudioStreamHandler(AiServiceClient aiServiceClient, ObjectMapper objectMapper) {
        this.aiServiceClient = aiServiceClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        audioBuffers.put(session.getId(), new ByteArrayOutputStream());
        chunkCounters.put(session.getId(), 0);
        logger.info("WebSocket audio stream connected: {}", session.getId());

        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of(
                "event", "CONNECTED",
                "session_id", session.getId(),
                "message", "VoiceShield real-time acoustic pipeline ready"
        ))));
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws Exception {
        ByteBuffer payload = message.getPayload();
        byte[] bytes = new byte[payload.remaining()];
        payload.get(bytes);

        ByteArrayOutputStream buffer = audioBuffers.get(session.getId());
        if (buffer != null) {
            buffer.write(bytes);
            int count = chunkCounters.compute(session.getId(), (k, v) -> v == null ? 1 : v + 1);

            // Every ~10 chunks or when buffer reaches 16KB, run low-latency analysis window
            if (buffer.size() >= 16384 || count % 8 == 0) {
                byte[] currentAudio = buffer.toByteArray();
                String base64Chunk = Base64.getEncoder().encodeToString(currentAudio);

                try {
                    Map<String, Object> aiResult = aiServiceClient.analyzeAudio(
                            session.getId(),
                            base64Chunk,
                            "WAV",
                            "EN",
                            null,
                            0.0
                    );

                    Map<String, Object> streamEvent = Map.of(
                            "event", "STREAM_RISK_UPDATE",
                            "chunk_index", count,
                            "buffer_bytes", currentAudio.length,
                            "threat_level", aiResult.getOrDefault("threat_level", "LOW"),
                            "security_risk_score", aiResult.getOrDefault("security_risk_score", 0.0),
                            "classification", aiResult.getOrDefault("classification", "HUMAN"),
                            "recommended_action", aiResult.getOrDefault("recommended_action", "ALLOW_SESSION_CONTINUE"),
                            "signals", aiResult.getOrDefault("signals", java.util.List.of())
                    );

                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(streamEvent)));
                } catch (Exception ex) {
                    logger.warn("Stream analysis chunk error: {}", ex.getMessage());
                }

                // If buffer exceeds 128KB, retain only the most recent 32KB for sliding window
                if (buffer.size() > 131072) {
                    buffer.reset();
                    buffer.write(currentAudio, Math.max(0, currentAudio.length - 32768), Math.min(32768, currentAudio.length));
                }
            }
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        if (payload.contains("RESET")) {
            ByteArrayOutputStream buffer = audioBuffers.get(session.getId());
            if (buffer != null) buffer.reset();
            chunkCounters.put(session.getId(), 0);
            session.sendMessage(new TextMessage("{\"event\": \"BUFFER_RESET\"}"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        audioBuffers.remove(session.getId());
        chunkCounters.remove(session.getId());
        logger.info("WebSocket audio stream closed: {}", session.getId());
    }
}
