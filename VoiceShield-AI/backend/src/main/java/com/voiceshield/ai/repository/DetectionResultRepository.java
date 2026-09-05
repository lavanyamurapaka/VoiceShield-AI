package com.voiceshield.ai.repository;

import com.voiceshield.ai.entity.DetectionResult;
import com.voiceshield.ai.entity.enums.ThreatLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DetectionResultRepository extends JpaRepository<DetectionResult, UUID> {
    Optional<DetectionResult> findBySessionId(UUID sessionId);
    long countByThreatLevel(ThreatLevel threatLevel);
    
    @Query("SELECT COUNT(r) FROM DetectionResult r WHERE r.threatLevel IN ('HIGH', 'CRITICAL')")
    long countHighAndCriticalSessions();
}
