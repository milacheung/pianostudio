package com.pianostudio.service;

import com.pianostudio.model.MagicLink;
import com.pianostudio.model.StudentProfile;
import com.pianostudio.model.User;
import com.pianostudio.repository.MagicLinkRepository;
import com.pianostudio.repository.StudentProfileRepository;
import com.pianostudio.repository.UserRepository;
import com.pianostudio.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
public class MagicLinkService {

    private static final Logger logger = LoggerFactory.getLogger(MagicLinkService.class);
    private static final int TOKEN_LENGTH = 32;
    private static final int EXPIRY_DAYS = 30;

    @Autowired
    private MagicLinkRepository magicLinkRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private EmailService emailService;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    /**
     * Generate a magic link for a parent to access their child's profile
     */
    @Transactional
    public MagicLink createMagicLink(String email, Long studentId) {
        logger.info("Creating magic link for email {} and student {}", email, studentId);

        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        // Check if there's an existing user with this email
        Optional<User> existingUser = userRepository.findByEmail(email);

        String token = generateSecureToken();

        MagicLink magicLink = MagicLink.builder()
                .token(token)
                .email(email)
                .user(existingUser.orElse(null))
                .student(student)
                .expiresAt(LocalDateTime.now().plusDays(EXPIRY_DAYS))
                .build();

        magicLink = magicLinkRepository.save(magicLink);

        logger.info("Created magic link {} for email {}", magicLink.getId(), email);

        return magicLink;
    }

    /**
     * Generate and send magic link via email
     */
    @Transactional
    public MagicLink sendMagicLink(String email, Long studentId) {
        MagicLink magicLink = createMagicLink(email, studentId);

        StudentProfile student = magicLink.getStudent();
        String magicLinkUrl = baseUrl + "/magic-login/" + magicLink.getToken();

        emailService.sendParentInvite(
                email,
                student.getDisplayName(),
                magicLinkUrl
        );

        // Update student's invite status
        student.setParentInviteStatus("invited");
        student.setParentInvitedAt(LocalDateTime.now());
        studentProfileRepository.save(student);

        return magicLink;
    }

    /**
     * Validate a magic link token and return JWT if valid
     */
    @Transactional
    public MagicLinkResult validateAndLogin(String token) {
        logger.info("Validating magic link token");

        MagicLink magicLink = magicLinkRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid magic link"));

        if (!magicLink.isValid()) {
            if (magicLink.isExpired()) {
                throw new IllegalArgumentException("Magic link has expired");
            }
            if (magicLink.isUsed()) {
                throw new IllegalArgumentException("Magic link has already been used");
            }
        }

        // Mark as used
        magicLink.setUsedAt(LocalDateTime.now());
        magicLinkRepository.save(magicLink);

        User user = magicLink.getUser();
        boolean isNewUser = false;

        // If no user exists, create a basic parent account
        if (user == null) {
            user = createParentAccount(magicLink.getEmail(), magicLink.getStudent());
            isNewUser = true;
        }

        // Link parent to student if not already linked
        StudentProfile student = magicLink.getStudent();
        if (student.getParent() == null) {
            student.setParent(user);
            student.setParentInviteStatus("claimed");
            studentProfileRepository.save(student);
        }

        // Generate JWT
        String jwt = jwtTokenProvider.generateTokenFromEmail(user.getEmail());

        logger.info("Magic link validated for user {}", user.getEmail());

        return new MagicLinkResult(user, jwt, isNewUser, student);
    }

    /**
     * Create a parent account from magic link
     */
    private User createParentAccount(String email, StudentProfile student) {
        logger.info("Creating parent account from magic link for {}", email);

        User parent = User.builder()
                .email(email)
                .name(email.split("@")[0])  // Use email prefix as name
                .role(User.UserRole.PARENT)
                .build();

        parent = userRepository.save(parent);

        logger.info("Created parent account {} from magic link", parent.getId());

        return parent;
    }

    /**
     * Generate a secure random token
     */
    private String generateSecureToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[TOKEN_LENGTH];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Check if a magic link token is valid without consuming it
     */
    public MagicLinkCheckResult checkToken(String token) {
        Optional<MagicLink> optionalLink = magicLinkRepository.findByToken(token);

        if (optionalLink.isEmpty()) {
            return new MagicLinkCheckResult(false, null, null, false, false, "Invalid magic link");
        }

        MagicLink magicLink = optionalLink.get();

        if (magicLink.isExpired()) {
            return new MagicLinkCheckResult(false, magicLink.getEmail(), null, true, false, "Magic link has expired");
        }

        if (magicLink.isUsed()) {
            return new MagicLinkCheckResult(false, magicLink.getEmail(), null, false, true, "Magic link has already been used");
        }

        String studentName = magicLink.getStudent() != null ? magicLink.getStudent().getDisplayName() : null;

        return new MagicLinkCheckResult(true, magicLink.getEmail(), studentName, false, false, "Valid");
    }

    /**
     * Clean up expired magic links (called by scheduler)
     */
    @Transactional
    public void cleanupExpiredLinks() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        magicLinkRepository.deleteByExpiresAtBefore(cutoff);
        logger.info("Cleaned up expired magic links older than {}", cutoff);
    }

    /**
     * Result of magic link check (without consuming)
     */
    public record MagicLinkCheckResult(
            boolean valid,
            String email,
            String studentName,
            boolean expired,
            boolean used,
            String message
    ) {}

    /**
     * Result of magic link validation
     */
    public record MagicLinkResult(
            User user,
            String jwt,
            boolean isNewUser,
            StudentProfile student
    ) {}
}
