package com.pianostudio.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "is_minor")
    @Builder.Default
    private Boolean isMinor = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_user_id")
    private User parentUser;

    @OneToMany(mappedBy = "parentUser")
    @Builder.Default
    private List<User> children = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status")
    @Builder.Default
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Studio> studiosAsTeacher = new ArrayList<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private StudentProfile studentProfile;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    @Builder.Default
    private List<PracticeSession> practiceSessions = new ArrayList<>();

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Post> posts = new ArrayList<>();

    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Message> sentMessages = new ArrayList<>();

    @OneToMany(mappedBy = "recipient", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Message> receivedMessages = new ArrayList<>();

    public enum UserRole {
        ADMIN,
        TEACHER,
        STUDENT,
        PARENT
    }
}
