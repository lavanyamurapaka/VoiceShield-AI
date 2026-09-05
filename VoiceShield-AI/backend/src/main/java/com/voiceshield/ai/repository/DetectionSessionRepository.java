package com.voiceshield.ai.repository;

import com.voiceshield.ai.entity.DetectionSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DetectionSessionRepository extends JpaRepository<DetectionSession, UUID> {
    Optional<DetectionSession> findBySessionToken(String sessionToken);
    List<DetectionSession> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Page<DetectionSession> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(String status);
}
