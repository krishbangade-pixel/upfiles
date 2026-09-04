"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeFilename = sanitizeFilename;
exports.getExtension = getExtension;
exports.formatSizeBytes = formatSizeBytes;
const path_1 = __importDefault(require("path"));
function sanitizeFilename(filename) {
    // Prevent path traversal and remove dangerous control characters
    const basename = path_1.default.basename(filename);
    return basename.replace(/[^\w\s\.\-\(\)]/gi, '_').trim() || 'unnamed';
}
function getExtension(filename) {
    const parts = filename.split('.');
    if (parts.length < 2)
        return 'bin';
    return parts.pop().toLowerCase();
}
function formatSizeBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}
