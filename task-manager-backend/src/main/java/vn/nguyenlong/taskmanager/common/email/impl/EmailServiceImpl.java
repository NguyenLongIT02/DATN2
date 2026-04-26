package vn.nguyenlong.taskmanager.common.email.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import vn.nguyenlong.taskmanager.common.email.EmailService;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    @Override
    public void sendBoardInvite(String toEmail, String boardName, String invitedByName, String acceptLink, long hoursToExpire) {
        String subject = "Invitation to join board: " + boardName;
        String text = "Xin chào,\n\n" +
                invitedByName + " đã mời bạn tham gia board '" + boardName + "'.\n" +
                "Nhấn vào liên kết sau để chấp nhận lời mời (hết hạn sau " + hoursToExpire + " giờ):\n" +
                acceptLink + "\n\n" +
                "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.\n";
        sendEmail(toEmail, subject, text);
    }

    @Override
    public void sendAddedToBoard(String toEmail, String boardName, String invitedByName) {
        String subject = "You've been added to board: " + boardName;
        String text = "Xin chào,\n\n" +
                "Bạn đã được thêm vào board '" + boardName + "' bởi " + invitedByName + ".\n" +
                "Hãy đăng nhập để bắt đầu làm việc.\n";
        sendEmail(toEmail, subject, text);
    }

    private void sendEmail(String to, String subject, String text) {
        try {
            if (fromAddress == null || fromAddress.isBlank()) {
                log.info("[EMAIL FAKE SEND] to={}, subject={}, body=\n{}", to, subject, text);
                return;
            }
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Email sent to {} with subject {}", to, subject);
        } catch (MailException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}


