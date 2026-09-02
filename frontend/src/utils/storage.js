const STORAGE_KEYS = {
  FOLDERS: 'cloudvault_folders',
  FILES: 'cloudvault_files',
  VIEW_MODE: 'cloudvault_view_mode',
  NOTIFICATIONS: 'cloudvault_notifications',
};

export const getStoredItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const setStoredItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
  }
};

export { STORAGE_KEYS };
