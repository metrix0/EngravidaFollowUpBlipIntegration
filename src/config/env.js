import dotenv from "dotenv";

dotenv.config();

function required(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required env variable: ${name}`);
    }

    return value;
}

export const env = {
    PORT: Number(process.env.PORT || 3000),

    CRON_SECRET: required("CRON_SECRET"),

    SPREADSHEET_ID: required("SPREADSHEET_ID"),
    SHEET_NAME: required("SHEET_NAME"),
    GOOGLE_CLIENT_EMAIL: required("GOOGLE_CLIENT_EMAIL"),
    GOOGLE_PRIVATE_KEY: required("GOOGLE_PRIVATE_KEY"),

    JSONBIN_ID: required("JSONBIN_ID"),
    JSONBIN_KEY: required("JSONBIN_KEY"),

    BLIP_CONTRACT_ID: required("BLIP_CONTRACT_ID"),
    BLIP_KEY: required("BLIP_KEY"),

    BLIP_ACTIVE_MASTERSTATE: required("BLIP_ACTIVE_MASTERSTATE"),
    BLIP_ACTIVE_TEMPLATE: required("BLIP_ACTIVE_TEMPLATE"),
    BLIP_ACTIVE_FLOW_ID: required("BLIP_ACTIVE_FLOW_ID"),
    BLIP_ACTIVE_STATE_ID: required("BLIP_ACTIVE_STATE_ID"),

    FOLLOWUP_AFTER_DAYS: Number(process.env.FOLLOWUP_AFTER_DAYS || 9),
    IGNORE_BEFORE_DATE: process.env.IGNORE_BEFORE_DATE || "2026-05-16",

    DASHBOARD_PASSWORD: required("DASHBOARD_PASSWORD"),

    SUPABASE_URL: required("SUPABASE_URL"),
    SUPABASE_SERVICE_ROLE_KEY: required("SUPABASE_SERVICE_ROLE_KEY"),
};