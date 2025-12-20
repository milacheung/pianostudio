package com.pianostudio.dto;

import com.pianostudio.model.Post;
import com.pianostudio.model.Reaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private Long id;
    private String content;
    private String mediaUrl;
    private String mediaType;
    private LocalDateTime createdAt;

    // Author info
    private Long authorId;
    private String authorName;
    private String authorAvatar;

    // Reactions
    private Map<String, Integer> reactions;
    private String userReaction;

    // Comments (for future use)
    private Integer commentCount;

    public static PostResponse fromEntity(Post post, List<Reaction> reactions, String currentUserReaction) {
        // Count reactions by emoji
        Map<String, Integer> reactionCounts = new HashMap<>();
        for (Reaction reaction : reactions) {
            reactionCounts.merge(reaction.getEmoji(), 1, Integer::sum);
        }

        return PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .mediaUrl(post.getMediaUrl())
                .mediaType(post.getMediaType() != null ? post.getMediaType().name() : null)
                .createdAt(post.getCreatedAt())
                .authorId(post.getAuthor().getId())
                .authorName(post.getAuthor().getName())
                .authorAvatar(post.getAuthor().getAvatarUrl())
                .reactions(reactionCounts)
                .userReaction(currentUserReaction)
                .commentCount(0)
                .build();
    }
}
