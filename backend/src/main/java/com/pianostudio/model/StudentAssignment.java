package com.pianostudio.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @Column(nullable = false)
    @Builder.Default
    private Boolean completed = false;

    @Column(name = "progress_minutes", nullable = false)
    @Builder.Default
    private Integer progressMinutes = 0;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
