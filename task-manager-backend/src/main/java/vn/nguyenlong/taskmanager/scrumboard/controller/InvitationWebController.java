package vn.nguyenlong.taskmanager.scrumboard.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import vn.nguyenlong.taskmanager.scrumboard.service.InvitationService;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;
import vn.nguyenlong.taskmanager.core.auth.entity.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

@Controller
@RequestMapping("/web/invitations")
@RequiredArgsConstructor
@Slf4j
public class InvitationWebController {

    private final InvitationService invitationService;
    private final UserRepository userRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/accept")
    public String acceptInvitation(@RequestParam("token") String token, 
                                   HttpServletRequest request, 
                                   Model model) {
        try {
            // Lấy user hiện tại từ session/security context
            Long currentUserId = getCurrentUserId(request);
            log.info("Processing invitation with token: {}, currentUserId: {}", token, currentUserId);
            
            // Gọi service xử lý invitation
            Map<String, Object> result = invitationService.accept(token, currentUserId);
            log.info("Invitation service result: {}", result);
            
            if (result.containsKey("status")) {
                // Có lỗi
                int status = (int) result.get("status");
                String message = (String) result.get("message");
                
                model.addAttribute("success", false);
                model.addAttribute("message", message);
                model.addAttribute("redirectUrl", "http://localhost:5173/signin");
                
                return "invitation-result";
            } else if (currentUserId != null) {
                // User đã đăng nhập và thành công
                model.addAttribute("success", true);
                model.addAttribute("message", "Đã tham gia board thành công!");
                model.addAttribute("boardName", result.get("boardName"));
                model.addAttribute("redirectUrl", "http://localhost:5173/signin");
                
                return "invitation-result";
            } else {
                // User chưa đăng nhập - kiểm tra user có tồn tại trong hệ thống không
                String email = (String) result.get("email");
                log.info("User chưa đăng nhập, kiểm tra email: {}", email);
                boolean userExists = checkUserExists(email);
                log.info("User exists: {}", userExists);
                
                if (userExists) {
                    // User đã tồn tại nhưng chưa đăng nhập
                    model.addAttribute("success", false);
                    model.addAttribute("message", "Bạn cần đăng nhập để tham gia board");
                    model.addAttribute("boardName", result.get("boardName"));
                    model.addAttribute("email", email);
                    model.addAttribute("inviteToken", result.get("inviteToken"));
                    model.addAttribute("redirectUrl", "http://localhost:5173/signin?redirect=/invitations/accept?token=" + token);
                    model.addAttribute("showLoginPrompt", true);
                    model.addAttribute("userExists", true);
                } else {
                    // User chưa tồn tại - cần đăng ký trước
                    model.addAttribute("success", false);
                    model.addAttribute("message", "Bạn cần đăng ký tài khoản trước để tham gia board");
                    model.addAttribute("boardName", result.get("boardName"));
                    model.addAttribute("email", email);
                    model.addAttribute("inviteToken", result.get("inviteToken"));
                    model.addAttribute("redirectUrl", "http://localhost:5173/signup?email=" + email + "&redirect=/invitations/accept?token=" + token);
                    model.addAttribute("showSignupPrompt", true);
                    model.addAttribute("userExists", false);
                }
                
                return "invitation-result";
            }
            
        } catch (Exception e) {
            log.error("Error processing invitation: {}", e.getMessage());
            model.addAttribute("success", false);
            model.addAttribute("message", "Có lỗi xảy ra khi xử lý lời mời");
            model.addAttribute("redirectUrl", "http://localhost:5173/signin");
            
            return "invitation-result";
        }
    }

    @PostMapping("/complete")
    public String completeInvitation(@RequestParam("token") String token,
                                     @RequestParam("userId") Long userId,
                                     Model model) {
        try {
            Map<String, Object> result = invitationService.complete(token, userId);
            
            if (result.containsKey("status")) {
                // Có lỗi
                int status = (int) result.get("status");
                String message = (String) result.get("message");
                
                model.addAttribute("success", false);
                model.addAttribute("message", message);
                model.addAttribute("redirectUrl", "http://localhost:5173/signin");
                
                return "invitation-result";
            } else {
                // Thành công
                model.addAttribute("success", true);
                model.addAttribute("message", "Đã tham gia board thành công!");
                model.addAttribute("boardName", result.get("boardName"));
                model.addAttribute("redirectUrl", "http://localhost:5173/signin");
                
                return "invitation-result";
            }
            
        } catch (Exception e) {
            log.error("Error completing invitation: {}", e.getMessage());
            model.addAttribute("success", false);
            model.addAttribute("message", "Có lỗi xảy ra khi hoàn tất lời mời");
            model.addAttribute("redirectUrl", "http://localhost:5173/signin");
            
            return "invitation-result";
        }
    }

    private boolean checkUserExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    private Long getCurrentUserId(HttpServletRequest request) {
        try {
            // Method 1: Try Security Context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getPrincipal())) {
                
                String username = authentication.getName();
                User user = userRepository.findByUsername(username).orElse(null);
                if (user != null) {
                    log.info("Found authenticated user via Security Context: {} with ID: {}", username, user.getId());
                    return user.getId();
                }
            }
            
            // Method 2: Try JWT token from Authorization header
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                // TODO: Decode JWT token to get user ID
                log.info("Found JWT token in header: {}", token.substring(0, Math.min(20, token.length())) + "...");
            }
            
            // Method 3: Try to get from request parameter (for testing)
            String userIdParam = request.getParameter("userId");
            if (userIdParam != null) {
                try {
                    Long userId = Long.parseLong(userIdParam);
                    log.info("Found user ID from parameter: {}", userId);
                    return userId;
                } catch (NumberFormatException e) {
                    log.warn("Invalid userId parameter: {}", userIdParam);
                }
            }
            
            // Method 4: Try to find user by email from invitation token
            String token = request.getParameter("token");
            if (token != null) {
                try {
                    // ✅ KHÔNG consume token, chỉ đọc để lấy email
                    String key = "invitation:" + token;
                    String json = redisTemplate.opsForValue().get(key);
                    if (json != null) {
                        Map<String, Object> payload = objectMapper.readValue(json, new TypeReference<Map<String, Object>>(){});
                        if (payload.containsKey("email")) {
                            String email = (String) payload.get("email");
                            User user = userRepository.findByEmail(email).orElse(null);
                            if (user != null) {
                                log.info("Found user by email from token: {} with ID: {}", email, user.getId());
                                return user.getId();
                            }
                        }
                    }
                } catch (Exception e) {
                    log.warn("Error getting user from token: {}", e.getMessage());
                }
            }
            
            log.info("No authenticated user found");
            return null;
        } catch (Exception e) {
            log.error("Error getting current user ID: {}", e.getMessage());
            return null;
        }
    }
}
