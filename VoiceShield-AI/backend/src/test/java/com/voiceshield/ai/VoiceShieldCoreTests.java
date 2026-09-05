package com.voiceshield.ai;

import com.voiceshield.ai.entity.enums.Classification;
import com.voiceshield.ai.entity.enums.ThreatLevel;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class VoiceShieldCoreTests {

    @Test
    void testClassificationEnums() {
        assertEquals("HUMAN", Classification.HUMAN.name());
        assertEquals("SYNTHETIC", Classification.SYNTHETIC.name());
        assertEquals("VOICE_CLONED", Classification.VOICE_CLONED.name());
        assertEquals("SUSPICIOUS", Classification.SUSPICIOUS.name());
        assertEquals("UNCERTAIN", Classification.UNCERTAIN.name());
    }

    @Test
    void testThreatLevels() {
        assertEquals("LOW", ThreatLevel.LOW.name());
        assertEquals("MEDIUM", ThreatLevel.MEDIUM.name());
        assertEquals("HIGH", ThreatLevel.HIGH.name());
        assertEquals("CRITICAL", ThreatLevel.CRITICAL.name());
    }
}
