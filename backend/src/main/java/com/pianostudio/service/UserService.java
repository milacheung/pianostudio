package com.pianostudio.service;

import com.pianostudio.dto.CompleteSignupRequest;
import com.pianostudio.exception.StudentNotFoundException;
import com.pianostudio.model.StudentProfile;
import com.pianostudio.model.Studio;
import com.pianostudio.model.User;
import com.pianostudio.repository.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private StudioService studioService;

    @Autowired
    private StudioRepository studioRepository;

    @Autowired
    private PracticeSessionRepository practiceSessionRepository;

    @Autowired
    private StudentAssignmentRepository studentAssignmentRepository;

    @Autowired
    private StudentBadgeRepository studentBadgeRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private AgeVerificationRepository ageVerificationRepository;

    @Autowired
    private ConsentRequestRepository consentRequestRepository;

    @Autowired
    private ParentalConsentRepository parentalConsentRepository;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Transactional
    public User updateUser(User user, CompleteSignupRequest request) {
        user.setFirstName(request.getFirstName());

        try {
            User.UserRole role = User.UserRole.valueOf(request.getRole().toUpperCase());
            user.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + request.getRole());
        }

        return userRepository.save(user);
    }

    /**
     * Complete teacher onboarding by creating a studio
     */
    @Transactional
    public Studio completeTeacherOnboarding(User user, @NotBlank @Size(min = 2, max = 50) String studioName) {
        // Validate studio name
        if (studioName == null || studioName.trim().isEmpty()) {
            throw new IllegalArgumentException("Studio name is required for teachers");
        }
        if (studioName.length() < 2 || studioName.length() > 50) {
            throw new IllegalArgumentException("Studio name must be between 2 and 50 characters");
        }

        // Set role to TEACHER
        user.setRole(User.UserRole.TEACHER);
        userRepository.save(user);

        // Create studio
        Studio studio = studioService.createStudio(studioName.trim(), user);
        logger.info("Teacher {} completed onboarding with studio: {}", user.getEmail(), studio.getName());

        return studio;
    }

    /**
     * Complete student onboarding by joining a studio via invite code
     */
    @Transactional
    public Studio completeStudentOnboarding(User user, @NotBlank @Size(min = 6, max = 6) String inviteCode) {
        // Validate invite code
        if (inviteCode == null || inviteCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Invite code is required for students");
        }
        if (inviteCode.length() != 6) {
            throw new IllegalArgumentException("Invite code must be exactly 6 characters");
        }

        // Set role to STUDENT
        user.setRole(User.UserRole.STUDENT);
        userRepository.save(user);

        // Join studio (this creates the StudentProfile)
        Studio studio = studioService.joinStudio(inviteCode.trim(), user);
        logger.info("Student {} completed onboarding by joining studio: {}", user.getEmail(), studio.getName());

        return studio;
    }

    /**
     * Complete parent onboarding by validating invite code
     * Returns the studio but doesn't create StudentProfile (that happens in linkParentToStudent)
     */
    @Transactional
    public Studio completeParentOnboarding(User user, @NotBlank @Size(min = 6, max = 6) String inviteCode) {
        // Validate invite code
        if (inviteCode == null || inviteCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Invite code is required for parents");
        }
        if (inviteCode.length() != 6) {
            throw new IllegalArgumentException("Invite code must be exactly 6 characters");
        }

        // Set role to PARENT
        user.setRole(User.UserRole.PARENT);
        userRepository.save(user);

        // Verify the studio exists and return it
        Studio studio = studioService.getStudioByInviteCode(inviteCode.trim());
        logger.info("Parent {} completed onboarding for studio: {}", user.getEmail(), studio.getName());

        return studio;
    }

    /**
     * Link a parent to a student's profile
     */
    @Transactional
    public void linkParentToStudent(User parent, Long studentId) {
        // Validate parent role
        if (parent.getRole() != User.UserRole.PARENT) {
            throw new IllegalArgumentException("User must be a parent to link to a student");
        }

        // Find student profile
        StudentProfile studentProfile = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with id: " + studentId));

        // Link parent to student
        studentProfile.setParent(parent);
        studentProfileRepository.save(studentProfile);

        logger.info("Parent {} linked to student {}", parent.getEmail(), studentProfile.getUser().getName());
    }

    public User getCurrentUser() {
        // This would be called from a controller with the authenticated user
        // Implementation depends on how you get the current user from SecurityContext
        throw new UnsupportedOperationException("Use SecurityContext to get current user");
    }

    /**
     * Delete a user account and all associated data (COPPA compliance)
     * Teachers with active students cannot delete their accounts
     */
    @Transactional
    public void deleteAccount(User user) {
        logger.info("Deleting account for user: {}", user.getEmail());
        Long userId = user.getId();

        // Check if user is a teacher with students
        if (user.getRole() == User.UserRole.TEACHER) {
            List<Studio> studios = studioRepository.findByTeacherId(userId);
            for (Studio studio : studios) {
                List<StudentProfile> students = studentProfileRepository.findByStudioIdOrderByTotalPointsDesc(studio.getId());
                if (!students.isEmpty()) {
                    throw new IllegalStateException(
                        "Cannot delete account: You have " + students.size() +
                        " student(s) in your studio. Please transfer or remove all students first.");
                }
            }
            // Delete empty studios
            studioRepository.deleteAll(studios);
        }

        // Delete reactions made by this user
        reactionRepository.deleteByUserId(userId);

        // Delete reactions on posts by this user (before deleting posts)
        reactionRepository.deleteByPostAuthorId(userId);

        // Delete posts by this user
        postRepository.deleteByAuthorId(userId);

        // Delete messages sent or received by this user
        messageRepository.deleteByUserId(userId);

        // Delete practice sessions
        practiceSessionRepository.deleteByStudentId(userId);

        // Delete student assignments
        studentAssignmentRepository.deleteByStudentId(userId);

        // Delete student badges
        studentBadgeRepository.deleteByStudentId(userId);

        // Delete student profile
        studentProfileRepository.deleteByUserId(userId);

        // Delete COPPA-related data
        ageVerificationRepository.deleteByUserId(userId);
        consentRequestRepository.deleteByChildUserId(userId);
        parentalConsentRepository.deleteByChildUserId(userId);

        // Unlink parent from any children
        List<StudentProfile> linkedChildren = studentProfileRepository.findByParentId(userId);
        for (StudentProfile child : linkedChildren) {
            child.setParent(null);
            studentProfileRepository.save(child);
        }

        // Finally delete the user
        userRepository.delete(user);
        logger.info("Account deleted successfully for user: {}", user.getEmail());
    }
}
