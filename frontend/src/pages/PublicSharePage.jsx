import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { FileIcon } from '../components/files/FileIcon';
import {
  Cloud,
  Download,
  Lock,
  AlertTriangle,
  FileText,
  Calendar,
  HardDrive,
  Loader2,
  Folder,
  File,
  Eye,
  ArrowLeft,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const PublicSharePage = () => {
  const { token } = useParams();

  // Resource state
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null); // null | 'NOT_FOUND' | 'EXPIRED' | 'DELETED' | 'ERROR'
  const [errorMsg, setErrorMsg] = useState('');

  // Password state
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  // Resolved Resource Data
  const [resourceType, setResourceType] = useState(null); // 'file' | 'folder'
  const [fileData, setFileData] = useState(null);
  const [folderData, setFolderData] = useState(null);
  const [folderItems, setFolderItems] = useState([]);
  const [activePreviewFile, setActivePreviewFile] = useState(null);

  const fetchSharedResource = async (providedPassword = '') => {
    setLoading(true);
    setErrorState(null);
    setErrorMsg('');
    setPasswordError('');

    try {
      const headers = {};
      if (providedPassword) {
        headers['X-Link-Password'] = providedPassword;
      }

      const res = await api.get(`/link/${token}`, { headers });
      const data = res.data;

      setIsPasswordRequired(false);
      setResourceType(data.resourceType);

      if (data.resourceType === 'file') {
        setFileData(data.file);
        setActivePreviewFile(data.file);
      } else if (data.resourceType === 'folder') {
        setFolderData(data.folder);
        setFolderItems(data.items || []);
      }
    } catch (err) {
      console.error('Fetch shared resource error:', err.message);

      if (err.message.includes('Password required') || err.message.includes('PASSWORD_REQUIRED')) {
        setIsPasswordRequired(true);
        if (providedPassword) {
          setPasswordError('Incorrect link password. Please try again.');
        }
      } else if (err.message.includes('expired') || err.message.includes('Expired')) {
        setErrorState('EXPIRED');
        setErrorMsg('This shared link has expired and is no longer available.');
      } else if (err.message.includes('not found') || err.message.includes('invalid') || err.message.includes('404')) {
        setErrorState('NOT_FOUND');
        setErrorMsg('This shared link was not found or has been removed.');
      } else if (err.message.includes('unavailable') || err.message.includes('deleted')) {
        setErrorState('DELETED');
        setErrorMsg('This item is no longer available.');
      } else {
        setErrorState('ERROR');
        setErrorMsg(err.message || 'Failed to load shared content.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSharedResource();
    }
  }, [token]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setVerifyingPassword(true);
    await fetchSharedResource(password);
    setVerifyingPassword(false);
  };

  const handleFileClickInFolder = async (item) => {
    if (item.isFolder) return;
    try {
      const headers = {};
      if (password) headers['X-Link-Password'] = password;
      const res = await api.get(`/link/${token}/file/${item.id}`, { headers });
      if (res.data) {
        setActivePreviewFile(res.data);
      }
    } catch (e) {
      console.error('Failed to load item from folder:', e);
    }
  };

  const handleDownload = (file) => {
    if (!file?.downloadUrl) return;
    const a = document.createElement('a');
    a.href = file.downloadUrl;
    a.download = file.name || 'download';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '--';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // -------------------------------------------------------------
  // 1. Loading State
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 bg-slate-900/80 backdrop-blur-2xl p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
            <Cloud className="w-8 h-8 fill-indigo-500/20 animate-pulse" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <p className="text-sm font-medium text-slate-300">Loading shared resource...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. Password Required State
  // -------------------------------------------------------------
  if (isPasswordRequired) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] pointer-events-none opacity-30 blur-[120px] bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-full" />
        
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Password Protected</h2>
            <p className="text-xs text-slate-400">
              This shared link is protected with a password. Please enter the password to view the content.
            </p>
          </div>

          {passwordError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Link Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoFocus
                className="w-full px-4 py-3 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={verifyingPassword || !password}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {verifyingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. Error States (Expired / Not Found / Deleted)
  // -------------------------------------------------------------
  if (errorState) {
    const isExpired = errorState === 'EXPIRED';
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-5">
          <div className="inline-flex p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            {isExpired ? <Clock className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
          </div>
          <h2 className="text-xl font-bold text-white">
            {isExpired ? 'Link Expired' : 'Item Not Found'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {errorMsg || 'This shared resource is not accessible.'}
          </p>

          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to CloudDrive Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const targetFile = activePreviewFile || fileData;
  const ext = (targetFile?.name ? targetFile.name.split('.').pop() : '').toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext);
  const isPdf = ext === 'pdf';
  const isVideo = ['mp4', 'mov', 'avi', 'webm'].includes(ext);

  // -------------------------------------------------------------
  // 4. Shared File / Folder View
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Navigation */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl text-white shadow-md shadow-indigo-500/20">
            <Cloud className="w-5 h-5 fill-white/20" />
          </div>
          <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            CloudDrive Public Share
          </span>
        </div>

        <Link
          to="/login"
          className="text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors shadow-md shadow-indigo-600/20"
        >
          Sign In
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Resource Header */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {resourceType === 'folder' ? (
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Folder className="w-6 h-6 fill-amber-500/20" />
              </div>
            ) : (
              <FileIcon type={ext} extension={ext} className="w-8 h-8" />
            )}
            <div>
              <h1 className="text-lg font-bold text-white">
                {resourceType === 'folder' ? folderData?.name : fileData?.name}
              </h1>
              <p className="text-xs text-slate-400">
                Shared via Public Link • {resourceType === 'folder' ? `${folderItems.length} items` : targetFile?.formattedSize || 'File'}
              </p>
            </div>
          </div>

          {resourceType === 'file' && targetFile?.downloadUrl && (
            <button
              onClick={() => handleDownload(targetFile)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download File
            </button>
          )}
        </div>

        {/* ----------------------------- FILE PREVIEW SECTION ----------------------------- */}
        {resourceType === 'file' && targetFile && (
          <div className="space-y-4">
            {/* Preview Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden min-h-[280px] max-h-[480px] flex items-center justify-center p-4 relative">
              {isImage && targetFile.downloadUrl ? (
                <img
                  src={targetFile.downloadUrl}
                  alt={targetFile.name}
                  className="max-h-[440px] w-auto object-contain rounded-xl shadow-md"
                />
              ) : isVideo && targetFile.downloadUrl ? (
                <video
                  key={targetFile.downloadUrl}
                  src={targetFile.downloadUrl}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  className="max-h-[440px] w-full rounded-xl shadow-md"
                >
                  Your browser does not support video playback.
                </video>
              ) : isPdf && targetFile.downloadUrl ? (
                <iframe
                  src={targetFile.downloadUrl}
                  title={targetFile.name}
                  className="w-full h-[440px] rounded-xl border-0"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <FileIcon type={ext} extension={ext} className="w-20 h-20" />
                  <p className="text-sm font-semibold text-white">{targetFile.name}</p>
                  <p className="text-xs text-slate-400">Preview not available for this file type</p>
                </div>
              )}
            </div>

            {/* File Metadata Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5" /> File size
                </span>
                <p className="font-semibold text-slate-200">{targetFile.formattedSize || '--'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Type
                </span>
                <p className="font-semibold text-slate-200 uppercase">{ext || 'FILE'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Created
                </span>
                <p className="font-semibold text-slate-200">{formatDate(targetFile.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Access
                </span>
                <p className="font-semibold text-indigo-400">Public Link</p>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------- FOLDER CONTENTS SECTION ----------------------------- */}
        {resourceType === 'folder' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
              <div className="px-4 py-3 bg-slate-900 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Name</span>
                <span>Type</span>
              </div>

              {folderItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleFileClickInFolder(item)}
                  className="flex items-center justify-between px-4 py-3 text-xs hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 truncate">
                    {item.isFolder ? (
                      <Folder className="w-4 h-4 text-amber-400 fill-amber-400/20 shrink-0" />
                    ) : (
                      <File className="w-4 h-4 text-indigo-400 shrink-0" />
                    )}
                    <span className="font-medium text-slate-200 truncate">{item.name}</span>
                  </div>
                  <span className="text-slate-500 uppercase text-[11px] font-semibold">
                    {item.isFolder ? 'Folder' : item.name.split('.').pop() || 'File'}
                  </span>
                </div>
              ))}

              {folderItems.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  This shared folder is empty.
                </div>
              )}
            </div>

            {/* Active File Preview inside Shared Folder */}
            {activePreviewFile && (
              <div className="mt-6 space-y-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-400" />
                    Preview: {activePreviewFile.name}
                  </h3>
                  {activePreviewFile.downloadUrl && (
                    <button
                      onClick={() => handleDownload(activePreviewFile)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  )}
                </div>

                <div className="bg-slate-950 p-4 rounded-xl flex items-center justify-center min-h-[220px]">
                  {activePreviewFile.name?.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i) && activePreviewFile.downloadUrl ? (
                    <img src={activePreviewFile.downloadUrl} alt={activePreviewFile.name} className="max-h-[300px] rounded-lg" />
                  ) : activePreviewFile.name?.match(/\.(mp4|mov|webm)$/i) && activePreviewFile.downloadUrl ? (
                    <video controls autoPlay key={activePreviewFile.downloadUrl} src={activePreviewFile.downloadUrl} className="max-h-[300px] w-full rounded-lg" />
                  ) : (
                    <div className="text-xs text-slate-400">Click download to view file contents</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
