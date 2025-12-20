package com.pianostudio.repository;

import com.pianostudio.model.StudentBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentBadgeRepository extends JpaRepository<StudentBadge, Long> {
    List<StudentBadge> findByStudentIdOrderByEarnedAtDesc(Long studentId);
    Optional<StudentBadge> findByStudentIdAndBadgeId(Long studentId, Long badgeId);
    void deleteByStudentId(Long studentId);
}
