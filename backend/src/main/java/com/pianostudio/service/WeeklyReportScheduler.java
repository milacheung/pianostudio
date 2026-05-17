package com.pianostudio.service;

import com.pianostudio.model.EmailPreference;
import com.pianostudio.model.PracticeSession;
import com.pianostudio.model.StudentBadge;
import com.pianostudio.model.StudentProfile;
import com.pianostudio.repository.EmailPreferenceRepository;
import com.pianostudio.repository.PracticeSessionRepository;
import com.pianostudio.repository.StudentBadgeRepository;
import com.pianostudio.repository.StudentProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WeeklyReportScheduler {

    private static final Logger logger = LoggerFactory.getLogger(WeeklyReportScheduler.class);

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private PracticeSessionRepository practiceSessionRepository;

    @Autowired
    private StudentBadgeRepository studentBadgeRepository;

    @Autowired
    private EmailPreferenceRepository emailPreferenceRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private MagicLinkService magicLinkService;

    /**
     * Send weekly reports every Sunday at 6 PM
     * Cron: second minute hour day-of-month month day-of-week
     */
    @Scheduled(cron = "0 0 18 * * SUN")
    public void sendWeeklyReports() {
        logger.info("Starting weekly report generation");

        LocalDateTime weekStart = LocalDateTime.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .withHour(0).withMinute(0).withSecond(0);
        LocalDateTime weekEnd = LocalDateTime.now();

        // Get all students with parent emails who want weekly reports
        List<StudentProfile> students = studentProfileRepository.findAll().stream()
                .filter(s -> s.getParentEmail() != null && !s.getParentEmail().isBlank())
                .filter(s -> shouldSendReport(s.getParentEmail()))
                .collect(Collectors.toList());

        logger.info("Sending weekly reports for {} students", students.size());

        for (StudentProfile student : students) {
            try {
                sendReportForStudent(student, weekStart, weekEnd);
            } catch (Exception e) {
                logger.error("Failed to send weekly report for student {}: {}",
                        student.getId(), e.getMessage());
            }
        }

        logger.info("Weekly report generation completed");
    }

    private boolean shouldSendReport(String email) {
        return emailPreferenceRepository.findByEmail(email)
                .map(EmailPreference::getWeeklyReport)
                .orElse(true);  // Default to sending if no preference set
    }

    private void sendReportForStudent(StudentProfile student, LocalDateTime weekStart, LocalDateTime weekEnd) {
        String parentEmail = student.getParentEmail();

        // Get practice sessions for the week
        List<PracticeSession> sessions = practiceSessionRepository
                .findByStudentIdAndStartTimeBetween(student.getId(), weekStart, weekEnd);

        int weeklyMinutes = sessions.stream()
                .mapToInt(PracticeSession::getMinutes)
                .sum();

        int sessionCount = sessions.size();

        int pointsEarned = sessions.stream()
                .mapToInt(PracticeSession::getPointsEarned)
                .sum();

        // Get badges earned this week
        List<String> newBadges = studentBadgeRepository.findByStudentIdOrderByEarnedAtDesc(student.getId()).stream()
                .filter(sb -> {
                    LocalDateTime earnedAt = sb.getEarnedAt();
                    return earnedAt != null && earnedAt.isAfter(weekStart) && earnedAt.isBefore(weekEnd);
                })
                .map(sb -> sb.getBadge().getName())
                .collect(Collectors.toList());

        // Build report data
        EmailService.WeeklyReportData reportData = new EmailService.WeeklyReportData(
                parentEmail,
                weeklyMinutes,
                sessionCount,
                student.getCurrentStreak(),
                pointsEarned,
                newBadges
        );

        // Send the email
        emailService.sendWeeklyReport(parentEmail, student.getDisplayName(), reportData);

        logger.info("Sent weekly report for student {} to {}", student.getId(), parentEmail);
    }

    /**
     * Clean up expired magic links - runs daily at 3 AM
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupExpiredMagicLinks() {
        logger.info("Cleaning up expired magic links");
        magicLinkService.cleanupExpiredLinks();
    }
}
