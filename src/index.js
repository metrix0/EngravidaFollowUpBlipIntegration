import express from "express";
import { env } from "./config/env.js";
import { followupRoute, sendManualFollowupRoute } from "./routes/followupRoute.js";
import { getFollowupState } from "./clients/jsonBinClient.js";
import { normalizeFollowupState } from "./services/followupService.js";
import { renderFollowupPage } from "./views/followupPage.js";
import { renderLoginPage } from "./views/loginPage.js";

const app = express();

app.use(express.json());

function dashboardAuth(req, res, next) {
    const cookie = req.headers.cookie || "";
    const isLoggedIn = cookie.includes("dashboard_auth=true");

    if (isLoggedIn) {
        return next();
    }

    res.send(renderLoginPage());
}

app.get("/", (req, res) => {
    res.json({
        ok: true,
        service: "engravida-followup",
    });
});

app.get("/api/test-active-message", async (req, res) => {
    try {
        const result = await sendBlipActiveMessage({
            phone: "5519988760900",
            templateName: env.BLIP_ACTIVE_TEMPLATE,
            params: {},
        });

        res.json({
            ok: true,
            result,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            ok: false,
            error: error.message,
        });
    }
});

app.post("/followup/login", express.urlencoded({ extended: false }), (req, res) => {
    if (req.body.password !== env.DASHBOARD_PASSWORD) {
        return res.status(401).send("Senha incorreta");
    }

    res.setHeader(
        "Set-Cookie",
        "dashboard_auth=true; Path=/followup; Max-Age=315360000; HttpOnly; SameSite=Lax"
    );

    res.redirect("/followup");
});

app.get("/followup", dashboardAuth, async (req, res) => {
    const state = normalizeFollowupState(await getFollowupState());

    const items = Object.entries(state.queue)
        .map(([phone, data]) => ({
            phone,
            ...data,
        }))
        .sort((a, b) => new Date(b.storageDate || b.queuedAt || 0) - new Date(a.updatedAt || a.queuedAt || 0));

    res.send(renderFollowupPage({ state, items }));
});

app.get("/readme", (req, res) => {
    res.redirect("https://github.com/metrix0/EngravidaFollowUpBlipIntegration");
});

app.get("/api/followup", followupRoute);
app.post("/api/followup", followupRoute);
app.post("/api/followup/send", sendManualFollowupRoute);

app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
});


