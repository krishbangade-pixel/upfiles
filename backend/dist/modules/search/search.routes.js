"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_controller_js_1 = require("./search.controller.js");
const auth_js_1 = require("../../middleware/auth.js");
const router = (0, express_1.Router)();
router.get('/', auth_js_1.authenticate, search_controller_js_1.searchResources);
exports.default = router;
