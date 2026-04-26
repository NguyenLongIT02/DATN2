package vn.nguyenlong.taskmanager.core.auth.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.access.AccessDeniedException;

public interface LogoutService {
    void logoutDevice(HttpServletRequest request) throws AccessDeniedException;
    void logoutAllDevices(HttpServletRequest request) throws AccessDeniedException;
}
