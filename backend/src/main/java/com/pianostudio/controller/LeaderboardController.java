package com.pianostudio.controller;

import com.pianostudio.dto.LeaderboardEntryDTO;
import com.pianostudio.dto.LeaderboardResponse;
import com.pianostudio.exception.UnauthorizedAccessException;
import com.pianostudio.model.Studio;
import com.pianostudio.model.StudentProfile;
import com.pianostudio.model.User;
import com.pianostudio.service.LeaderboardService;
import com.pianostudio.service.StudioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private static final Logger logger = LoggerFactory.getLogger(LeaderboardController.class);

    @Autowired
    private LeaderboardService leaderboardService;

    @Autowired
    private StudioService studioService;

    /**
     * Get leaderboard for the user's studio
     *
     * @param user   The authenticated user
     * @param sortBy The sorting criteria (points, streak, weekly)
     * @return Leaderboard with entries and user's rank if applicable
     */
    @GetMapping
    public ResponseEntity<LeaderboardResponse> getLeaderboard(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "points") String sortBy) {

        logger.info("User {} requesting leaderboard sorted by {}", user.getEmail(), sortBy);

        // Get the user's studio
        Studio studio = studioService.getStudioForUser(user);
        if (studio == null) {
            throw new UnauthorizedAccessException("User does not belong to a studio");
        }

        // Get leaderboard entries
        List<LeaderboardEntryDTO> entries = leaderboardService.getStudioLeaderboard(studio.getId(), sortBy);

        // Get total student count
        Integer totalStudents = entries.size();

        // Get current user's rank if they are a student
        Integer myRank = null;
        if (user.getRole() == User.UserRole.STUDENT && user.getStudentProfile() != null) {
            StudentProfile studentProfile = user.getStudentProfile();
            myRank = leaderboardService.getStudentRank(studentProfile.getId(), studio.getId());
        }

        LeaderboardResponse response = LeaderboardResponse.builder()
                .entries(entries)
                .totalStudents(totalStudents)
                .myRank(myRank)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Get the current user's rank in their studio
     *
     * @param user The authenticated user (must be a student)
     * @return The user's rank
     */
    @GetMapping("/my-rank")
    public ResponseEntity<Integer> getMyRank(@AuthenticationPrincipal User user) {
        logger.info("User {} requesting their rank", user.getEmail());

        if (user.getRole() != User.UserRole.STUDENT || user.getStudentProfile() == null) {
            throw new UnauthorizedAccessException("Only students can have a rank");
        }

        StudentProfile studentProfile = user.getStudentProfile();
        Studio studio = studentProfile.getStudio();

        Integer rank = leaderboardService.getStudentRank(studentProfile.getId(), studio.getId());

        return ResponseEntity.ok(rank);
    }
}
