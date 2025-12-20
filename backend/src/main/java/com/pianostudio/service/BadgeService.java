package com.pianostudio.service;

import com.pianostudio.dto.response.BadgeDTO;
import com.pianostudio.dto.response.StudentBadgeDTO;
import com.pianostudio.model.Badge;
import com.pianostudio.model.StudentBadge;
import com.pianostudio.model.StudentProfile;
import com.pianostudio.model.User;
import com.pianostudio.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final StudentBadgeRepository studentBadgeRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PracticeSessionRepository practiceSessionRepository;
    private final StudentAssignmentRepository studentAssignmentRepository;
    private final UserRepository userRepository;

    /**
     * Get all available badges.
     */
    public List<BadgeDTO> getAllBadges() {
        return badgeRepository.findAll().stream()
                .map(BadgeDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get badges earned by a student.
     */
    public List<StudentBadgeDTO> getStudentBadges(Long studentId) {
        return studentBadgeRepository.findByStudentIdOrderByEarnedAtDesc(studentId).stream()
                .map(StudentBadgeDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Check and award all eligible badges to a student.
     * Called after practice sessions end or assignments are completed.
     * Returns list of newly earned badges.
     */
    @Transactional
    public List<BadgeDTO> checkAndAwardBadges(Long studentId) {
        List<BadgeDTO> newlyEarned = new ArrayList<>();

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Get student stats
        StudentProfile profile = studentProfileRepository.findByUserId(studentId).orElse(null);
        long completedSessions = practiceSessionRepository.countCompletedByStudentId(studentId);
        long totalMinutes = practiceSessionRepository.sumMinutesByStudentId(studentId);
        long totalHours = totalMinutes / 60;
        long completedAssignments = studentAssignmentRepository.countByStudentIdAndCompletedTrue(studentId);
        int currentStreak = profile != null ? profile.getCurrentStreak() : 0;

        log.debug("Checking badges for student {}: sessions={}, hours={}, assignments={}, streak={}",
                studentId, completedSessions, totalHours, completedAssignments, currentStreak);

        // Check each badge criteria
        // sessions_1 - First Practice
        if (completedSessions >= 1) {
            BadgeDTO badge = tryAwardBadge(student, "sessions_1");
            if (badge != null) newlyEarned.add(badge);
        }

        // streak_7 - Week Warrior
        if (currentStreak >= 7) {
            BadgeDTO badge = tryAwardBadge(student, "streak_7");
            if (badge != null) newlyEarned.add(badge);
        }

        // streak_30 - Month Master
        if (currentStreak >= 30) {
            BadgeDTO badge = tryAwardBadge(student, "streak_30");
            if (badge != null) newlyEarned.add(badge);
        }

        // hours_100 - Century Club
        if (totalHours >= 100) {
            BadgeDTO badge = tryAwardBadge(student, "hours_100");
            if (badge != null) newlyEarned.add(badge);
        }

        // assignments_10 - Practice Perfectionist
        if (completedAssignments >= 10) {
            BadgeDTO badge = tryAwardBadge(student, "assignments_10");
            if (badge != null) newlyEarned.add(badge);
        }

        if (!newlyEarned.isEmpty()) {
            log.info("Student {} earned {} new badge(s): {}", studentId, newlyEarned.size(),
                    newlyEarned.stream().map(BadgeDTO::getName).collect(Collectors.joining(", ")));
        }

        return newlyEarned;
    }

    /**
     * Try to award a badge to a student. Returns the badge if newly earned, null if already earned.
     */
    private BadgeDTO tryAwardBadge(User student, String criteria) {
        // Find the badge by criteria
        Optional<Badge> badgeOpt = badgeRepository.findByCriteria(criteria);
        if (badgeOpt.isEmpty()) {
            log.warn("Badge with criteria '{}' not found", criteria);
            return null;
        }

        Badge badge = badgeOpt.get();

        // Check if already earned
        Optional<StudentBadge> existingOpt = studentBadgeRepository.findByStudentIdAndBadgeId(
                student.getId(), badge.getId());
        if (existingOpt.isPresent()) {
            return null; // Already earned
        }

        // Award the badge
        StudentBadge studentBadge = StudentBadge.builder()
                .student(student)
                .badge(badge)
                .build();
        studentBadgeRepository.save(studentBadge);

        log.info("Awarded badge '{}' to student {}", badge.getName(), student.getId());
        return BadgeDTO.fromEntity(badge);
    }

    /**
     * Check if a student has earned a specific badge.
     */
    public boolean hasEarnedBadge(Long studentId, Long badgeId) {
        return studentBadgeRepository.findByStudentIdAndBadgeId(studentId, badgeId).isPresent();
    }

    /**
     * Get count of badges earned by a student.
     */
    public int getBadgeCount(Long studentId) {
        return studentBadgeRepository.findByStudentIdOrderByEarnedAtDesc(studentId).size();
    }
}
