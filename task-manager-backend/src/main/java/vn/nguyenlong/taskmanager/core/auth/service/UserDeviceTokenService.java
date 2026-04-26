package vn.nguyenlong.taskmanager.core.auth.service;

import vn.nguyenlong.taskmanager.core.auth.entity.User;

public interface UserDeviceTokenService {
    void validateAndLimitDeviceIp(User user, String deviceId);
}
