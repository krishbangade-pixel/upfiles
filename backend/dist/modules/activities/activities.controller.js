"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivities = getActivities;
const supabase_js_1 = require("../../config/supabase.js");
async function getActivities(req, res, next) {
    try {
        const user = req.user;
        const limit = parseInt(req.query.limit) || 50;
        const { data: activities, error } = await supabase_js_1.supabaseAdmin
            .from('activities')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error)
            throw new Error(error.message);
        res.status(200).json({
            data: (activities || []).map((a) => ({
                id: a.id,
                action: a.action,
                resourceType: a.resource_type,
                resourceId: a.resource_id,
                context: a.context,
                createdAt: a.created_at,
            })),
            message: 'Activities fetched',
        });
    }
    catch (err) {
        next(err);
    }
}
