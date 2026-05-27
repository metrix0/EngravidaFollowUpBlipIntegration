import { getTicketsToFollowUp } from "./ticketsService.js";
import { sendBlipActiveMessage } from "../clients/blipClient.js";
import {
    getFollowupState,
    upsertQueuedFollowup,
    markFollowupAsSent,
} from "../clients/supabaseClient.js";
import { env } from "../config/env.js";

function buildFollowupMessage(ticket) {
    return "Olá! Vi que estávamos conversando sobre seu agendamento. Você ainda gostaria de continuar?";
}

export function normalizeFollowupState(rawState) {
    return {
        automatic_sending: false,
        queue: rawState || {},
    };
}

async function enqueueTickets(tickets) {
    let queued = 0;
    let updated = 0;
    let alreadySent = 0;

    const phonesToSendNow = [];

    for (const ticket of tickets) {
        const phone = ticket._contactIdentity;
        const ticketId = ticket._ticketId;
        const message = buildFollowupMessage(ticket);

        const result = await upsertQueuedFollowup({
            phone,
            ticketId,
            storageDate: ticket._storageDate,
            message,
        });

        if (result.skipped) {
            alreadySent++;
            continue;
        }

        if (result.updated) {
            updated++;
        } else {
            queued++;
        }

        phonesToSendNow.push(phone);
    }

    return {
        queued,
        updated,
        alreadySent,
        phonesToSendNow,
    };
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

    await sendBlipActiveMessage({
        phone,
        templateName: env.BLIP_ACTIVE_TEMPLATE,
        params: {
            "1": "Teste",
            "2": "Teste",
            "3": "Teste",
            "4": "Teste",
        },
    });

    await markFollowupAsSent({ phone });

    state.queue[phone] = {
        ...item,
        status: "sent",
        attempts: (item.attempts || 0) + 1,
        sentAt: new Date().toISOString(),
    };

    return {
        phone,
        ticketId: item.ticketId,
        to: `${phone}@wa.gw.msging.net`,
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

    const queueResult = await enqueueTickets(tickets);

    let results = [];

    if (state.automatic_sending) {
        results = await sendQueuedContacts(state, queueResult.phonesToSendNow);
    }

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
    const state = normalizeFollowupState(await getFollowupState());

    const uniquePhones = [...new Set(
        (phones || [])
            .map((phone) => String(phone).replace(/\D/g, "").trim())
            .filter(Boolean)
    )];

    const results = await sendQueuedContacts(state, uniquePhones);

    return {
        sent: results.filter((item) => item.status === "sent").length,
        errors: results.filter((item) => item.status === "error").length,
        results,
    };
}