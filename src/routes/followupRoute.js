import { env } from "../config/env.js";
import { runFollowups } from "../services/followupService.js";

export async function followupRoute(req, res) {
    const secret = req.query.secret || req.headers["x-cron-secret"];

    // if (secret !== env.CRON_SECRET) {
    //     return res.status(401).json({
    //         ok: false,
    //         error: "Unauthorized",
    //     });
    // }

    try {
        const result = await runFollowups();

        return res.json({
            ok: true,
            ...result,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            ok: false,
            error: error.message,
        });
    }
}