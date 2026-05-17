package com.pianostudio.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Legacy field - nullable for new parent-created students
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studio_id", nullable = false)
    private Studio studio;

    // Parent who manages this student profile
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private User parent;

    // Student's name (for parent-created students without user accounts)
    @Column(name = "name")
    private String name;

    // Student's age
    @Column(name = "age")
    private Integer age;

    // Student's grade level (e.g., "1st", "2nd", "Kindergarten")
    @Column(name = "grade")
    private String grade;

    @Column(name = "total_points", nullable = false)
    @Builder.Default
    private Integer totalPoints = 0;

    @Column(name = "current_streak", nullable = false)
    @Builder.Default
    private Integer currentStreak = 0;

    @Column(name = "longest_streak", nullable = false)
    @Builder.Default
    private Integer longestStreak = 0;

    @Column(name = "last_practice_date")
    private LocalDate lastPracticeDate;

    // Parent invite fields (for teacher-initiated onboarding)
    @Column(name = "parent_email")
    private String parentEmail;

    @Column(name = "parent_invite_status")
    @Builder.Default
    private String parentInviteStatus = "none";  // none, invited, claimed

    @Column(name = "parent_invited_at")
    private LocalDateTime parentInvitedAt;

    // Exam tracking — used by the pre-lesson brief RAG feature
    @Column(name = "exam_board")
    private String examBoard;

    @Column(name = "exam_grade")
    private String examGrade;

    @Column(name = "exam_date")
    private LocalDate examDate;

    @Column(name = "exam_session_deadline")
    private LocalDate examSessionDeadline;

    /**
     * Get the display name for this student.
     * Returns the student's name if set, otherwise falls back to linked user's name.
     */
    public String getDisplayName() {
        if (name != null && !name.isBlank()) {
            return name;
        }
        if (user != null) {
            return user.getName();
        }
        return "Unknown Student";
    }
}
