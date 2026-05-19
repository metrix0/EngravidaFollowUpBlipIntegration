import { getTicketsToFollowUp } from "./ticketsService.js";
import { sendBlipMessage } from "../clients/blipClient.js";
import { getFollowupState, updateFollowupState } from "../clients/jsonBinClient.js";

function buildWhatsappIdentity(contactIdentity) {
    const identity = String(contactIdentity);

    if (identity.includes("@")) {
        return identity;
    }

    return `${identity}@wa.gw.msging.net`;
}

export async function runFollowups() {
    const tickets = await getTicketsToFollowUp();
    const followups = await getFollowupState();

    const results = [];

    const ticket = tickets[0];
    // for (const ticket of tickets) {
        const ticketId = ticket._ticketId;
        //const to = buildWhatsappIdentity(ticket._contactIdentity);
        const to = "5511988576886@wa.gw.msging.net";

        console.log({
            contract: process.env.BLIP_CONTRACT_ID,
            to,
            content: buildFollowupMessage(ticket),
        });

        try {
            await sendBlipMessage({
                to,
                content: buildFollowupMessage(ticket),
            });

            const phone = ticket._contactIdentity;

            followups[phone] = {
                ticketId,
                attempts: (followups[phone]?.attempts || 0) + 1,
                sentAt: new Date().toISOString(),
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