package com.voiceshield.ai.repository;

import com.voiceshield.ai.entity.VerificationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VerificationSessionRepository extends JpaRepository<VerificationSession, UUID> {
    Optional<VerificationSession> findTopByUserIdOrderByCreatedAtDesc(UUID userId);
}
