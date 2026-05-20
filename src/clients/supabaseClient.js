import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { env } from "../config/env.js";

const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
        realtime: {
            transport: ws,
        },
    }
);

export async function getFollowupState() {
    const { data, error } = await supabase
        .from("followups")
        .select("*");

    if (error) {
        throw new Error(`Supabase read error: ${error.message}`);
    }

    return Object.fromEntries(
        data.map((item) => [
            item.phone,
            {
                ticketId: item.ticket_id,
                phone: item.phone,
                status: item.status,
                attempts: item.attempts,
                storageDate: item.storage_date,
                queuedAt: item.queued_at,
                updatedAt: item.updated_at,
                sentAt: item.sent_at,
                message: item.message,
            },
        ])
    );
}

export async function upsertQueuedFollowup({ phone, ticketId, storageDate, message }) {
    const { data: existing, error: existingError } = await supabase
        .from("followups")
        .select("*")
        .eq("phone", phone)
        .maybeSingle();

    if (existingError) {
        throw new Error(`Supabase existing read error: ${existingError.message}`);
    }

    if (existing?.status === "sent") {
        return { skipped: true, reason: "already_sent" };
    }

    const { error } = await supabase
        .from("followups")
        .upsert({
            phone,
            ticket_id: ticketId,
            status: "queued",
            attempts: existing?.attempts || 0,
            storage_date: storageDate,
            updated_at: new Date().toISOString(),
            message,
        });

    if (error) {
        throw new Error(`Supabase upsert error: ${error.message}`);
    }

    return { skipped: false };
}

export async function markFollowupAsSent({ phone }) {
    const { data: existing, error: existingError } = await supabase
        .from("followups")
        .select("*")
        .eq("phone", phone)
        .maybeSingle();

    if (existingError) {
        throw new Error(`Supabase existing read error: ${existingError.message}`);
    }

    const { error } = await supabase
        .from("followups")
        .update({
            status: "sent",
            attempts: (existing?.attempts || 0) + 1,
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("phone", phone);

    if (error) {
        throw new Error(`Supabase update sent error: ${error.message}`);
    }
}