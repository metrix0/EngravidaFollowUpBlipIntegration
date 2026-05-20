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

    const text = await res.text();

    console.log("Blip response:", {
        status: res.status,
        body: text,
    });

    return text ? JSON.parse(text) : null;}

export async function sendBlipActiveMessage({ phone, templateName, params = {} }) {
    const res = await fetch(`https://${env.BLIP_CONTRACT_ID}.http.msging.net/commands`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Key ${env.BLIP_KEY}`,
        },
        body: JSON.stringify({
            id: crypto.randomUUID(),
            to: "postmaster@activecampaign.msging.net",
            method: "set",
            uri: "/campaign/full",
            type: "application/vnd.iris.activecampaign.full-campaign+json",
            resource: {
                campaign: {
                    name: crypto.randomUUID(),
                    campaignType: "Individual",
                    masterstate: "fluxocampanhaativa@msging.net",
                    flowId: env.BLIP_ACTIVE_FLOW_ID,
                    stateId: env.BLIP_ACTIVE_STATE_ID,
                },
                audience: {
                    recipient: `+${String(phone).replace(/\D/g, "")}`,
                    messageParams: params,
                },
                message: {
                    messageTemplate: templateName,
                    messageParams: Object.keys(params),
                    channelType: "WhatsApp",
                },
            },
        }),
    });

    if (!res.ok) {
        throw new Error(`Blip active message error: ${res.status} - ${await res.text()}`);
    }

    const text = await res.text();

    console.log("Blip active response:", {
        status: res.status,
        body: text,
    });

    return text ? JSON.parse(text) : null;
}