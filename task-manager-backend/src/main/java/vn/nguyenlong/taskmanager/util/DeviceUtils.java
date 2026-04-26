package vn.nguyenlong.taskmanager.util;

public class DeviceUtils {
    private DeviceUtils() {}
    public static String parseDeviceType(String userAgent) {
        if (userAgent == null) return "WEB";

        userAgent = userAgent.toLowerCase();

        if (userAgent.contains("android") || userAgent.contains("iphone")) {
            return "MOBILE";
        } else {
            return "WEB"; // bao gồm Windows, Mac, Linux, tablet, other
        }
    }

}
