package com.pianostudio.repository;

import com.pianostudio.model.EmailPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmailPreferenceRepository extends JpaRepository<EmailPreference, Long> {

    Optional<EmailPreference> findByEmail(String email);

    Optional<EmailPreference> findByUserId(Long userId);

    List<EmailPreference> findByWeeklyReportTrue();
}
