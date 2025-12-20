package com.pianostudio.security;

import com.pianostudio.model.User;
import com.pianostudio.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2SuccessHandler.class);

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Value("${cors.allowed-origins}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        logger.info("OAuth2 login successful for email: {}", email);

        // Check if user exists, if not create new user
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .name(name)
                    .avatarUrl(picture)
                    .role(User.UserRole.STUDENT) // Default role
                    .build();
            return userRepository.save(newUser);
        });

        // Update avatar if changed
        if (picture != null && !picture.equals(user.getAvatarUrl())) {
            user.setAvatarUrl(picture);
            userRepository.save(user);
        }

        // Generate JWT token
        String token = tokenProvider.generateTokenFromEmail(email);

        // Redirect to frontend with token
        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/callback")
                .queryParam("token", token)
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
