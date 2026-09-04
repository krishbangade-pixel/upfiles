import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { fileService } from '../services/fileService';
import { folderService } from '../services/folderService';
import { shareService } from '../services/shareService';
import { trashService } from '../services/trashService';
import { storageService } from '../services/storageService';
import { supabase } from '../lib/supabase';
import { currentUser as fallbackUser } from '../data/mockData';

const DriveContext = createContext();

export const DriveProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewModeState] = useState(() => {
    return localStorage.getItem('clouddrive_view_mode') || 'grid';
  });
  const [sortBy, setSortByState] = useState(() => {
    return localStorage.getItem('clouddrive_sort_by') || 'name';
  });
  const [sortOrder, setSortOrder] = useState('asc');
  const [toasts, setToasts] = useState([]);
  const [modalState, setModalState] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storageData, setStorageData] = useState(null);

  // Supabase Auth State
  const [session, setSession] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch all user files, folders, and storage directly from Supabase PostgreSQL
  const refreshDriveData = useCallback(async () => {
    if (!authUser) return;
    try {
      const [fetchedFiles, fetchedFolders, usage] = await Promise.all([
        fileService.getFiles(authUser.id),
        folderService.getFolders(authUser.id),
        storageService.getStorageUsage(authUser.id),
      ]);
      setFiles(fetchedFiles || []);
      setFolders(fetchedFolders || []);
      if (usage) {
        setStorageData(usage);
      }
    } catch (err) {
      console.error('Failed to load drive data from Supabase:', err);
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      refreshDriveData();
    } else {
      setFiles([]);
      setFolders([]);
      setStorageData(null);
    }
  }, [authUser, refreshDriveData]);

  // Toast System
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setViewMode = (mode) => {
    setViewModeState(mode);
    localStorage.setItem('clouddrive_view_mode', mode);
  };

  const setSortBy = (key) => {
    setSortByState(key);
    localStorage.setItem('clouddrive_sort_by', key);
  };

  const openModal = (type, item = null, meta = {}) => {
    setModalState({ type, item, meta });
  };

  const closeModal = () => {
    setModalState(null);
  };

  // Auth Methods
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { user: null, error };
      }
      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      return { user: null, error: err };
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) {
        return { user: null, error };
      }

      // Upsert profile row in profiles table
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
        }).catch(() => {});
      }

      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      return { user: null, error: err };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        return { success: false, error };
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAuthUser(null);
    setFiles([]);
    setFolders([]);
    setStorageData(null);
    addToast('Signed out successfully', 'info');
  };

  // User Profile
  const activeUser = useMemo(() => {
    if (authUser) {
      const fullName = authUser.user_metadata?.full_name || authUser.email.split('@')[0];
      const initials = fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      return {
        id: authUser.id,
        name: fullName,
        email: authUser.email,
        initials: initials || 'U',
        role: 'Owner',
        totalStorageBytes: fallbackUser.totalStorageBytes,
      };
    }
    return fallbackUser;
  }, [authUser]);

  // Actions
  const createFolder = async (name) => {
    if (!name || !name.trim() || !authUser) return;
    try {
      const created = await folderService.createFolder(name, currentFolderId, authUser.id);
      addToast(`Folder "${created.name}" created successfully`);
      await refreshDriveData();
    } catch (err) {
      addToast(err.message || 'Failed to create folder', 'error');
    }
    closeModal();
  };

  // Direct Supabase Storage Upload
  const uploadFilesSimulated = async (fileItems, onProgress) => {
    if (!authUser || !fileItems || fileItems.length === 0) return;
    
    addToast(`Uploading ${fileItems.length} file(s) to Supabase Storage...`, 'info');
    
    const total = fileItems.length;
    let completedCount = 0;

    for (let i = 0; i < fileItems.length; i++) {
      const f = fileItems[i];
      try {
        const uploadedRecord = await fileService.uploadFile(f, currentFolderId, authUser.id, (singlePercent) => {
          const overallPercent = Math.round(((completedCount + singlePercent / 100) / total) * 100);
          if (onProgress) onProgress(overallPercent);
        });
        completedCount++;
        if (uploadedRecord) {
          setFiles((prev) => [uploadedRecord, ...prev.filter((x) => x.id !== uploadedRecord.id)]);
        }
      } catch (err) {
        console.error('File upload error:', err);
        addToast(err.message || `Failed to upload ${f.name}`, 'error');
        throw err;
      }
    }
    
    addToast(`Upload complete!`);
    await refreshDriveData();
  };

  const renameItem = async (item, isFolder, newName) => {
    if (!newName || !newName.trim()) return;
    try {
      if (isFolder) {
        await folderService.renameFolder(item.id, newName);
        addToast(`Folder renamed to "${newName}"`);
      } else {
        await fileService.renameFile(item.id, newName);
        addToast(`File renamed to "${newName}"`);
      }
      await refreshDriveData();
    } catch (err) {
      addToast(err.message || 'Failed to rename', 'error');
    }
    closeModal();
  };

  const moveItem = async (item, isFolder, targetFolderId) => {
    try {
      if (isFolder) {
        if (item.id === targetFolderId) {
          addToast("Cannot move folder into itself", "error");
          return;
        }
        await folderService.moveFolder(item.id, targetFolderId);
        addToast(`Folder moved successfully`);
      } else {
        await fileService.moveFile(item.id, targetFolderId);
        addToast(`File moved successfully`);
      }
      await refreshDriveData();
    } catch (err) {
      addToast(err.message || 'Failed to move', 'error');
    }
    closeModal();
  };

  const toggleStar = async (item, isFolder) => {
    try {
      if (isFolder) {
        await folderService.toggleStar(item.id, item.isStarred);
      } else {
        await fileService.toggleStar(item.id, item.isStarred);
      }
      addToast(item.isStarred ? `Removed from Starred` : `Added to Starred`);
      await refreshDriveData();
    } catch (err) {
      addToast(err.message || 'Failed to update star state', 'error');
    }
  };

  const deleteItem = async (item, isFolder) => {
    try {
      if (isFolder) {
        await folderService.deleteFolder(item.id);
      } else {
        await fileService.deleteFile(item.id);
      }
      addToast(`Moved to Trash`);
      await refreshDriveData();
    } catch (err) {
      addToast(err.message || 'Failed to delete item', 'error');
    }
  };

  const restoreItem = async (item, isFolder) => {
    try {
      if (isFolder) {
        await folderService.restoreFolder(item.id);
      } else {
        await fileService.restoreFile(item.id);
      }
      addToast(`Restored successfully`);
      await refreshDriveData();
    } catch (err) {
      addToast(err.message || 'Failed to restore item', 'error');
    }
  };

  const deletePermanently = async (item, isFolder) => {
    try {
      if (isFolder) {
        await folderService.deletePermanently(item.id);
      } else {
        await fileService.deletePermanently(item.id, item.storageKey);
      }
      addToast(`Permanently deleted`);
      await refreshDriveData();
    } catch (err) {
      addToast(err.message || 'Failed to delete permanently', 'error');
    }
  };

  const emptyTrash = async () => {
    if (!authUser) return;
    try {
      await trashService.emptyTrash(authUser.id);
      addToast(`Trash emptied`);
      await refreshDriveData();
    } catch (err) {
      addToast('Failed to empty trash', 'error');
    }
  };

  const getItemPermission = useCallback(
    (item, isFolder = false) => {
      if (!item || !authUser) return 'none';
      const resourceType = isFolder ? 'folder' : 'file';
      return shareService.getResourcePermission(
        resourceType,
        item.id,
        authUser.id,
        files,
        folders,
        []
      );
    },
    [authUser, files, folders]
  );

  // Dynamic Storage calculations from Supabase storageService
  const storageInfo = useMemo(() => {
    if (storageData) return storageData;
    const totalBytes = activeUser.totalStorageBytes || fallbackUser.totalStorageBytes;
    const activeFiles = files.filter((f) => !f.isTrash);
    const usedBytes = activeFiles.reduce((acc, file) => acc + (file.size || 0), 0);
    const usedGB = (usedBytes / (1024 * 1024 * 1024)).toFixed(1);
    const totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(1);
    const freeGB = (totalGB - usedGB).toFixed(1);
    const percentage = Math.min(100, Math.max(2, (usedBytes / totalBytes) * 100));

    return {
      usedBytes,
      totalBytes,
      usedGB,
      totalGB,
      freeGB,
      percentage,
      formattedText: `${freeGB} GB left of ${totalGB} GB`,
    };
  }, [files, activeUser, storageData]);

  return (
    <DriveContext.Provider
      value={{
        files,
        folders,
        currentFolderId,
        setCurrentFolderId,
        searchQuery,
        setSearchQuery,
        viewMode,
        setViewMode,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        toasts,
        addToast,
        removeToast,
        modalState,
        openModal,
        closeModal,
        sidebarOpen,
        setSidebarOpen,
        createFolder,
        uploadFilesSimulated,
        renameItem,
        moveItem,
        toggleStar,
        deleteItem,
        restoreItem,
        deletePermanently,
        emptyTrash,
        getItemPermission,
        storageInfo,
        user: activeUser,
        session,
        authUser,
        authLoading,
        signIn,
        signUp,
        resetPassword,
        signOut,
        refreshDriveData,
      }}
    >
      {children}
    </DriveContext.Provider>
  );
};

export const useDrive = () => useContext(DriveContext);
