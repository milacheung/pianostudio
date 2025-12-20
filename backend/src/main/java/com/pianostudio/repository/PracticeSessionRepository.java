package com.pianostudio.repository;

import com.pianostudio.model.PracticeSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PracticeSessionRepository extends JpaRepository<PracticeSession, Long> {
    List<PracticeSession> findByStudentIdOrderByStartTimeDesc(Long studentId);
    List<PracticeSession> findByStudentIdAndStartTimeBetween(Long studentId, LocalDateTime start, LocalDateTime end);
    List<PracticeSession> findByAssignmentId(Long assignmentId);
    void deleteByStudentId(Long studentId);

    // Count completed sessions for a student
    @Query("SELECT COUNT(p) FROM PracticeSession p WHERE p.student.id = :studentId AND p.endTime IS NOT NULL")
    long countCompletedByStudentId(@Param("studentId") Long studentId);

    // Sum total minutes for a student
    @Query("SELECT COALESCE(SUM(p.minutes), 0) FROM PracticeSession p WHERE p.student.id = :studentId AND p.endTime IS NOT NULL")
    long sumMinutesByStudentId(@Param("studentId") Long studentId);
}
