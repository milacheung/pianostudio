package com.pianostudio.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "parental_consents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParentalConsent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_user_id", nullable = false)
    private User childUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_user_id")
    private User parentUser;

    @Column(name = "parent_email", nullable = false)
    private String parentEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "consent_type", nullable = false)
    private ConsentType consentType;

    @Column(name = "consent_given", nullable = false)
    @Builder.Default
    private Boolean consentGiven = false;

    @Column(name = "consent_date")
    private LocalDateTime consentDate;

    @Column(name = "consent_ip")
    private String consentIp;

    @Column(name = "consent_method")
    @Builder.Default
    private String consentMethod = "ELECTRONIC";

    @Column(name = "parent_signature")
    private String parentSignature;

    @Column(name = "revoked_date")
    private LocalDateTime revokedDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public boolean isActive() {
        return consentGiven && revokedDate == null;
    }
}
