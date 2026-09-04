"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const env_js_1 = require("./config/env.js");
const index_js_1 = __importDefault(require("./routes/index.js"));
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const rateLimiter_js_1 = require("./middleware/rateLimiter.js");
const errors_js_1 = require("./utils/errors.js");
const app = (0, express_1.default)();
// Security Header Setup
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
}));
// CORS configuration
const sanitizeOrigin = (url) => {
    if (!url)
        return '';
    try {
        const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
        return parsed.origin;
    }
    catch (e) {
        return url.split('/')[0];
    }
};
const configuredFrontend = sanitizeOrigin(env_js_1.env.FRONTEND_URL);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin)
            return callback(null, true);
        const cleanOrigin = sanitizeOrigin(origin);
        if (cleanOrigin === configuredFrontend ||
            cleanOrigin === 'https://upfiles.vercel.app' ||
            cleanOrigin.endsWith('.vercel.app') ||
            cleanOrigin.includes('localhost') ||
            cleanOrigin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Link-Password'],
}));
// Logging & Rate Limiting
if (env_js_1.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
app.use(rateLimiter_js_1.globalLimiter);
// Body parsing
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'clouddrive-api', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'clouddrive-api', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api', index_js_1.default);
// 404 Handler
app.use((req, res, next) => {
    next(new errors_js_1.NotFoundError(`Route ${req.originalUrl} not found`));
});
// Central Error Handler
app.use(errorHandler_js_1.errorHandler);
exports.default = app;
