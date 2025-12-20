package com.pianostudio.dto;

import com.pianostudio.model.User;
import com.pianostudio.model.Studio;
import com.pianostudio.model.StudentProfile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String name;
    private String firstName;
    private String avatarUrl;
    private String role;
    private LocalDateTime createdAt;
    private Boolean hasCompletedOnboarding;
    private Long studioId;
    private String studioName;
    private String inviteCode; // only for teachers

    public static UserDTO fromEntity(User user) {
        return fromEntity(user, null);
    }

    /**
     * Create UserDTO from User entity with an optional studio parameter.
     * Use this overload when you already have the studio to avoid lazy loading issues.
     */
    public static UserDTO fromEntity(User user, Studio studioOverride) {
        UserDTOBuilder builder = UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .firstName(user.getFirstName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .createdAt(user.getCreatedAt())
                .hasCompletedOnboarding(user.getRole() != null);

        // If studio is provided directly, use it (avoids lazy loading issues)
        if (studioOverride != null) {
            builder.studioId(studioOverride.getId())
                   .studioName(studioOverride.getName());
            // Include invite code for teachers
            if (user.getRole() != null && user.getRole().name().equals("TEACHER")) {
                builder.inviteCode(studioOverride.getInviteCode());
            }
            return builder.build();
        }

        // Otherwise try to get studio from user's relationships (requires active session)
        if (user.getRole() != null) {
            try {
                switch (user.getRole()) {
                    case TEACHER:
                        if (user.getStudiosAsTeacher() != null && !user.getStudiosAsTeacher().isEmpty()) {
                            Studio studio = user.getStudiosAsTeacher().get(0);
                            builder.studioId(studio.getId())
                                   .studioName(studio.getName())
                                   .inviteCode(studio.getInviteCode());
                        }
                        break;
                    case STUDENT:
                        if (user.getStudentProfile() != null && user.getStudentProfile().getStudio() != null) {
                            Studio studio = user.getStudentProfile().getStudio();
                            builder.studioId(studio.getId())
                                   .studioName(studio.getName());
                        }
                        break;
                    case PARENT:
                        // For parents, we could show their child's studio
                        // For now, we'll leave it null unless they're linked to a student
                        break;
                }
            } catch (org.hibernate.LazyInitializationException e) {
                // Session closed - studio info will be null, which is acceptable
            }
        }

        return builder.build();
    }
}
