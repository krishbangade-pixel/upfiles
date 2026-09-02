export const MOCK_USERS = [
  { id: 'u1', name: 'Alex Vance', email: 'alex.vance@cloudvault.io', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', role: 'Editor' },
  { id: 'u2', name: 'Sarah Jenkins', email: 'sarah.j@cloudvault.io', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', role: 'Viewer' },
  { id: 'u3', name: 'Rahul Sharma', email: 'rahul.s@cloudvault.io', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', role: 'Editor' },
  { id: 'u4', name: 'Emma Watson', email: 'emma.w@cloudvault.io', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150', role: 'Viewer' },
];

export const MOCK_FOLDERS = [
  {
    id: 'f-1',
    name: 'Documents',
    fileCount: 24,
    size: 279172864, // ~266 MB
    parentId: null,
    createdAt: '2026-01-10T10:00:00Z',
    starred: true,
    members: [MOCK_USERS[0], MOCK_USERS[1]],
    color: '#7C5CFF', // Purple
  },
  {
    id: 'f-2',
    name: 'Music',
    fileCount: 102,
    size: 10737418240, // 10 GB
    parentId: null,
    createdAt: '2026-01-12T14:20:00Z',
    starred: false,
    members: [],
    color: '#4F8EF7', // Blue
  },
  {
    id: 'f-3',
    name: 'Work Projects',
    fileCount: 84,
    size: 15032385536, // ~14 GB
    parentId: null,
    createdAt: '2026-01-15T09:15:00Z',
    starred: true,
    members: [MOCK_USERS[2], MOCK_USERS[3]],
    color: '#7C5CFF', // Purple
  },
  {
    id: 'f-4',
    name: 'Personal Media',
    fileCount: 245,
    size: 85899345920, // 80 GB
    parentId: null,
    createdAt: '2026-01-20T11:45:00Z',
    starred: false,
    members: [MOCK_USERS[0]],
    color: '#F59E0B', // Orange
  },
  {
    id: 'f-5',
    name: 'Backup',
    fileCount: 22,
    size: 15032385536, // 14 GB
    parentId: null,
    createdAt: '2026-02-01T16:30:00Z',
    starred: false,
    members: [],
    color: '#22C55E', // Green
  },
  {
    id: 'f-6',
    name: 'Books & Resources',
    fileCount: 106,
    size: 1288490188, // ~1.2 GB
    parentId: null,
    createdAt: '2026-02-05T08:00:00Z',
    starred: false,
    members: [MOCK_USERS[2]],
    color: '#EF4444', // Red
  },
  {
    id: 'f-7',
    name: 'Web Project',
    fileCount: 12,
    size: 246960640,
    parentId: 'f-3', // Nested in Work Projects
    createdAt: '2026-02-12T13:10:00Z',
    starred: true,
    members: [MOCK_USERS[2], MOCK_USERS[3]],
    color: '#7C5CFF',
  }
];

export const MOCK_FILES = [
  {
    id: 'file-1',
    name: 'Proposal.docx',
    folderId: 'f-1',
    size: 3040870, // 2.9 MB
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: 'docx',
    lastModified: '2026-02-25T14:30:00Z',
    members: [MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[2], MOCK_USERS[3]],
    starred: true,
    sharedWithMe: false,
    owner: { name: 'You', email: 'you@cloudvault.io' },
    url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=1000',
  },
  {
    id: 'file-2',
    name: 'Background.jpg',
    folderId: 'f-4',
    size: 3670016, // 3.5 MB
    type: 'image/jpeg',
    extension: 'jpg',
    lastModified: '2026-02-24T09:12:00Z',
    members: [MOCK_USERS[0], MOCK_USERS[1]],
    starred: false,
    sharedWithMe: true,
    owner: MOCK_USERS[0],
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 'file-3',
    name: 'Apex website.fig',
    folderId: 'f-7',
    size: 24641536, // 23.5 MB
    type: 'application/figma',
    extension: 'fig',
    lastModified: '2026-02-22T17:45:00Z',
    members: [MOCK_USERS[2], MOCK_USERS[3], MOCK_USERS[0]],
    starred: true,
    sharedWithMe: false,
    owner: { name: 'You', email: 'you@cloudvault.io' },
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=1000',
  },
  {
    id: 'file-4',
    name: 'Illustration.ai',
    folderId: 'f-3',
    size: 7549747, // 7.2 MB
    type: 'application/illustrator',
    extension: 'ai',
    lastModified: '2026-02-20T11:20:00Z',
    members: [MOCK_USERS[1], MOCK_USERS[2]],
    starred: false,
    sharedWithMe: true,
    owner: MOCK_USERS[1],
    url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=1000',
  },
  {
    id: 'file-5',
    name: 'Quarterly_Financial_Report.pdf',
    folderId: 'f-1',
    size: 13002342, // 12.4 MB
    type: 'application/pdf',
    extension: 'pdf',
    lastModified: '2026-02-18T15:00:00Z',
    members: [MOCK_USERS[0]],
    starred: true,
    sharedWithMe: false,
    owner: { name: 'You', email: 'you@cloudvault.io' },
    url: '#',
  },
  {
    id: 'file-6',
    name: 'Product_Demo_Video.mp4',
    folderId: 'f-4',
    size: 88286822, // 84.2 MB
    type: 'video/mp4',
    extension: 'mp4',
    lastModified: '2026-02-15T18:10:00Z',
    members: [MOCK_USERS[2], MOCK_USERS[3]],
    starred: false,
    sharedWithMe: true,
    owner: MOCK_USERS[2],
    url: 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
  },
  {
    id: 'file-7',
    name: 'Database_Backup_2026.zip',
    folderId: 'f-5',
    size: 152043520, // 145 MB
    type: 'application/zip',
    extension: 'zip',
    lastModified: '2026-02-10T08:30:00Z',
    members: [MOCK_USERS[0]],
    starred: false,
    sharedWithMe: false,
    owner: { name: 'You', email: 'you@cloudvault.io' },
    url: '#',
  },
  {
    id: 'file-8',
    name: 'Brand_Guidelines_V2.pdf',
    folderId: 'f-3',
    size: 19503513, // 18.6 MB
    type: 'application/pdf',
    extension: 'pdf',
    lastModified: '2026-02-08T10:15:00Z',
    members: [MOCK_USERS[1]],
    starred: true,
    sharedWithMe: true,
    owner: MOCK_USERS[1],
    url: '#',
  },
  {
    id: 'file-9',
    name: 'Marketing_Budget_2026.xlsx',
    folderId: 'f-1',
    size: 4299161, // 4.1 MB
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: 'xlsx',
    lastModified: '2026-02-04T12:00:00Z',
    members: [MOCK_USERS[2]],
    starred: false,
    sharedWithMe: false,
    owner: { name: 'You', email: 'you@cloudvault.io' },
    url: '#',
  },
  {
    id: 'file-10',
    name: 'Podcast_Episode_12.mp3',
    folderId: 'f-2',
    size: 34393292, // 32.8 MB
    type: 'audio/mpeg',
    extension: 'mp3',
    lastModified: '2026-01-29T16:40:00Z',
    members: [MOCK_USERS[0]],
    starred: false,
    sharedWithMe: false,
    owner: { name: 'You', email: 'you@cloudvault.io' },
    url: '#',
  }
];

export const MOCK_TRASH = [
  {
    id: 'trash-1',
    name: 'Old_Design_Draft.fig',
    type: 'file',
    size: 12582912,
    deletedAt: '2026-02-20T10:00:00Z',
    originalLocation: 'My Drive / Work Projects',
    item: {
      id: 'trash-file-1',
      name: 'Old_Design_Draft.fig',
      extension: 'fig',
      size: 12582912,
    }
  },
  {
    id: 'trash-2',
    name: 'Archived_Notes.txt',
    type: 'file',
    size: 45056,
    deletedAt: '2026-02-15T14:20:00Z',
    originalLocation: 'My Drive / Documents',
    item: {
      id: 'trash-file-2',
      name: 'Archived_Notes.txt',
      extension: 'txt',
      size: 45056,
    }
  }
];

export const MOCK_STORAGE_STATS = {
  totalBytes: 161061273600, // 150 GB
  usedBytes: 139586437120, // 130 GB
  percentage: 85,
  categories: [
    { name: 'Media', sizeGB: 80, color: '#7C5CFF', icon: 'Film' },
    { name: 'Documents', sizeGB: 26, color: '#4F8EF7', icon: 'FileText' },
    { name: 'Music', sizeGB: 10, color: '#F59E0B', icon: 'Music' },
    { name: 'Other', sizeGB: 14, color: '#22C55E', icon: 'Folder' },
  ]
};

export const MOCK_ACTIVITY_DATA = [
  { day: 'Mon', Media: 12, Photos: 18, Docs: 8 },
  { day: 'Tue', Media: 25, Photos: 14, Docs: 15 },
  { day: 'Wed', Media: 18, Photos: 28, Docs: 10 },
  { day: 'Thu', Media: 35, Photos: 20, Docs: 22 },
  { day: 'Fri', Media: 28, Photos: 32, Docs: 16 },
  { day: 'Sat', Media: 45, Photos: 24, Docs: 12 },
  { day: 'Sun', Media: 30, Photos: 15, Docs: 9 },
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', title: 'File Shared', message: 'Sarah shared "Quarterly_Financial_Report.pdf" with you.', time: '10 mins ago', read: false },
  { id: 'n2', title: 'Upload Complete', message: 'File upload "Background.jpg" completed successfully.', time: '2 hours ago', read: false },
  { id: 'n3', title: 'Folder Created', message: 'Folder "Web Project" was created in Work Projects.', time: '1 day ago', read: true },
  { id: 'n4', title: 'New Shared Access', message: 'Rahul added you to "Apex website.fig"', time: '2 days ago', read: true },
];
