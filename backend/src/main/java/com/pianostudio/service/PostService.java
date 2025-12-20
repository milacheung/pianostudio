package com.pianostudio.service;

import com.pianostudio.dto.PostRequest;
import com.pianostudio.dto.PostResponse;
import com.pianostudio.exception.InvalidEmojiException;
import com.pianostudio.exception.PostNotFoundException;
import com.pianostudio.exception.UnauthorizedAccessException;
import com.pianostudio.model.Post;
import com.pianostudio.model.Reaction;
import com.pianostudio.model.Studio;
import com.pianostudio.model.User;
import com.pianostudio.repository.PostRepository;
import com.pianostudio.repository.ReactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PostService {

    private static final Logger logger = LoggerFactory.getLogger(PostService.class);
    private static final Set<String> ALLOWED_EMOJIS = Set.of(
            "👏", "❤️", "🎉", "🎹", "🎵", "🎶", "⭐", "🔥", "💯", "👍", "🙌", "💪", "🌟"
    );

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private StudioService studioService;

    @Transactional
    public PostResponse createPost(Long userId, PostRequest request, User author) {
        logger.info("Creating post for user: {}", userId);

        // Get user's studio
        Studio studio = studioService.getStudioForUser(author);
        if (studio == null) {
            throw new UnauthorizedAccessException("User must be a member of a studio to create posts");
        }

        // Parse media type if provided
        Post.MediaType mediaType = null;
        if (request.getMediaType() != null && !request.getMediaType().isEmpty()) {
            try {
                mediaType = Post.MediaType.valueOf(request.getMediaType().toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid media type: {}", request.getMediaType());
            }
        }

        // Create post
        Post post = Post.builder()
                .author(author)
                .studio(studio)
                .content(request.getContent())
                .mediaUrl(request.getMediaUrl())
                .mediaType(mediaType)
                .build();

        post = postRepository.save(post);
        logger.info("Post created with id: {}", post.getId());

        return PostResponse.fromEntity(post, new ArrayList<>(), null);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getPosts(Long userId, User user, int page, int size) {
        logger.info("Getting posts for user: {}, page: {}, size: {}", userId, page, size);

        // Get user's studio
        Studio studio = studioService.getStudioForUser(user);
        if (studio == null) {
            throw new UnauthorizedAccessException("User must be a member of a studio to view posts");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findByStudioIdOrderByCreatedAtDesc(studio.getId(), pageable);

        // Get all reactions for these posts
        List<Long> postIds = posts.getContent().stream()
                .map(Post::getId)
                .collect(Collectors.toList());

        Map<Long, List<Reaction>> reactionsByPost = new HashMap<>();
        Map<Long, String> userReactionsByPost = new HashMap<>();

        if (!postIds.isEmpty()) {
            List<Reaction> allReactions = reactionRepository.findAll().stream()
                    .filter(r -> postIds.contains(r.getPost().getId()))
                    .collect(Collectors.toList());

            // Group reactions by post
            for (Reaction reaction : allReactions) {
                reactionsByPost.computeIfAbsent(reaction.getPost().getId(), k -> new ArrayList<>()).add(reaction);
                if (reaction.getUser().getId().equals(userId)) {
                    userReactionsByPost.put(reaction.getPost().getId(), reaction.getEmoji());
                }
            }
        }

        // Convert to PostResponse
        return posts.map(post -> PostResponse.fromEntity(
                post,
                reactionsByPost.getOrDefault(post.getId(), new ArrayList<>()),
                userReactionsByPost.get(post.getId())
        ));
    }

    @Transactional
    public void deletePost(Long postId, Long userId, User user) {
        logger.info("Deleting post: {} by user: {}", postId, userId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found with id: " + postId));

        // Check authorization - only author or teacher can delete
        boolean isAuthor = post.getAuthor().getId().equals(userId);
        boolean isTeacher = user.getRole() == User.UserRole.TEACHER &&
                post.getStudio().getTeacher().getId().equals(userId);

        if (!isAuthor && !isTeacher) {
            throw new UnauthorizedAccessException("Only the post author or studio teacher can delete this post");
        }

        postRepository.delete(post);
        logger.info("Post deleted: {}", postId);
    }

    @Transactional
    public PostResponse addReaction(Long postId, Long userId, String emoji, User user) {
        logger.info("Adding reaction to post: {} by user: {}", postId, userId);

        // Validate emoji
        if (!ALLOWED_EMOJIS.contains(emoji)) {
            throw new InvalidEmojiException("Invalid emoji. Allowed emojis: " + ALLOWED_EMOJIS);
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found with id: " + postId));

        // Verify user is in the same studio
        Studio userStudio = studioService.getStudioForUser(user);
        if (userStudio == null || !userStudio.getId().equals(post.getStudio().getId())) {
            throw new UnauthorizedAccessException("You can only react to posts in your studio");
        }

        // Remove any existing reaction from this user first
        Optional<Reaction> existingReaction = reactionRepository.findByPostIdAndUserId(postId, userId);
        if (existingReaction.isPresent()) {
            if (existingReaction.get().getEmoji().equals(emoji)) {
                // Same emoji - treat as toggle (remove it)
                reactionRepository.delete(existingReaction.get());
                logger.info("Removed reaction from post: {} by user: {}", postId, userId);
                List<Reaction> reactions = reactionRepository.findByPostId(postId);
                return PostResponse.fromEntity(post, reactions, null);
            } else {
                // Different emoji - update it
                reactionRepository.delete(existingReaction.get());
            }
        }

        // Add new reaction
        Reaction reaction = Reaction.builder()
                .post(post)
                .user(user)
                .emoji(emoji)
                .build();

        reactionRepository.save(reaction);
        logger.info("Reaction added to post: {} by user: {}", postId, userId);

        // Return updated post
        List<Reaction> reactions = reactionRepository.findByPostId(postId);
        return PostResponse.fromEntity(post, reactions, emoji);
    }

    @Transactional
    public PostResponse removeReaction(Long postId, Long userId, User user) {
        logger.info("Removing reaction from post: {} by user: {}", postId, userId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found with id: " + postId));

        // Verify user is in the same studio
        Studio userStudio = studioService.getStudioForUser(user);
        if (userStudio == null || !userStudio.getId().equals(post.getStudio().getId())) {
            throw new UnauthorizedAccessException("You can only remove reactions from posts in your studio");
        }

        reactionRepository.deleteByPostIdAndUserId(postId, userId);
        logger.info("Reaction removed from post: {} by user: {}", postId, userId);

        // Return updated post
        List<Reaction> reactions = reactionRepository.findByPostId(postId);
        return PostResponse.fromEntity(post, reactions, null);
    }

    @Transactional(readOnly = true)
    public Map<String, Integer> getReactionCounts(Long postId) {
        logger.info("Getting reaction counts for post: {}", postId);

        List<Reaction> reactions = reactionRepository.findByPostId(postId);
        Map<String, Integer> counts = new HashMap<>();

        for (Reaction reaction : reactions) {
            counts.merge(reaction.getEmoji(), 1, Integer::sum);
        }

        return counts;
    }
}
