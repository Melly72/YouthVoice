
// Utility to manage anonymous user IDs
export const getAnonymousUserId = (): string => {
  const storageKey = 'youthvoice_anonymous_id';
  let userId = localStorage.getItem(storageKey);
  
  if (!userId) {
    // Generate a unique anonymous user ID using timestamp + random
    userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, userId);
  }
  
  return userId;
};

export const generateShareableId = (): string => {
  return Math.random().toString(36).substr(2, 12);
};
