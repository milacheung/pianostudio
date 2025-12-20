package com.pianostudio.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studio_id", nullable = false)
    private Studio studio;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "goal_minutes", nullable = false)
    private Integer goalMinutes;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> attachments;

    @Column(name = "points_value", nullable = false)
    @Builder.Default
    private Integer pointsValue = 25;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL)
    @Builder.Default
    private List<StudentAssignment> studentAssignments = new ArrayList<>();

    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL)
    @Builder.Default
    private List<PracticeSession> practiceSessions = new ArrayList<>();
}
