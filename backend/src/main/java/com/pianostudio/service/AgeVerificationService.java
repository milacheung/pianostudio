package com.pianostudio.service;

import com.pianostudio.dto.*;
import com.pianostudio.model.*;
import com.pianostudio.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AgeVerificationService {

    private static final Logger logger = LoggerFactory.getLogger(AgeVerificationService.class);

    @Value("${app.consent.token-expiry-hours:48}")
    private int tokenExpiryHours;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AgeVerificationRepository ageVerificationRepository;

    @Autowired
    private ConsentRequestRepository consentRequestRepository;

    @Autowired
    private ParentalConsentRepository parentalConsentRepository;

    /**
     * Verify a user's age and determine their age range
     */
    @Transactional
    public AgeVerification verifyAge(User user, LocalDate birthDate, String ipAddress) {
        logger.info("Verifying age for user: {}", user.getEmail());

        // Calculate age
        int age = Period.between(birthDate, LocalDate.now()).getYears();
        AgeRange ageRange = determineAgeRange(age);
        boolean isMinor = age < 18;
        boolean requiresConsent = age < 16; // COPPA requires consent for under 13, but we extend to under 16

        // Update user
        user.setBirthDate(birthDate);
        user.setIsMinor(isMinor);

        // Set account status based on age
        if (requiresConsent) {
            user.setAccountStatus(AccountStatus.PENDING_CONSENT);
        } else {
            user.setAccountStatus(AccountStatus.ACTIVE);
        }
        userRepository.save(user);

        // Create or update age verification record
        AgeVerification verification = ageVerificationRepository.findByUser(user)
                .orElse(AgeVerification.builder()
                        .user(user)
                        .build());

        verification.setBirthDate(birthDate);
        verification.setAgeAtSignup(age);
        verification.setAgeRange(ageRange);
        verification.setIsMinor(isMinor);
        verification.setRequiresConsent(requiresConsent);
        verification.setVerificationMethod("SELF_DECLARED");
        verification.setIpAddress(ipAddress);

        AgeVerification saved = ageVerificationRepository.save(verification);
        logger.info("Age verification completed for user: {}, age range: {}, requires consent: {}",
                user.getEmail(), ageRange, requiresConsent);

        return saved;
    }

    /**
     * Get age verification for a user
     */
    public Optional<AgeVerification> getAgeVerification(User user) {
        return ageVerificationRepository.findByUser(user);
    }

    /**
     * Request parental consent for a minor
     */
    @Transactional
    public ConsentRequest requestParentalConsent(User childUser, String parentEmail) {
        logger.info("Requesting parental consent for user: {} from parent: {}",
                childUser.getEmail(), parentEmail);

        // Check if there's already a pending request for this parent
        Optional<ConsentRequest> existingRequest = consentRequestRepository
                .findByChildUserAndStatusAndParentEmail(childUser, ConsentRequestStatus.PENDING, parentEmail);

        if (existingRequest.isPresent() && !existingRequest.get().isExpired()) {
            logger.info("Returning existing pending consent request");
            return existingRequest.get();
        }

        // Generate unique token
        String token = UUID.randomUUID().toString().replace("-", "");

        // Create consent request
        ConsentRequest request = ConsentRequest.builder()
                .childUser(childUser)
                .parentEmail(parentEmail)
                .token(token)
                .tokenExpiresAt(LocalDateTime.now().plusHours(tokenExpiryHours))
                .status(ConsentRequestStatus.PENDING)
                .build();

        ConsentRequest saved = consentRequestRepository.save(request);
        logger.info("Created consent request with token for parent: {}", parentEmail);

        // TODO: Send email to parent with consent link
        // emailService.sendConsentRequestEmail(parentEmail, childUser.getFirstName(), token);

        return saved;
    }

    /**
     * Get consent request by token (for public consent form)
     */
    public Optional<ConsentRequest> getConsentRequestByToken(String token) {
        return consentRequestRepository.findByToken(token);
    }

    /**
     * Get consent form data for public display
     */
    public ConsentFormDataResponse getConsentFormData(String token) {
        Optional<ConsentRequest> requestOpt = consentRequestRepository.findByToken(token);

        if (requestOpt.isEmpty()) {
            return ConsentFormDataResponse.builder()
                    .valid(false)
                    .message("Invalid consent request")
                    .build();
        }

        ConsentRequest request = requestOpt.get();

        if (request.isExpired()) {
            return ConsentFormDataResponse.builder()
                    .valid(false)
                    .expired(true)
                    .message("This consent request has expired")
                    .build();
        }

        if (request.getStatus() != ConsentRequestStatus.PENDING) {
            return ConsentFormDataResponse.builder()
                    .valid(false)
                    .message("This consent request has already been " + request.getStatus().name().toLowerCase())
                    .build();
        }

        return ConsentFormDataResponse.builder()
                .childFirstName(request.getChildUser().getFirstName())
                .parentEmail(request.getParentEmail())
                .valid(true)
                .expired(false)
                .build();
    }

    /**
     * Process parent's consent decision
     */
    @Transactional
    public ConsentRequest processConsentDecision(String token, boolean approved, String parentSignature, String ipAddress) {
        logger.info("Processing consent decision for token, approved: {}", approved);

        ConsentRequest request = consentRequestRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid consent token"));

        if (request.isExpired()) {
            request.setStatus(ConsentRequestStatus.EXPIRED);
            consentRequestRepository.save(request);
            throw new IllegalArgumentException("Consent request has expired");
        }

        if (request.getStatus() != ConsentRequestStatus.PENDING) {
            throw new IllegalArgumentException("Consent request has already been processed");
        }

        User childUser = request.getChildUser();

        if (approved) {
            // Create parental consent record
            ParentalConsent consent = ParentalConsent.builder()
                    .childUser(childUser)
                    .parentEmail(request.getParentEmail())
                    .consentType(ConsentType.ACCOUNT_CREATION)
                    .consentGiven(true)
                    .consentDate(LocalDateTime.now())
                    .consentIp(ipAddress)
                    .consentMethod("ELECTRONIC")
                    .parentSignature(parentSignature)
                    .build();
            parentalConsentRepository.save(consent);

            // Update child user status
            childUser.setAccountStatus(AccountStatus.ACTIVE);
            userRepository.save(childUser);

            request.setStatus(ConsentRequestStatus.APPROVED);
            logger.info("Consent approved for user: {}", childUser.getEmail());
        } else {
            request.setStatus(ConsentRequestStatus.REJECTED);
            childUser.setAccountStatus(AccountStatus.SUSPENDED);
            userRepository.save(childUser);
            logger.info("Consent rejected for user: {}", childUser.getEmail());
        }

        request.setRespondedAt(LocalDateTime.now());
        return consentRequestRepository.save(request);
    }

    /**
     * Get consent status for a user
     */
    public ConsentStatusResponse getConsentStatus(User user) {
        // Check if user requires consent
        Optional<AgeVerification> verificationOpt = ageVerificationRepository.findByUser(user);

        if (verificationOpt.isEmpty() || !verificationOpt.get().getRequiresConsent()) {
            return ConsentStatusResponse.builder()
                    .accountStatus(user.getAccountStatus())
                    .hasActiveConsent(true)
                    .message("User does not require parental consent")
                    .build();
        }

        // Check for pending consent requests
        List<ConsentRequest> requests = consentRequestRepository.findByChildUser(user);
        ConsentRequest latestRequest = requests.stream()
                .filter(r -> r.getStatus() == ConsentRequestStatus.PENDING ||
                            r.getStatus() == ConsentRequestStatus.APPROVED)
                .findFirst()
                .orElse(null);

        // Check for active consent
        boolean hasActiveConsent = parentalConsentRepository
                .existsByChildUserAndConsentTypeAndConsentGivenTrueAndRevokedDateIsNull(
                        user, ConsentType.ACCOUNT_CREATION);

        return ConsentStatusResponse.builder()
                .accountStatus(user.getAccountStatus())
                .consentRequestStatus(latestRequest != null ? latestRequest.getStatus() : null)
                .hasActiveConsent(hasActiveConsent)
                .parentEmail(latestRequest != null ? latestRequest.getParentEmail() : null)
                .message(hasActiveConsent ? "Active parental consent on file" :
                        latestRequest != null ? "Consent request pending" : "No consent request found")
                .build();
    }

    /**
     * Get all consent requests for a user
     */
    public List<ConsentRequest> getConsentRequests(User user) {
        return consentRequestRepository.findByChildUser(user);
    }

    /**
     * Determine age range from age
     */
    private AgeRange determineAgeRange(int age) {
        if (age < 13) {
            return AgeRange.UNDER_13;
        } else if (age <= 15) {
            return AgeRange.AGE_13_TO_15;
        } else {
            return AgeRange.AGE_16_PLUS;
        }
    }

    /**
     * Check if a user can access the app (has consent if required)
     */
    public boolean canAccessApp(User user) {
        if (user.getAccountStatus() == AccountStatus.ACTIVE) {
            return true;
        }

        if (user.getAccountStatus() == AccountStatus.PENDING_CONSENT) {
            // Check if consent has been granted since last check
            boolean hasActiveConsent = parentalConsentRepository
                    .existsByChildUserAndConsentTypeAndConsentGivenTrueAndRevokedDateIsNull(
                            user, ConsentType.ACCOUNT_CREATION);
            if (hasActiveConsent) {
                user.setAccountStatus(AccountStatus.ACTIVE);
                userRepository.save(user);
                return true;
            }
        }

        return false;
    }
}
