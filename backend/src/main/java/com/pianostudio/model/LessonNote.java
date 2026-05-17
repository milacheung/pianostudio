package com.pianostudio.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "piece_id")
    private StudentPiece piece;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Column(name = "lesson_date", nullable = false)
    private LocalDate lessonDate;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "observation_tags", columnDefinition = "text[]")
    private String[] observationTags;

    @Column(name = "teacher_notes", columnDefinition = "TEXT")
    private String teacherNotes;

    @Column(name = "technical_score")
    private Short technicalScore;

    @Column(name = "musical_score")
    private Short musicalScore;

    @Column(name = "rhythm_score")
    private Short rhythmScore;

    @Column(name = "memory_score")
    private Short memoryScore;

    // 1=resistance, 2=neutral, 3=positive
    @Column(name = "student_engagement")
    private Short studentEngagement;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
