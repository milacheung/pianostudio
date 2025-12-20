package com.pianostudio.dto.response;

import com.pianostudio.model.Badge;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeDTO {
    private Long id;
    private String name;
    private String description;
    private String iconUrl;
    private String criteria;

    public static BadgeDTO fromEntity(Badge badge) {
        return BadgeDTO.builder()
                .id(badge.getId())
                .name(badge.getName())
                .description(badge.getDescription())
                .iconUrl(badge.getIconUrl())
                .criteria(badge.getCriteria())
                .build();
    }
}
