package com.pianostudio.service;

import com.pianostudio.dto.LeaderboardEntryDTO;
import com.pianostudio.exception.StudentNotFoundException;
import com.pianostudio.model.StudentProfile;
import com.pianostudio.repository.StudentProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class LeaderboardService {

    private static final Logger logger = LoggerFactory.getLogger(LeaderboardService.class);

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    /**
     * Get leaderboard for a studio sorted by the specified criteria
     *
     * @param studioId The studio ID
     * @param sortBy   Sorting criteria: "points", "streak", or "weekly"
     * @return List of leaderboard entries with rankings
     */
    public List<LeaderboardEntryDTO> getStudioLeaderboard(Long studioId, String sortBy) {
        logger.info("Getting leaderboard for studio {} sorted by {}", studioId, sortBy);

        List<LeaderboardEntryDTO> entries = new ArrayList<>();

        switch (sortBy.toLowerCase()) {
            case "streak":
                entries = getLeaderboardByStreak(studioId);
                break;
            case "weekly":
                entries = getLeaderboardByWeeklyMinutes(studioId);
                break;
            case "points":
            default:
                entries = getLeaderboardByPoints(studioId);
                break;
        }

        // Add rankings
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
        }

        return entries;
    }

    /**
     * Get student's rank in their studio
     *
     * @param studentId The student profile ID
     * @param studioId  The studio ID
     * @return The student's rank (1-based)
     */
    public Integer getStudentRank(Long studentId, Long studioId) {
        logger.info("Getting rank for student {} in studio {}", studentId, studioId);

        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with id: " + studentId));

        // Get all students ordered by points (default ranking)
        List<StudentProfile> rankedStudents = studentProfileRepository.findByStudioIdOrderedByPoints(studioId);

        for (int i = 0; i < rankedStudents.size(); i++) {
            if (rankedStudents.get(i).getId().equals(studentId)) {
                return i + 1;
            }
        }

        return null;
    }

    /**
     * Get leaderboard sorted by total points
     */
    private List<LeaderboardEntryDTO> getLeaderboardByPoints(Long studioId) {
        List<StudentProfile> students = studentProfileRepository.findByStudioIdOrderedByPoints(studioId);
        List<LeaderboardEntryDTO> entries = new ArrayList<>();

        for (StudentProfile student : students) {
            entries.add(LeaderboardEntryDTO.builder()
                    .studentId(student.getId())
                    .studentName(student.getUser().getName())
                    .avatarUrl(student.getUser().getAvatarUrl())
                    .totalPoints(student.getTotalPoints())
                    .currentStreak(student.getCurrentStreak())
                    .weeklyMinutes(0) // Not calculated for this sort
                    .build());
        }

        return entries;
    }

    /**
     * Get leaderboard sorted by current streak
     */
    private List<LeaderboardEntryDTO> getLeaderboardByStreak(Long studioId) {
        List<StudentProfile> students = studentProfileRepository.findByStudioIdOrderedByStreak(studioId);
        List<LeaderboardEntryDTO> entries = new ArrayList<>();

        for (StudentProfile student : students) {
            entries.add(LeaderboardEntryDTO.builder()
                    .studentId(student.getId())
                    .studentName(student.getUser().getName())
                    .avatarUrl(student.getUser().getAvatarUrl())
                    .totalPoints(student.getTotalPoints())
                    .currentStreak(student.getCurrentStreak())
                    .weeklyMinutes(0) // Not calculated for this sort
                    .build());
        }

        return entries;
    }

    /**
     * Get leaderboard sorted by weekly practice minutes
     */
    private List<LeaderboardEntryDTO> getLeaderboardByWeeklyMinutes(Long studioId) {
        LocalDateTime weekStart = LocalDateTime.now().minusDays(7);
        List<Object[]> results = studentProfileRepository.findByStudioIdWithWeeklyMinutes(studioId, weekStart);
        List<LeaderboardEntryDTO> entries = new ArrayList<>();

        for (Object[] row : results) {
            Long studentId = ((BigInteger) row[0]).longValue();
            String studentName = (String) row[1];
            String avatarUrl = (String) row[2];
            Integer totalPoints = (Integer) row[3];
            Integer currentStreak = (Integer) row[4];
            Long weeklyMinutesLong = (Long) row[5];
            Integer weeklyMinutes = weeklyMinutesLong != null ? weeklyMinutesLong.intValue() : 0;

            entries.add(LeaderboardEntryDTO.builder()
                    .studentId(studentId)
                    .studentName(studentName)
                    .avatarUrl(avatarUrl)
                    .totalPoints(totalPoints)
                    .currentStreak(currentStreak)
                    .weeklyMinutes(weeklyMinutes)
                    .build());
        }

        return entries;
    }
}
