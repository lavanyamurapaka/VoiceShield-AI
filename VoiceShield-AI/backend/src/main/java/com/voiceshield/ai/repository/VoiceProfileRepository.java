package com.voiceshield.ai.repository;

import com.voiceshield.ai.entity.VoiceProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoiceProfileRepository extends JpaRepository<VoiceProfile, UUID> {
    List<VoiceProfile> findByUserId(UUID userId);
    Optional<VoiceProfile> findFirstByUserIdAndStatusOrderByEnrolledAtDesc(UUID userId, String status);
}
