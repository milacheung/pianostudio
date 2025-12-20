package com.pianostudio.service;

import com.pianostudio.dto.PracticeSessionDTO;
import com.pianostudio.dto.PracticeStatsDTO;
import com.pianostudio.exception.PracticeSessionAlreadyEndedException;
import com.pianostudio.exception.PracticeSessionNotFoundException;
import com.pianostudio.exception.StudentNotFoundException;
import com.pianostudio.exception.UnauthorizedAccessException;
import com.pianostudio.model.Assignment;
import com.pianostudio.model.PracticeSession;
import com.pianostudio.model.StudentProfile;
import com.pianostudio.model.User;
import com.pianostudio.repository.AssignmentRepository;
import com.pianostudio.repository.PracticeSessionRepository;
import com.pianostudio.repository.StudentProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PracticeService {

    private static final Logger logger = LoggerFactory.getLogger(PracticeService.class);
    private static final int POINTS_PER_INTERVAL = 10;
    private static final int MINUTES_PER_INTERVAL = 5;

    @Autowired
    private PracticeSessionRepository practiceSessionRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private BadgeService badgeService;

    /**
     * Start a new practice session
     */
    @Transactional
    public PracticeSession startSession(User user, Long assignmentId) {
        logger.info("Starting practice session for user: {}", user.getEmail());

        // Validate user has STUDENT role
        if (user.getRole() != User.UserRole.STUDENT) {
            throw new UnauthorizedAccessException("Only students can start practice sessions");
        }

        Assignment assignment = null;
        if (assignmentId != null) {
            assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + assignmentId));
        }

        PracticeSession session = PracticeSession.builder()
                .student(user)
                .startTime(LocalDateTime.now())
                .minutes(0)
                .pointsEarned(0)
                .assignment(assignment)
                .build();

        return practiceSessionRepository.save(session);
    }

    /**
     * End a practice session and calculate points
     */
    @Transactional
    public PracticeSession endSession(Long sessionId, User user, int minutes) {
        logger.info("Ending practice session: {} for user: {}", sessionId, user.getEmail());

        // Validate user has STUDENT role
        if (user.getRole() != User.UserRole.STUDENT) {
            throw new UnauthorizedAccessException("Only students can end practice sessions");
        }

        PracticeSession session = practiceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new PracticeSessionNotFoundException("Practice session not found with id: " + sessionId));

        // Verify session belongs to the user
        if (!session.getStudent().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("You do not have permission to end this practice session");
        }

        // Check if session already ended
        if (session.getEndTime() != null) {
            throw new PracticeSessionAlreadyEndedException("Practice session has already been ended");
        }

        // Calculate points
        int points = calculatePoints(minutes);

        // Update session
        session.setEndTime(LocalDateTime.now());
        session.setMinutes(minutes);
        session.setPointsEarned(points);

        practiceSessionRepository.save(session);

        // Update student profile
        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new StudentNotFoundException("Student profile not found for user: " + user.getId()));

        profile.setTotalPoints(profile.getTotalPoints() + points);
        updateStreak(profile);
        studentProfileRepository.save(profile);

        // Check and award any newly earned badges
        badgeService.checkAndAwardBadges(user.getId());

        logger.info("Practice session ended. Minutes: {}, Points earned: {}", minutes, points);

        return session;
    }

    /**
     * Calculate points based on minutes practiced
     * 10 points per 5 minutes
     */
    public int calculatePoints(int minutes) {
        return (minutes / MINUTES_PER_INTERVAL) * POINTS_PER_INTERVAL;
    }

    /**
     * Update practice streak for a student
     * Logic:
     * - If lastPracticeDate == yesterday: increment currentStreak
     * - If lastPracticeDate == today: no change (already practiced today)
     * - If lastPracticeDate < yesterday: reset currentStreak to 1 (streak broken)
     * - Update longestStreak if currentStreak > longestStreak
     * - Set lastPracticeDate to today
     */
    public void updateStreak(StudentProfile profile) {
        LocalDate today = LocalDate.now();
        LocalDate lastPractice = profile.getLastPracticeDate();

        if (lastPractice == null) {
            // First practice ever
            profile.setCurrentStreak(1);
            profile.setLongestStreak(1);
        } else if (lastPractice.equals(today)) {
            // Already practiced today, no change to streak
            logger.info("Student already practiced today. Streak unchanged.");
            return;
        } else if (lastPractice.equals(today.minusDays(1))) {
            // Practiced yesterday, increment streak
            profile.setCurrentStreak(profile.getCurrentStreak() + 1);
            logger.info("Streak continued! Current streak: {}", profile.getCurrentStreak());
        } else {
            // Streak broken, start new streak
            profile.setCurrentStreak(1);
            logger.info("Streak broken. Starting new streak.");
        }

        // Update longest streak if needed
        if (profile.getCurrentStreak() > profile.getLongestStreak()) {
            profile.setLongestStreak(profile.getCurrentStreak());
            logger.info("New longest streak: {}", profile.getLongestStreak());
        }

        // Update last practice date
        profile.setLastPracticeDate(today);
    }

    /**
     * Get practice sessions for a user within the last N days
     */
    public List<PracticeSession> getSessionsForUser(User user, int days) {
        LocalDateTime startDate = LocalDateTime.of(LocalDate.now().minusDays(days), LocalTime.MIN);
        LocalDateTime endDate = LocalDateTime.now();

        return practiceSessionRepository.findByStudentIdAndStartTimeBetween(user.getId(), startDate, endDate);
    }

    /**
     * Get practice statistics for a user
     */
    public PracticeStatsDTO getPracticeStats(User user) {
        logger.info("Getting practice stats for user: {}", user.getEmail());

        // Get student profile
        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new StudentNotFoundException("Student profile not found for user: " + user.getId()));

        // Get sessions for different time periods
        LocalDateTime startOfToday = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime startOfWeek = LocalDateTime.now().minusDays(7);
        LocalDateTime startOfMonth = LocalDateTime.now().minusDays(30);
        LocalDateTime now = LocalDateTime.now();

        List<PracticeSession> todaySessions = practiceSessionRepository
                .findByStudentIdAndStartTimeBetween(user.getId(), startOfToday, now);
        List<PracticeSession> weekSessions = practiceSessionRepository
                .findByStudentIdAndStartTimeBetween(user.getId(), startOfWeek, now);
        List<PracticeSession> monthSessions = practiceSessionRepository
                .findByStudentIdAndStartTimeBetween(user.getId(), startOfMonth, now);

        // Calculate total minutes for each period (only count completed sessions)
        int minutesToday = todaySessions.stream()
                .filter(s -> s.getEndTime() != null)
                .mapToInt(PracticeSession::getMinutes)
                .sum();

        int minutesWeek = weekSessions.stream()
                .filter(s -> s.getEndTime() != null)
                .mapToInt(PracticeSession::getMinutes)
                .sum();

        int minutesMonth = monthSessions.stream()
                .filter(s -> s.getEndTime() != null)
                .mapToInt(PracticeSession::getMinutes)
                .sum();

        return PracticeStatsDTO.builder()
                .totalMinutesToday(minutesToday)
                .totalMinutesWeek(minutesWeek)
                .totalMinutesMonth(minutesMonth)
                .currentStreak(profile.getCurrentStreak())
                .totalPoints(profile.getTotalPoints())
                .build();
    }

    /**
     * Get list of practice sessions for a user (last 30 days) as DTOs
     */
    public List<PracticeSessionDTO> getPracticeSessionsForUser(User user) {
        List<PracticeSession> sessions = getSessionsForUser(user, 30);

        return sessions.stream()
                .filter(s -> s.getEndTime() != null) // Only return completed sessions
                .map(PracticeSessionDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
