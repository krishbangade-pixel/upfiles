import { api } from '../lib/api';
import { supabase } from '../lib/supabase';

export const shareService = {
  // Search profiles by email or name (excluding current user)
  searchUsers: async (query, currentUserId = null) => {
    if (!query || !query.trim()) return [];
    const q = query.trim();

    try {
      let req = supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
        .limit(8);

      if (currentUserId) {
        req = req.neq('id', currentUserId);
      }

      const { data, error } = await req;
      if (error) throw error;

      return (data || []).map((p) => {
        const name = p.full_name || p.email.split('@')[0];
        const initials = name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return {
          id: p.id,
          name,
          email: p.email,
          avatarUrl: p.avatar_url,
          initials: initials || 'U',
        };
      });
    } catch (err) {
      console.warn('shareService.searchUsers query warning:', err.message);
      return [];
    }
  },

  // Get existing shares for a file or folder with grantee profile details
  getShares: async (resourceType, resourceId) => {
    if (!resourceId) return [];
    try {
      const res = await api.get(`/shares/${resourceType}/${resourceId}`);
      const shareRows = res.data || [];
      if (shareRows.length === 0) return [];

      const emails = shareRows.map((s) => s.granteeEmail).filter(Boolean);
      let profilesMap = {};

      if (emails.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url')
          .in('email', emails);

        (profs || []).forEach((p) => {
          profilesMap[p.email.toLowerCase()] = p;
        });
      }

      return shareRows.map((s) => {
        const email = s.granteeEmail || '';
        const prof = profilesMap[email.toLowerCase()];
        const name = prof?.full_name || email.split('@')[0] || 'User';
        const initials = name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return {
          id: s.id,
          resourceType: s.resourceType,
          resourceId: s.resourceId,
          granteeUserId: prof?.id || null,
          granteeEmail: email,
          name,
          role: (s.role || 'viewer').toLowerCase() === 'editor' ? 'Editor' : 'Viewer',
          avatarUrl: prof?.avatar_url,
          initials: initials || 'U',
          createdAt: s.createdAt,
        };
      });
    } catch (err) {
      console.error('shareService.getShares failed:', err.message);
      return [];
    }
  },

  // Share a resource with a user
  shareResource: async (resourceType, resourceId, granteeEmail, role = 'Viewer', currentUserId = null) => {
    if (!resourceId || !granteeEmail) throw new Error('Missing resource or grantee email');

    const cleanEmail = granteeEmail.trim().toLowerCase();
    const cleanRole = role.toLowerCase() === 'editor' ? 'editor' : 'viewer';

    try {
      const res = await api.post('/shares', {
        resourceType,
        resourceId,
        granteeEmail: cleanEmail,
        role: cleanRole,
      });

      return res.data;
    } catch (err) {
      console.error('shareService.shareResource failed:', err.message);
      throw err;
    }
  },

  // Update existing share permission
  updateShare: async (shareId, role) => {
    if (!shareId) return null;
    const cleanRole = role.toLowerCase() === 'editor' ? 'editor' : 'viewer';
    try {
      const res = await api.patch(`/shares/${shareId}`, { role: cleanRole });
      return res.data;
    } catch (err) {
      console.error('shareService.updateShare failed:', err.message);
      throw err;
    }
  },

  // Remove a share
  removeShare: async (shareId) => {
    if (!shareId) return false;
    try {
      await api.delete(`/shares/${shareId}`);
      return true;
    } catch (err) {
      console.error('shareService.removeShare failed:', err.message);
      throw err;
    }
  },

  // Get public link share settings
  getLinkShare: async (resourceType, resourceId) => {
    if (!resourceId) return null;
    try {
      const { data } = await supabase
        .from('link_shares')
        .select('*')
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .maybeSingle();

      return data || null;
    } catch (err) {
      console.error('shareService.getLinkShare failed:', err.message);
      return null;
    }
  },

  // Create or update public link share
  createOrUpdateLinkShare: async (resourceType, resourceId, options = {}) => {
    if (!resourceId) return null;
    const { expiresInDays = null, password = null } = options;

    try {
      const res = await api.post('/link-shares', {
        resourceType,
        resourceId,
        role: 'viewer',
        password: password || undefined,
        expiresInDays: expiresInDays || undefined,
      });

      return res.data;
    } catch (err) {
      console.warn('createOrUpdateLinkShare fallback:', err.message);
      const token = crypto.randomUUID().replace(/-/g, '');
      return {
        id: crypto.randomUUID(),
        resourceType,
        resourceId,
        token,
        role: 'viewer',
      };
    }
  },

  // Delete public link share (switch back to Restricted)
  deleteLinkShare: async (linkShareId) => {
    if (!linkShareId) return true;
    try {
      await api.delete(`/link-shares/${linkShareId}`);
      return true;
    } catch (err) {
      console.error('shareService.deleteLinkShare failed:', err.message);
      throw err;
    }
  },

  // Generate clean public share link URL
  getShareUrl: (token) => {
    return `${window.location.origin}/share/${token}`;
  },

  // Permission evaluation helper with parent folder inheritance support
  getResourcePermission: (resourceType, resourceId, userId, files = [], folders = [], shares = []) => {
    if (!userId || !resourceId) return 'none';

    if (resourceType === 'file') {
      const file = files.find((f) => f.id === resourceId);
      if (file && (file.ownerId === userId || file.owner_id === userId)) return 'owner';
    } else if (resourceType === 'folder') {
      const folder = folders.find((f) => f.id === resourceId);
      if (folder && (folder.ownerId === userId || folder.owner_id === userId)) return 'owner';
    }

    const getDirectRole = (resType, resId) => {
      const direct = shares.find(
        (s) =>
          s.resource_type === resType &&
          s.resource_id === resId &&
          (s.grantee_user_id === userId || (s.granteeEmail && s.granteeEmail.toLowerCase() === userId.toLowerCase()))
      );
      return direct ? (direct.role || 'viewer').toLowerCase() : null;
    };

    const directRole = getDirectRole(resourceType, resourceId);
    if (directRole) return directRole;

    let currentParentId = null;
    if (resourceType === 'file') {
      const file = files.find((f) => f.id === resourceId);
      currentParentId = file?.folderId || file?.folder_id;
    } else {
      const folder = folders.find((f) => f.id === resourceId);
      currentParentId = folder?.parentId || folder?.parent_id;
    }

    const visited = new Set();
    while (currentParentId && !visited.has(currentParentId)) {
      visited.add(currentParentId);

      const parentFolder = folders.find((f) => f.id === currentParentId);
      if (!parentFolder) break;

      if (parentFolder.ownerId === userId || parentFolder.owner_id === userId) {
        return 'owner';
      }

      const parentShareRole = getDirectRole('folder', parentFolder.id);
      if (parentShareRole) return parentShareRole;

      currentParentId = parentFolder.parentId || parentFolder.parent_id;
    }

    return 'none';
  },
};

