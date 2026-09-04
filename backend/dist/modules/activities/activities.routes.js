"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activities_controller_js_1 = require("./activities.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const router = (0, express_1.Router)();
router.get('/', auth_js_1.authenticate, activities_controller_js_1.getActivities);
exports.default = router;
