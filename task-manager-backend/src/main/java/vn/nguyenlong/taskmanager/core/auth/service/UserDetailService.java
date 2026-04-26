package vn.nguyenlong.taskmanager.core.auth.service;

import org.springframework.security.core.userdetails.UserDetails;

public interface UserDetailService {
    UserDetails loadUserByUsername(String username);
}
