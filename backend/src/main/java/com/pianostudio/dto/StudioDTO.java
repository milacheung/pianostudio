package com.pianostudio.dto;

import com.pianostudio.model.Studio;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudioDTO {
    private Long id;
    private String name;
    private String inviteCode;
    private UserDTO teacher;
    private LocalDateTime createdAt;
    private Integer studentCount;

    public static StudioDTO fromEntity(Studio studio) {
        return StudioDTO.builder()
                .id(studio.getId())
                .name(studio.getName())
                .inviteCode(studio.getInviteCode())
                .teacher(UserDTO.fromEntity(studio.getTeacher()))
                .createdAt(studio.getCreatedAt())
                .studentCount(studio.getStudents() != null ? studio.getStudents().size() : 0)
                .build();
    }
}
