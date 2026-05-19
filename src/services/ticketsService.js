import { getSheetTickets } from "../clients/googleSheetsClient.js";
import { normalize } from "../utils/normalize.js";
import { daysAgo, isAfterDate } from "../utils/date.js";
import { env } from "../config/env.js";

function getTicketId(ticket) {
    return String(ticket["Número do Ticket"] || "").trim();
}

function getStorageDate(ticket) {
    return ticket["Data Fim"] || "";
}

function getTags(ticket) {
    return normalize(ticket["Tag de Fechamento"] || "");
}

function hasSchedulingTag(tags) {
    return tags.includes("nao agendou") || tags.includes("sem retorno");
}

function isAlreadyScheduled(tags) {
    return tags.includes("agendado");
}

function getContactIdentity(ticket) {
    return String(ticket["Telefone"] || "").replace(/\D/g, "").trim();
}

export async function getTicketsToFollowUp() {
    const tickets = await getSheetTickets();

    const result = [];

    for (let i = tickets.length - 1; i >= 0; i--) {
        const ticket = tickets[i];

        const ticketId = getTicketId(ticket);
        const storageDate = getStorageDate(ticket);
        const tags = getTags(ticket);
        const contactIdentity = getContactIdentity(ticket);

        if (!ticketId) continue;

        if (!isAfterDate(storageDate, env.IGNORE_BEFORE_DATE)) {
            continue;
        }

        const shouldFollowUp =
            ticketId &&
            contactIdentity &&
            daysAgo(storageDate) === env.FOLLOWUP_AFTER_DAYS &&
            hasSchedulingTag(tags) &&
            !isAlreadyScheduled(tags);

        if (shouldFollowUp) {
            result.push({
                ...ticket,
                _ticketId: ticketId,
                _contactIdentity: contactIdentity,
                _storageDate: storageDate,
                _tags: tags,
            });
        }
    }

    return result;
}