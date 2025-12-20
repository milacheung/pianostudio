package com.pianostudio.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "age_verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgeVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "age_at_signup")
    private Integer ageAtSignup;

    @Enumerated(EnumType.STRING)
    @Column(name = "age_range", nullable = false)
    private AgeRange ageRange;

    @Column(name = "is_minor", nullable = false)
    private Boolean isMinor;

    @Column(name = "requires_consent", nullable = false)
    private Boolean requiresConsent;

    @Column(name = "verification_method")
    @Builder.Default
    private String verificationMethod = "SELF_DECLARED";

    @Column(name = "verified_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime verifiedAt;

    @Column(name = "ip_address")
    private String ipAddress;
}
