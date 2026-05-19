import { getTicketsToFollowUp } from "./ticketsService.js";
import { sendBlipMessage } from "../clients/blipClient.js";
import { getFollowupState, updateFollowupState } from "../clients/jsonBinClient.js";

function buildWhatsappIdentity(contactIdentity) {
    if (contactIdentity.includes("@")) {
        return contactIdentity;
    }

    return `${contactIdentity}@wa.gw.msging.net`;
}

export async function runFollowups() {
    const tickets = await getTicketsToFollowUp();
    const followups = await getFollowupState();

    const results = [];

    const ticket = tickets[0];
    // for (const ticket of tickets) {
        const ticketId = ticket._ticketId;
        //const to = buildWhatsappIdentity(ticket._contactIdentity);
        const to = buildWhatsappIdentity(5519988760900);


        try {
            await sendBlipMessage({
                to,
                content: buildFollowupMessage(ticket),
            });

            followups[ticketId] = {
                ticketId,
                attempts: (followups[ticketId]?.attempts || 0) + 1,
                sentAt: new Date().toISOString(),
                storageDate: ticket._storageDate,
                phone: ticket._contactIdentity,

            };

            results.push({
                ticketId,
                to,
                status: "sent",
            });
        } catch (error) {
            results.push({
                ticketId,
                to,
                status: "error",
                error: error.message,
            });
        }
    // }

    await updateFollowupState(followups);

    return {
        candidates: tickets.length,
        sent: results.filter((item) => item.status === "sent").length,
        errors: results.filter((item) => item.status === "error").length,
        results,
    };
}

function buildFollowupMessage(ticket) {
    return "Olá! Vi que estávamos conversando sobre seu agendamento. Você ainda gostaria de continuar?";
}