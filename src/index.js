import express from "express";
import { env } from "./config/env.js";
import { followupRoute } from "./routes/followupRoute.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        ok: true,
        service: "engravida-followup",
    });
});

app.get("/api/followup", followupRoute);
app.post("/api/followup", followupRoute);

app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
});