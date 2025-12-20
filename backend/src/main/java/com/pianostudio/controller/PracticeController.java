package com.pianostudio.controller;

import com.pianostudio.dto.EndPracticeRequest;
import com.pianostudio.dto.PracticeSessionDTO;
import com.pianostudio.dto.PracticeStatsDTO;
import com.pianostudio.dto.StartPracticeRequest;
import com.pianostudio.model.PracticeSession;
import com.pianostudio.model.User;
import com.pianostudio.service.PracticeService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/practice")
public class PracticeController {

    private static final Logger logger = LoggerFactory.getLogger(PracticeController.class);

    @Autowired
    private PracticeService practiceService;

    /**
     * Start a new practice session
     * POST /api/practice/start
     * Request body: { assignmentId?: Long }
     */
    @PostMapping("/start")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PracticeSessionDTO> startPracticeSession(
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) StartPracticeRequest request) {

        Long assignmentId = (request != null) ? request.getAssignmentId() : null;

        logger.info("Starting practice session for user: {}, assignmentId: {}", user.getEmail(), assignmentId);

        PracticeSession session = practiceService.startSession(user, assignmentId);
        PracticeSessionDTO dto = PracticeSessionDTO.fromEntity(session);

        logger.info("Practice session started with id: {}", session.getId());

        return ResponseEntity.ok(dto);
    }

    /**
     * End a practice session
     * POST /api/practice/{sessionId}/end
     * Request body: { minutes: Integer }
     */
    @PostMapping("/{sessionId}/end")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PracticeSessionDTO> endPracticeSession(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody EndPracticeRequest request) {

        logger.info("Ending practice session: {} for user: {}, minutes: {}",
                sessionId, user.getEmail(), request.getMinutes());

        PracticeSession session = practiceService.endSession(sessionId, user, request.getMinutes());
        PracticeSessionDTO dto = PracticeSessionDTO.fromEntity(session);

        logger.info("Practice session ended. Points earned: {}", session.getPointsEarned());

        return ResponseEntity.ok(dto);
    }

    /**
     * Get user's practice sessions (last 30 days)
     * GET /api/practice/me
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<PracticeSessionDTO>> getMyPracticeSessions(
            @AuthenticationPrincipal User user) {

        logger.info("Getting practice sessions for user: {}", user.getEmail());

        List<PracticeSessionDTO> sessions = practiceService.getPracticeSessionsForUser(user);

        return ResponseEntity.ok(sessions);
    }

    /**
     * Get practice statistics for the current user
     * GET /api/practice/me/stats
     * Returns: { totalMinutesToday, totalMinutesWeek, totalMinutesMonth, currentStreak, totalPoints }
     */
    @GetMapping("/me/stats")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PracticeStatsDTO> getMyPracticeStats(
            @AuthenticationPrincipal User user) {

        logger.info("Getting practice stats for user: {}", user.getEmail());

        PracticeStatsDTO stats = practiceService.getPracticeStats(user);

        return ResponseEntity.ok(stats);
    }
}
