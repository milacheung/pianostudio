package com.pianostudio.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "consent_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_user_id", nullable = false)
    private User childUser;

    @Column(name = "parent_email", nullable = false)
    private String parentEmail;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(name = "token_expires_at", nullable = false)
    private LocalDateTime tokenExpiresAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ConsentRequestStatus status = ConsentRequestStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(tokenExpiresAt);
    }

    public boolean isValid() {
        return status == ConsentRequestStatus.PENDING && !isExpired();
    }
}
