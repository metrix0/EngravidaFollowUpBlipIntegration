import { GoogleAuth } from "google-auth-library";
import { env } from "../config/env.js";

export async function getSheetTickets() {
    const auth = new GoogleAuth({
        credentials: {
            client_email: env.GOOGLE_CLIENT_EMAIL,
            private_key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"], //readonly scope!
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const encodedRange = encodeURIComponent(`${env.SHEET_NAME}!A:M`);

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.SPREADSHEET_ID}/values/${encodedRange}`;

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token.token}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Google Sheets error: ${res.status} - ${await res.text()}`);
    }

    const data = await res.json();

    const sheetRows = data.values || [];

    const headers = sheetRows[1];
    const rows = sheetRows.slice(2);

    if (!headers || rows.length === 0) {
        return [];
    }

    return rows.map((row) => {
        return Object.fromEntries(headers.map((header, index) => [header, row[index] || ""]));
    });


}