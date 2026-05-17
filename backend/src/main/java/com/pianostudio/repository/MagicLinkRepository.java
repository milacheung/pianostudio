package com.pianostudio.repository;

import com.pianostudio.model.MagicLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MagicLinkRepository extends JpaRepository<MagicLink, Long> {

    Optional<MagicLink> findByToken(String token);

    List<MagicLink> findByEmailAndUsedAtIsNullAndExpiresAtAfter(String email, LocalDateTime now);

    List<MagicLink> findByStudentIdAndUsedAtIsNullAndExpiresAtAfter(Long studentId, LocalDateTime now);

    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
