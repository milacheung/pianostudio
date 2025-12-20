package com.pianostudio.service;

import com.pianostudio.exception.AlreadyMemberException;
import com.pianostudio.exception.InvalidInviteCodeException;
import com.pianostudio.exception.StudioNotFoundException;
import com.pianostudio.model.Studio;
import com.pianostudio.model.StudentProfile;
import com.pianostudio.model.User;
import com.pianostudio.repository.StudioRepository;
import com.pianostudio.repository.StudentProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
public class StudioService {

    private static final Logger logger = LoggerFactory.getLogger(StudioService.class);
    private static final String INVITE_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int INVITE_CODE_LENGTH = 6;
    private static final SecureRandom random = new SecureRandom();

    @Autowired
    private StudioRepository studioRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Transactional
    public Studio createStudio(String name, User teacher) {
        String inviteCode = generateUniqueInviteCode();

        Studio studio = Studio.builder()
                .name(name)
                .inviteCode(inviteCode)
                .teacher(teacher)
                .build();

        return studioRepository.save(studio);
    }

    @Transactional
    public Studio joinStudio(String inviteCode, User student) {
        Studio studio = studioRepository.findByInviteCode(inviteCode.toUpperCase())
                .orElseThrow(() -> new InvalidInviteCodeException("Invalid invite code: " + inviteCode));

        // Check if student already has a profile in this studio
        studentProfileRepository.findByUserId(student.getId()).ifPresent(profile -> {
            if (profile.getStudio().getId().equals(studio.getId())) {
                throw new AlreadyMemberException("Already a member of this studio");
            }
        });

        // Create student profile
        StudentProfile profile = StudentProfile.builder()
                .user(student)
                .studio(studio)
                .totalPoints(0)
                .currentStreak(0)
                .longestStreak(0)
                .build();

        studentProfileRepository.save(profile);
        logger.info("Student {} joined studio {}", student.getEmail(), studio.getName());

        return studio;
    }

    public Studio getStudioById(Long id) {
        return studioRepository.findById(id)
                .orElseThrow(() -> new StudioNotFoundException("Studio not found with id: " + id));
    }

    public Studio getStudioByInviteCode(String inviteCode) {
        return studioRepository.findByInviteCode(inviteCode.toUpperCase())
                .orElseThrow(() -> new InvalidInviteCodeException("Invalid invite code: " + inviteCode));
    }

    public List<Studio> getStudiosForTeacher(Long teacherId) {
        return studioRepository.findByTeacherId(teacherId);
    }

    public Studio getStudioForStudent(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new StudioNotFoundException("Student profile not found for user: " + userId));
        return profile.getStudio();
    }

    /**
     * Get all students in a studio
     */
    public List<StudentProfile> getStudentsInStudio(Long studioId) {
        return studentProfileRepository.findByStudioIdOrderByTotalPointsDesc(studioId);
    }

    /**
     * Get all students in a studio by invite code
     */
    public List<StudentProfile> getStudentsByInviteCode(String inviteCode) {
        Studio studio = getStudioByInviteCode(inviteCode);
        return studentProfileRepository.findByStudioIdOrderByTotalPointsDesc(studio.getId());
    }

    /**
     * Get studio for a user based on their role
     */
    public Studio getStudioForUser(User user) {
        if (user.getRole() == null) {
            return null;
        }

        switch (user.getRole()) {
            case TEACHER:
                List<Studio> studios = getStudiosForTeacher(user.getId());
                return studios.isEmpty() ? null : studios.get(0);
            case STUDENT:
                return user.getStudentProfile() != null ? user.getStudentProfile().getStudio() : null;
            case PARENT:
                // For parents, we could find their linked student's studio
                // For now return null
                return null;
            default:
                return null;
        }
    }

    private String generateUniqueInviteCode() {
        String inviteCode;
        do {
            inviteCode = generateInviteCode();
        } while (studioRepository.existsByInviteCode(inviteCode));
        return inviteCode;
    }

    private String generateInviteCode() {
        StringBuilder code = new StringBuilder(INVITE_CODE_LENGTH);
        for (int i = 0; i < INVITE_CODE_LENGTH; i++) {
            code.append(INVITE_CODE_CHARS.charAt(random.nextInt(INVITE_CODE_CHARS.length())));
        }
        return code.toString();
    }
}
