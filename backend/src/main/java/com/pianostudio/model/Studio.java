package com.pianostudio.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "studios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Studio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "invite_code", nullable = false, unique = true, length = 6)
    private String inviteCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "studio", cascade = CascadeType.ALL)
    @Builder.Default
    private List<StudentProfile> students = new ArrayList<>();

    @OneToMany(mappedBy = "studio", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Assignment> assignments = new ArrayList<>();

    @OneToMany(mappedBy = "studio", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Post> posts = new ArrayList<>();

    @OneToMany(mappedBy = "studio", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Challenge> challenges = new ArrayList<>();
}
