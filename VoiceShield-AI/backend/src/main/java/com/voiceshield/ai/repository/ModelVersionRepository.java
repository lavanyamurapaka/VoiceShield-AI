package com.voiceshield.ai.repository;

import com.voiceshield.ai.entity.ModelVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ModelVersionRepository extends JpaRepository<ModelVersion, UUID> {
    Optional<ModelVersion> findFirstByIsActiveTrue();
    Optional<ModelVersion> findByVersionTag(String versionTag);
}
