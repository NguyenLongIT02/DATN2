package vn.nguyenlong.taskmanager.websocket.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import vn.nguyenlong.taskmanager.websocket.handler.BoardWebSocketHandler;
import vn.nguyenlong.taskmanager.websocket.handler.NotificationWebSocketHandler;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final BoardWebSocketHandler boardWebSocketHandler;
    private final NotificationWebSocketHandler notificationWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(boardWebSocketHandler, "/ws/board/{boardId}")
                .setAllowedOrigins(
                    "http://localhost:5173",  // Vite dev server
                    "http://localhost:3000",  // Alternative dev port
                    "http://localhost:5174"   // Alternative Vite port
                    // TODO: Add production domain here
                    // "https://yourdomain.com"
                );
        
        registry.addHandler(notificationWebSocketHandler, "/ws/notifications/{userId}")
                .setAllowedOrigins(
                    "http://localhost:5173",  // Vite dev server
                    "http://localhost:3000",  // Alternative dev port
                    "http://localhost:5174"   // Alternative Vite port
                    // TODO: Add production domain here
                    // "https://yourdomain.com"
                );
    }
}
