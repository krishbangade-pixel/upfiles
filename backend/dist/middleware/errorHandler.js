"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_js_1 = require("../utils/errors.js");
const zod_1 = require("zod");
function errorHandler(err, req, res, next) {
    let statusCode = 500;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    if (err instanceof errors_js_1.AppError) {
        statusCode = err.statusCode;
        code = err.code;
        message = err.message;
    }
    else if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
        message = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    }
    else if (err.message) {
        statusCode = err.status || err.statusCode || 500;
        message = err.message;
    }
    if (statusCode >= 500) {
        console.error('[Error Handler]', err);
    }
    res.status(statusCode).json({
        error: {
            code,
            message,
        },
    });
}
