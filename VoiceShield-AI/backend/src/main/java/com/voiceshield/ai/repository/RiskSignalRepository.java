package com.voiceshield.ai.repository;

import com.voiceshield.ai.entity.RiskSignal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RiskSignalRepository extends JpaRepository<RiskSignal, UUID> {
    List<RiskSignal> findByDetectionResultId(UUID detectionResultId);
}
