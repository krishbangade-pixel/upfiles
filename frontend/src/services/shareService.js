import { MOCK_USERS } from '../data/mockData';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../utils/storage';

export const shareService = {
  shareItem: async (itemId, email, role = 'Viewer') => {
    await new Promise((res) => setTimeout(res, 200));
    const allFiles = getStoredItem(STORAGE_KEYS.FILES, []);
    const existingUser = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
      id: `u-${Date.now()}`,
      name: email.split('@')[0],
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      role,
    };

    const updated = allFiles.map((f) => {
      if (f.id === itemId) {
        const members = f.members || [];
        const alreadyMember = members.some((m) => m.email === email);
        return {
          ...f,
          members: alreadyMember ? members : [...members, { ...existingUser, role }],
        };
      }
      return f;
    });

    setStoredItem(STORAGE_KEYS.FILES, updated);
    return { success: true, user: existingUser };
  },

  createPublicLink: async (itemId, settings = {}) => {
    await new Promise((res) => setTimeout(res, 150));
    const code = Math.random().toString(36).substring(2, 10);
    return {
      link: `https://cloudvault.app/s/${code}`,
      expiresAt: settings.expiration || 'Never',
      permission: settings.permission || 'Viewer',
    };
  }
};
