"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storage_controller_js_1 = require("./storage.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const router = (0, express_1.Router)();
router.get('/usage', auth_js_1.authenticate, storage_controller_js_1.getStorageUsage);
exports.default = router;
