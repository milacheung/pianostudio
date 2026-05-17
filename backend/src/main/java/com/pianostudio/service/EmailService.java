package com.pianostudio.service;

import com.pianostudio.model.StudentProfile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@pianostudio.app}")
    private String fromEmail;

    @Value("${app.name:PianoStudio}")
    private String appName;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    /**
     * Send parent invitation email with magic link
     */
    @Async
    public void sendParentInvite(String toEmail, String studentName, String magicLinkUrl) {
        String subject = String.format("You're invited to view %s's piano progress!", studentName);

        String htmlContent = buildParentInviteEmail(studentName, magicLinkUrl);

        sendEmail(toEmail, subject, htmlContent);
    }

    /**
     * Send weekly progress report to parent
     */
    @Async
    public void sendWeeklyReport(String toEmail, String studentName, WeeklyReportData data) {
        String subject = String.format("%s's Weekly Piano Progress - %s", studentName, appName);

        String htmlContent = buildWeeklyReportEmail(studentName, data);

        sendEmail(toEmail, subject, htmlContent);
    }

    /**
     * Send achievement notification
     */
    @Async
    public void sendAchievementNotification(String toEmail, String studentName, String achievementName) {
        String subject = String.format("%s earned a new badge!", studentName);

        String htmlContent = buildAchievementEmail(studentName, achievementName);

        sendEmail(toEmail, subject, htmlContent);
    }

    private void sendEmail(String toEmail, String subject, String htmlContent) {
        if (mailSender == null) {
            logger.warn("Mail sender not configured. Would send email to {}: {}", toEmail, subject);
            logger.debug("Email content:\n{}", htmlContent);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Email sent successfully to {}", toEmail);
        } catch (MessagingException e) {
            logger.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildParentInviteEmail(String studentName, String magicLinkUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #7B68EE 0%, #5847C7 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                    .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
                    .button { display: inline-block; background: linear-gradient(135deg, #7B68EE 0%, #5847C7 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                    .emoji { font-size: 48px; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="emoji">🎹</div>
                        <h1 style="margin: 0;">%s</h1>
                    </div>
                    <div class="content">
                        <h2>You're invited!</h2>
                        <p>Hi there,</p>
                        <p><strong>%s</strong>'s piano teacher has invited you to view their practice progress on PianoStudio.</p>
                        <p>With PianoStudio, you can:</p>
                        <ul>
                            <li>📊 See how much %s practices each week</li>
                            <li>🏆 Celebrate their achievements and badges</li>
                            <li>🔥 Track their practice streaks</li>
                            <li>📬 Receive weekly progress updates</li>
                        </ul>
                        <p style="text-align: center;">
                            <a href="%s" class="button">View %s's Progress</a>
                        </p>
                        <p style="font-size: 14px; color: #666;">This link is valid for 30 days. No password needed!</p>
                    </div>
                    <div class="footer">
                        <p>🎵 PianoStudio - Making piano practice fun!</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(appName, studentName, studentName, magicLinkUrl, studentName);
    }

    private String buildWeeklyReportEmail(String studentName, WeeklyReportData data) {
        String streakEmoji = data.currentStreak >= 7 ? "🔥" : data.currentStreak >= 3 ? "⭐" : "📅";

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #7B68EE 0%, #5847C7 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                    .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
                    .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
                    .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
                    .stat-value { font-size: 32px; font-weight: 700; color: #7B68EE; }
                    .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
                    .button { display: inline-block; background: linear-gradient(135deg, #7B68EE 0%, #5847C7 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                    .emoji { font-size: 48px; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="emoji">🎹</div>
                        <h1 style="margin: 0;">%s's Weekly Report</h1>
                    </div>
                    <div class="content">
                        <p>Hi there! Here's how <strong>%s</strong> did this week:</p>

                        <div class="stat-grid">
                            <div class="stat-card">
                                <div class="stat-value">%d</div>
                                <div class="stat-label">Minutes Practiced</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">%d</div>
                                <div class="stat-label">Practice Sessions</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">%s %d</div>
                                <div class="stat-label">Day Streak</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">%d</div>
                                <div class="stat-label">Points Earned</div>
                            </div>
                        </div>

                        %s

                        <p style="text-align: center; margin-top: 30px;">
                            <a href="%s" class="button">View Full Progress</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>🎵 Keep up the great work!</p>
                        <p style="font-size: 12px;">
                            <a href="%s/unsubscribe?email=%s">Unsubscribe</a> from weekly reports
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                studentName,
                studentName,
                data.weeklyMinutes,
                data.sessionCount,
                streakEmoji,
                data.currentStreak,
                data.pointsEarned,
                data.newBadges.isEmpty() ? "" : "<p>🏆 <strong>New badges earned:</strong> " + String.join(", ", data.newBadges) + "</p>",
                baseUrl,
                baseUrl,
                data.parentEmail
        );
    }

    private String buildAchievementEmail(String studentName, String achievementName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #333; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                    .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; text-align: center; }
                    .badge { font-size: 64px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">🎉 Achievement Unlocked!</h1>
                    </div>
                    <div class="content">
                        <div class="badge">🏆</div>
                        <h2>%s earned a new badge!</h2>
                        <p style="font-size: 24px; font-weight: 600; color: #7B68EE;">%s</p>
                        <p>Keep up the amazing work!</p>
                    </div>
                    <div class="footer">
                        <p>🎵 PianoStudio</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(studentName, achievementName);
    }

    /**
     * Data class for weekly report
     */
    public record WeeklyReportData(
            String parentEmail,
            int weeklyMinutes,
            int sessionCount,
            int currentStreak,
            int pointsEarned,
            java.util.List<String> newBadges
    ) {}
}
