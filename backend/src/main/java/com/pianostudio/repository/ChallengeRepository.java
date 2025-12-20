package com.pianostudio.repository;

import com.pianostudio.model.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    List<Challenge> findByStudioId(Long studioId);
    List<Challenge> findByStudioIdAndEndDateGreaterThanEqual(Long studioId, LocalDate date);
}
