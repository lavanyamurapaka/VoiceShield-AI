package com.voiceshield.ai.repository;

import com.voiceshield.ai.entity.Alert;
import com.voiceshield.ai.entity.enums.AlertSeverity;
import com.voiceshield.ai.entity.enums.AlertStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {
    List<Alert> findTop10ByOrderByCreatedAtDesc();
    Page<Alert> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countBySeverity(AlertSeverity severity);
    long countByStatus(AlertStatus status);
}
