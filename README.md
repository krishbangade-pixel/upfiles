# ☁️ UpFiles

### Cloud-Based Media & File Storage Platform

UpFiles is a modern cloud-based file storage and sharing web application inspired by the core functionality of platforms like Google Drive.

It allows users to securely upload, organize, manage, search, and share files from anywhere. The application supports folders, media uploads, user-to-user sharing, public share links, starred files, recent files, and trash management.

---

## 🚀 Live Application

**Frontend:**  
https://upfiles.vercel.app

> The frontend is deployed on Vercel and communicates with the production Node.js/Express backend.

---

## ✨ Features

### 🔐 Authentication
- User registration and login
- Secure authenticated sessions
- User-specific files and folders
- Protected API routes

### 📁 File & Folder Management
- Create folders
- Nested folder structure
- Rename files and folders
- Move files between folders
- Delete files and folders
- Breadcrumb navigation
- Grid and list views

### ☁️ Cloud File Storage
- Upload images
- Upload videos
- Upload documents and other supported files
- Persistent cloud storage
- File metadata stored separately from file content
- File size and type tracking

### 🔗 File Sharing
- Share files with registered users
- Viewer and Editor permissions
- Revoke access
- View users who have access
- Public share links
- Unique share tokens
- Optional link expiration
- Optional password-protected links

### 🔎 Search & Organization
- Search files by name
- Sort files
- Filter files
- Star important files
- Recent files section

### 🗑️ Trash
- Soft-delete files
- View deleted files
- Restore deleted files
- Prevent accidental permanent deletion

### 🛡️ Security
- Server-side authorization
- User-based access control
- Private cloud storage
- Temporary signed URLs
- Input validation
- CORS protection
- Environment-based secrets
- Protected API endpoints

---

# 🏗️ System Architecture

```text
                   ┌─────────────────────┐
                   │      User           │
                   │     Browser         │
                   └──────────┬──────────┘
                              │
                              │ HTTPS
                              ▼
                   ┌─────────────────────┐
                   │   React Frontend    │
                   │      Vercel         │
                   └──────────┬──────────┘
                              │
                              │ REST API
                              ▼
                   ┌─────────────────────┐
                   │ Node.js + Express   │
                   │      Render         │
                   └──────────┬──────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
          ┌──────────────────┐   ┌──────────────────┐
          │ PostgreSQL       │   │ Supabase Storage │
          │    Supabase      │   │                  │
          │                  │   │ Images           │
          │ Users            │   │ Videos           │
          │ Files            │   │ Documents        │
          │ Folders          │   │ Media            │
          │ Shares           │   │                  │
          └──────────────────┘   └──────────────────┘
