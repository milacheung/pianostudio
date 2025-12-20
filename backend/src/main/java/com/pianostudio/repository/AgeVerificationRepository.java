package com.pianostudio.repository;

import com.pianostudio.model.AgeVerification;
import com.pianostudio.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgeVerificationRepository extends JpaRepository<AgeVerification, Long> {
    Optional<AgeVerification> findByUser(User user);
    Optional<AgeVerification> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    void deleteByUserId(Long userId);
}
