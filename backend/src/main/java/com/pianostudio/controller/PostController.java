package com.pianostudio.controller;

import com.pianostudio.dto.PostRequest;
import com.pianostudio.dto.PostResponse;
import com.pianostudio.dto.ReactionRequest;
import com.pianostudio.model.User;
import com.pianostudio.service.PostService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private static final Logger logger = LoggerFactory.getLogger(PostController.class);

    @Autowired
    private PostService postService;

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PostRequest request) {

        logger.info("Creating post for user: {}", user.getEmail());

        PostResponse post = postService.createPost(user.getId(), request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    @GetMapping
    public ResponseEntity<Page<PostResponse>> getPosts(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        logger.info("Getting posts for user: {}, page: {}, size: {}", user.getEmail(), page, size);

        // Validate pagination parameters
        if (page < 0) {
            page = 0;
        }
        if (size < 1 || size > 100) {
            size = 20;
        }

        Page<PostResponse> posts = postService.getPosts(user.getId(), user, page, size);
        return ResponseEntity.ok(posts);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {

        logger.info("Deleting post: {} by user: {}", id, user.getEmail());

        postService.deletePost(id, user.getId(), user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reactions")
    public ResponseEntity<PostResponse> addReaction(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody ReactionRequest request) {

        logger.info("Adding reaction to post: {} by user: {}", id, user.getEmail());

        PostResponse post = postService.addReaction(id, user.getId(), request.getEmoji(), user);
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/{id}/reactions")
    public ResponseEntity<PostResponse> removeReaction(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {

        logger.info("Removing reaction from post: {} by user: {}", id, user.getEmail());

        PostResponse post = postService.removeReaction(id, user.getId(), user);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/{id}/reactions")
    public ResponseEntity<Map<String, Integer>> getReactionCounts(@PathVariable Long id) {
        logger.info("Getting reaction counts for post: {}", id);

        Map<String, Integer> counts = postService.getReactionCounts(id);
        return ResponseEntity.ok(counts);
    }
}
