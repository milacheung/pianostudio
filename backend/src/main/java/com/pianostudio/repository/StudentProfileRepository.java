package com.pianostudio.repository;

import com.pianostudio.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUserId(Long userId);
    List<StudentProfile> findByStudioIdOrderByTotalPointsDesc(Long studioId);
    List<StudentProfile> findByParentId(Long parentId);
    void deleteByUserId(Long userId);

    // Leaderboard queries
    List<StudentProfile> findByStudioIdOrderByCurrentStreakDesc(Long studioId);

    @Query("SELECT sp FROM StudentProfile sp WHERE sp.studio.id = :studioId ORDER BY sp.totalPoints DESC, sp.currentStreak DESC")
    List<StudentProfile> findByStudioIdOrderedByPoints(@Param("studioId") Long studioId);

    @Query("SELECT sp FROM StudentProfile sp WHERE sp.studio.id = :studioId ORDER BY sp.currentStreak DESC, sp.totalPoints DESC")
    List<StudentProfile> findByStudioIdOrderedByStreak(@Param("studioId") Long studioId);

    @Query("SELECT sp.id as studentId, sp.user.name as studentName, sp.user.avatarUrl as avatarUrl, " +
           "sp.totalPoints as totalPoints, sp.currentStreak as currentStreak, " +
           "COALESCE(SUM(ps.minutes), 0) as weeklyMinutes " +
           "FROM StudentProfile sp " +
           "LEFT JOIN PracticeSession ps ON ps.student.id = sp.user.id AND ps.startTime >= :weekStart " +
           "WHERE sp.studio.id = :studioId " +
           "GROUP BY sp.id, sp.user.name, sp.user.avatarUrl, sp.totalPoints, sp.currentStreak " +
           "ORDER BY weeklyMinutes DESC, sp.totalPoints DESC")
    List<Object[]> findByStudioIdWithWeeklyMinutes(@Param("studioId") Long studioId, @Param("weekStart") LocalDateTime weekStart);
}
