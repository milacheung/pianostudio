package com.pianostudio.controller;

import com.pianostudio.dto.*;
import com.pianostudio.model.AgeVerification;
import com.pianostudio.model.ConsentRequest;
import com.pianostudio.model.User;
import com.pianostudio.service.AgeVerificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class AgeVerificationController {

    private static final Logger logger = LoggerFactory.getLogger(AgeVerificationController.class);

    @Autowired
    private AgeVerificationService ageVerificationService;

    /**
     * Verify a user's age based on their birth date
     * POST /api/age-verification/verify
     */
    @PostMapping("/age-verification/verify")
    public ResponseEntity<AgeVerificationResponse> verifyAge(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AgeVerificationRequest request,
            HttpServletRequest httpRequest) {

        logger.info("Verifying age for user: {}", user.getEmail());

        String ipAddress = getClientIpAddress(httpRequest);
        AgeVerification verification = ageVerificationService.verifyAge(
                user, request.getBirthDate(), ipAddress);

        return ResponseEntity.ok(AgeVerificationResponse.fromEntity(verification));
    }

    /**
     * Get current age verification status
     * GET /api/age-verification/status
     */
    @GetMapping("/age-verification/status")
    public ResponseEntity<AgeVerificationResponse> getVerificationStatus(
            @AuthenticationPrincipal User user) {

        return ageVerificationService.getAgeVerification(user)
                .map(v -> ResponseEntity.ok(AgeVerificationResponse.fromEntity(v)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Request parental consent
     * POST /api/consent/request
     */
    @PostMapping("/consent/request")
    public ResponseEntity<ConsentRequestResponse> requestConsent(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ParentEmailRequest request) {

        logger.info("Requesting parental consent for user: {}", user.getEmail());

        ConsentRequest consentRequest = ageVerificationService.requestParentalConsent(
                user, request.getParentEmail());

        return ResponseEntity.ok(ConsentRequestResponse.fromEntity(consentRequest));
    }

    /**
     * Get consent status for current user
     * GET /api/consent/status
     */
    @GetMapping("/consent/status")
    public ResponseEntity<ConsentStatusResponse> getConsentStatus(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(ageVerificationService.getConsentStatus(user));
    }

    /**
     * Get all consent requests for current user
     * GET /api/consent/requests
     */
    @GetMapping("/consent/requests")
    public ResponseEntity<List<ConsentRequestResponse>> getConsentRequests(
            @AuthenticationPrincipal User user) {

        List<ConsentRequest> requests = ageVerificationService.getConsentRequests(user);
        List<ConsentRequestResponse> responses = requests.stream()
                .map(ConsentRequestResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    /**
     * PUBLIC: Get consent form data by token
     * GET /api/public/consent/form/{token}
     */
    @GetMapping("/public/consent/form/{token}")
    public ResponseEntity<ConsentFormDataResponse> getConsentForm(@PathVariable String token) {
        logger.info("Getting consent form for token");
        return ResponseEntity.ok(ageVerificationService.getConsentFormData(token));
    }

    /**
     * PUBLIC: Process parent's consent decision
     * POST /api/public/consent/respond
     */
    @PostMapping("/public/consent/respond")
    public ResponseEntity<ConsentRequestResponse> respondToConsent(
            @Valid @RequestBody ConsentDecisionRequest request,
            HttpServletRequest httpRequest) {

        logger.info("Processing consent response, approved: {}", request.getApproved());

        String ipAddress = getClientIpAddress(httpRequest);
        ConsentRequest consentRequest = ageVerificationService.processConsentDecision(
                request.getToken(),
                request.getApproved(),
                request.getParentSignature(),
                ipAddress);

        return ResponseEntity.ok(ConsentRequestResponse.fromEntity(consentRequest));
    }

    /**
     * Check if user can access the app
     * GET /api/consent/can-access
     */
    @GetMapping("/consent/can-access")
    public ResponseEntity<Boolean> canAccessApp(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ageVerificationService.canAccessApp(user));
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
