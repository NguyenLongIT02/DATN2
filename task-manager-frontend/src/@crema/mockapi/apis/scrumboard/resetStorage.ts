/**
 * Utility function to reset localStorage for scrumboard
 * This can be called from browser console if needed
 */

export const resetScrumboardStorage = () => {
  try {
    localStorage.removeItem('scrumboard_boards');
    console.log('Scrumboard storage reset successfully');
    window.location.reload();
  } catch (error) {
    console.error('Error resetting scrumboard storage:', error);
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).resetScrumboardStorage = resetScrumboardStorage;
}


