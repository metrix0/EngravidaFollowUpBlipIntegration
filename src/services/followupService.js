import { getTicketsToFollowUp } from "./ticketsService.js";
import { sendBlipActiveMessage } from "../clients/blipClient.js";
import { env } from "../config/env.js";
import { getFollowupState, updateFollowupState } from "../clients/jsonBinClient.js";

function buildWhatsappIdentity(contactIdentity) {
    const identity = String(contactIdentity);

    if (identity.includes("@")) {
        return identity;
    }

    return `${identity}@wa.gw.msging.net`;
}

function buildFollowupMessage(ticket) {
    return "Olá! Vi que estávamos conversando sobre seu agendamento. Você ainda gostaria de continuar?";
}

export function normalizeFollowupState(rawState) {
    if (!rawState || typeof rawState !== "object" || Array.isArray(rawState)) {
        return {
            automatic_sending: false,
            queue: {},
        };
    }

    if (rawState.queue && typeof rawState.queue === "object") {
        return {
            automatic_sending: rawState.automatic_sending === true,
            queue: rawState.queue,
        };
    }

    const { automatic_sending = false, ...oldQueue } = rawState;

    return {
        automatic_sending: automatic_sending === true,
        queue: oldQueue,
    };
}

function enqueueTickets(state, tickets) {
    let queued = 0;
    let updated = 0;
    let alreadySent = 0;

    for (const ticket of tickets) {
        const phone = ticket._contactIdentity;
        const ticketId = ticket._ticketId;
        const message = buildFollowupMessage(ticket);
        const current = state.queue[phone];

        if (current?.status === "sent") {
            state.queue[phone] = {
                ...current,
                ticketId,
                phone,
                storageDate: ticket._storageDate,
                message,
                updatedAt: new Date().toISOString(),
            };

            alreadySent++;
            continue;
        }

        state.queue[phone] = {
            ticketId,
            phone,
            status: "queued",
            attempts: current?.attempts || 0,
            queuedAt: current?.queuedAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            storageDate: ticket._storageDate,
            message,
        };

        if (current) {
            updated++;
        } else {
            queued++;
        }
    }

    return { queued, updated, alreadySent };
}

async function sendQueuedPhone(state, phone) {
    const item = state.queue[phone];

    if (!item) {
        return {
            phone,
            status: "error",
            error: "Contact not found in queue",
        };
    }

    if (item.status === "sent") {
        return {
            phone,
            ticketId: item.ticketId,
            status: "skipped",
            reason: "already_sent",
        };
    }

    const to = buildWhatsappIdentity(phone);

    await sendBlipActiveMessage({
        phone,
        templateName: env.BLIP_ACTIVE_TEMPLATE,
        params: {},
    });

    state.queue[phone] = {
        ...item,
        status: "sent",
        attempts: (item.attempts || 0) + 1,
        sentAt: new Date().toISOString(),
    };

    return {
        phone,
        ticketId: item.ticketId,
        to,
        status: "sent",
    };
}

async function sendQueuedContacts(state, phones) {
    const results = [];

    for (const phone of phones) {
        try {
            const result = await sendQueuedPhone(state, phone);
            results.push(result);
        } catch (error) {
            results.push({
                phone,
                status: "error",
                error: error.message,
            });
        }
    }

    return results;
}

export async function runFollowups() {
    const tickets = await getTicketsToFollowUp();
    const state = normalizeFollowupState(await getFollowupState());

    const queueResult = enqueueTickets(state, tickets);

    let results = [];

    if (state.automatic_sending) {
        const queuedPhones = Object.entries(state.queue)
            .filter(([, item]) => item.status === "queued")
            .map(([phone]) => phone);

        results = await sendQueuedContacts(state, queuedPhones);
    }

    await updateFollowupState(state);

    return {
        automatic_sending: state.automatic_sending,
        candidates: tickets.length,
        queued: queueResult.queued,
        updated: queueResult.updated,
        alreadySent: queueResult.alreadySent,
        sent: results.filter((item) => item.status === "sent").length,
        errors: results.filter((item) => item.status === "error").length,
        results,
    };
}

export async function sendManualFollowups(phones) {
    console.log("starting manual followup")
    const state = normalizeFollowupState(await getFollowupState());
    console.log(state)
    const uniquePhones = [...new Set((phones || []).map((phone) => String(phone).replace(/\D/g, "").trim()).filter(Boolean))];
    console.log(uniquePhones)
    const results = await sendQueuedContacts(state, uniquePhones);
    console.log(results)
    await updateFollowupState(state);

    return {
        sent: results.filter((item) => item.status === "sent").length,
        errors: results.filter((item) => item.status === "error").length,
        results,
    };
}