import { env } from "../config/env.js";

export async function getFollowupState() {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${env.JSONBIN_ID}/latest`, {
        headers: {
            "X-Master-Key": env.JSONBIN_KEY,
        },
    });

    if (!res.ok) {
        throw new Error(`JSONBin read error: ${res.status} - ${await res.text()}`);
    }

    const data = await res.json();

    return data.record || {};
}

export async function updateFollowupState(state) {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${env.JSONBIN_ID}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Master-Key": env.JSONBIN_KEY,
        },
        body: JSON.stringify(state),
    });

    if (!res.ok) {
        throw new Error(`JSONBin update error: ${res.status} - ${await res.text()}`);
    }

    return res.json();
}