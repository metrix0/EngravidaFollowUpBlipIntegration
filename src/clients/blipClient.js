import crypto from "crypto";
import { env } from "../config/env.js";

export async function sendBlipMessage({ to, content }) {
    const res = await fetch(`https://${env.BLIP_CONTRACT_ID}.http.msging.net/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Key ${env.BLIP_KEY}`,
        },
        body: JSON.stringify({
            id: crypto.randomUUID(),
            to,
            type: "text/plain",
            content,
        }),
    });

    if (!res.ok) {
        throw new Error(`Blip send error: ${res.status} - ${await res.text()}`);
    }

    return res.json().catch(() => null);
}