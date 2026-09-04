"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const env_js_1 = require("./config/env.js");
const PORT = env_js_1.env.PORT || 8080;
const server = app_js_1.default.listen(PORT, () => {
    console.log(`⚡️ CloudDrive Express Server running at http://localhost:${PORT}`);
    console.log(`🔒 Connected to Supabase URL: ${env_js_1.env.SUPABASE_URL}`);
    console.log(`🌐 Allowing CORS for: ${env_js_1.env.FRONTEND_URL}`);
});
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
exports.default = server;
