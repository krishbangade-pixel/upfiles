import { fileService } from './fileService';
import { folderService } from './folderService';
import { getFileTypeCategory } from '../utils/formatters';

export const searchService = {
  search: async ({ query = '', category = 'All', sortBy = 'name', sortOrder = 'asc' }) => {
    await new Promise((res) => setTimeout(res, 100));
    
    const [allFiles, allFolders] = await Promise.all([
      fileService.getAllFiles(),
      folderService.getAllFolders(),
    ]);

    const q = query.trim().toLowerCase();

    let matchedFiles = allFiles.filter((f) => f.name.toLowerCase().includes(q));
    let matchedFolders = allFolders.filter((f) => f.name.toLowerCase().includes(q));

    // Category Filter
    if (category !== 'All') {
      const catKey = category.toLowerCase();
      matchedFiles = matchedFiles.filter((f) => {
        const fileCat = getFileTypeCategory(f.name, f.type);
        if (catKey === 'files') return true;
        if (catKey === 'folders') return false;
        if (catKey === 'images') return fileCat === 'image';
        if (catKey === 'videos') return fileCat === 'video';
        if (catKey === 'documents') return fileCat === 'document' || fileCat === 'pdf';
        if (catKey === 'pdfs') return fileCat === 'pdf';
        return fileCat === catKey;
      });

      if (catKey !== 'all' && catKey !== 'folders') {
        matchedFolders = []; // If filtering specifically by file types, hide folders
      }
    }

    // Sorting
    const sortFn = (a, b) => {
      let valA = a[sortBy] || a.name;
      let valB = b[sortBy] || b.name;

      if (sortBy === 'dateModified' || sortBy === 'lastModified') {
        valA = new Date(a.lastModified || a.createdAt || 0).getTime();
        valB = new Date(b.lastModified || b.createdAt || 0).getTime();
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    };

    matchedFiles.sort(sortFn);
    matchedFolders.sort(sortFn);

    return {
      files: matchedFiles,
      folders: matchedFolders,
      total: matchedFiles.length + matchedFolders.length,
    };
  }
};
