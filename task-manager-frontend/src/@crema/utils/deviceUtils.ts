// Utility functions for device management

/**
 * Generate a UUID v4 (Universally Unique Identifier)
 * @returns {string} A UUID v4 string
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Generate a unique device ID
 * @returns {string} A unique device identifier
 */
export const generateDeviceId = (): string => {
  try {
    // Try to get existing device ID from localStorage
    let deviceId = localStorage.getItem('device-id');
    
    if (!deviceId) {
      // Generate a simple but unique device ID
      const uuid = generateUUID();
      const timestamp = Date.now().toString();
      const randomPart = Math.random().toString(36).substring(2, 15);
      
      // Simple browser info for uniqueness
      const browserInfo = [
        navigator.userAgent.substring(0, 50), // Limit length
        navigator.language,
        screen.width + 'x' + screen.height,
        timestamp,
        randomPart
      ].join('-');
      
      // Create device ID from UUID + browser info
      const cleanUUID = uuid.replace(/-/g, '');
      const infoHash = btoa(browserInfo).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
      
      deviceId = cleanUUID + infoHash;
      
      // Ensure the device ID is exactly 40 characters
      deviceId = deviceId.substring(0, 40).padEnd(40, '0');
      
      // Store in localStorage for future use
      localStorage.setItem('device-id', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    // Fallback: generate simple random ID
    console.warn('Error generating device ID, using fallback:', error);
    const fallbackId = 'dev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    return fallbackId.padEnd(40, '0').substring(0, 40);
  }
};

/**
 * Get device ID from localStorage or generate new one
 * @returns {string} Device ID
 */
export const getDeviceId = (): string => {
  return generateDeviceId();
};

/**
 * Validate if a device ID is properly formatted
 * @param deviceId - The device ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidDeviceId = (deviceId: string): boolean => {
  // Device ID should be exactly 40 characters and contain only alphanumeric characters
  return /^[a-zA-Z0-9]{40}$/.test(deviceId);
};

/**
 * Force regenerate device ID (useful for testing or when device changes)
 * @returns {string} New device ID
 */
export const regenerateDeviceId = (): string => {
  // Remove existing device ID
  localStorage.removeItem('device-id');
  // Generate new one
  return generateDeviceId();
};

