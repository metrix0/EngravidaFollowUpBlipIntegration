import express from "express";
import { env } from "./config/env.js";
import { followupRoute, sendManualFollowupRoute } from "./routes/followupRoute.js";
import { getFollowupState } from "./clients/jsonBinClient.js";
import { normalizeFollowupState } from "./services/followupService.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        ok: true,
        service: "engravida-followup",
    });
});

app.get("/followup", async (req, res) => {
    const state = normalizeFollowupState(await getFollowupState());

    const items = Object.entries(state.queue)
        .map(([phone, data]) => ({
            phone,
            ...data,
        }))
        .sort((a, b) => new Date(b.storageDate || b.queuedAt || 0) - new Date(a.updatedAt || a.queuedAt || 0));

    const queuedCount = items.filter((item) => item.status === "queued").length;
    const sentCount = items.filter((item) => item.status === "sent").length;

    const rows = items.map((item) => `
        <tr>
            <td>
                ${item.status === "queued" ? `<input type="checkbox" name="phone" value="${item.phone}" />` : ""}
            </td>
            <td><span class="phone">${item.phone || ""}</span></td>
            <td><span class="ticket">${parseInt(item.ticketId) || ""}</span></td>
            <td>
                <span class="status ${item.status === "sent" ? "sent" : "queued"}" style="white-space: nowrap">
                    ${item.status === "sent" ? "enviado" : "na fila"}
                </span>
            </td>
            <td><span class="attempts">${item.attempts || 0}</span></td>
            <td><span class="date">${item.storageDate ? new Date(item.storageDate).toLocaleDateString("pt-BR") : ""}</span></td>
            <td><span class="date">${item.sentAt ? new Date(item.sentAt).toLocaleString("pt-BR") : "-"}</span></td>
            <td><div class="message">${item.message || ""}</div></td>
        </tr>
    `).join("");

    res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Follow-ups | Engravida</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: Inter, Arial, sans-serif;
            background: #f4f6f8;
            color: #111827;
        }

        .page {
            min-height: 100vh;
            padding: 32px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
            margin-bottom: 24px;
        }

        .title h1 {
            margin: 0;
            font-size: 28px;
            letter-spacing: -0.03em;
        }

        .title p {
            margin: 8px 0 0;
            color: #6b7280;
            font-size: 14px;
        }

.badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
}

.badge.active {
    background: #ecfdf3;
    color: #027a48;
    border: 1px solid #abefc6;
}

.badge.inactive {
    background: #fef2f2;
    color: #b42318;
    border: 1px solid #fecaca;
}
        .readme-button,
        .send-button {
            border: 0;
            cursor: pointer;
            text-decoration: none;
            background: #111827;
            color: white;
            padding: 9px 14px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 700;
        }

        .readme-button:hover,
        .send-button:hover {
            background: #374151;
        }

        .send-button:disabled {
            opacity: 0.45;
            cursor: not-allowed;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .metric {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
        }

        .metric span {
            display: block;
            color: #6b7280;
            font-size: 13px;
            margin-bottom: 8px;
        }

        .metric strong {
            font-size: 28px;
            letter-spacing: -0.03em;
        }

        .card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
        }

        .card-header {
            padding: 20px 24px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
        }

        .card-header h2 {
            margin: 0;
            font-size: 18px;
        }

        .card-header span {
            color: #6b7280;
            font-size: 13px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: #f9fafb;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            font-size: 11px;
            font-weight: 700;
            text-align: left;
            padding: 12px 24px;
            border-bottom: 1px solid #e5e7eb;
        }

        td {
            padding: 16px 24px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: top;
            font-size: 14px;
        }

        tr:hover td {
            background: #f9fafb;
        }

        .phone {
            font-weight: 700;
            color: #111827;
        }

        .ticket {
            color: #374151;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .attempts {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 28px;
            height: 28px;
            border-radius: 999px;
            background: #eef2ff;
            font-weight: 700;
        }

        .status {
            display: inline-flex;
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 700;
        }

        .status.queued {
            background: rgba(194,142,12,0.15);
            color: #a2780e;
        }

        .status.sent {
            background: rgba(36,194,12,0.15);
            color: #349110;
        }

        .date {
            color: #374151;
            white-space: nowrap;
        }

        .message {
            color: #4b5563;
            max-width: 520px;
            line-height: 1.45;
        }

        .empty {
            text-align: center;
            padding: 40px;
            color: #6b7280;
        }
        th{
            white-space: nowrap;
        }

        @media (max-width: 900px) {
            .page {
                padding: 20px;
            }

            .header {
                flex-direction: column;
            }

            .grid {
                grid-template-columns: 1fr;
            }

            .card {
                overflow-x: auto;
            }

            table {
                min-width: 1100px;
            }
        }
    </style>
</head>
<body>
    <main class="page">
        <section class="header">
            <div class="title">
                <h1>Dashboard de Follow-ups</h1>
                <p>Contatos na fila e envios manuais de follow-up.</p>
            </div>

            <div style="display: flex; gap: 12px; align-items: center;">
                <a class="readme-button" href="https://github.com/metrix0/EngravidaFollowUpBlipIntegration" target="_blank">📘 Open README</a>

                <div class="badge ${state.automatic_sending ? "active" : "inactive"}">
                    ● ${state.automatic_sending ? "Envio automático ativo" : "Envio automático desativado"}
                </div>
            </div>
        </section>

        <section class="grid">
            <div class="metric">
                <span>Na fila</span>
                <strong>${queuedCount}</strong>
            </div>

            <div class="metric">
                <span>Enviados</span>
                <strong>${sentCount}</strong>
            </div>

            <div class="metric">
                <span>Modo</span>
                <strong>${state.automatic_sending ? "Auto" : "Manual"}</strong>
            </div>
        </section>

        <section class="card">
            <div class="card-header">
                <div>
                    <h2>Fila de follow-up</h2>
                    <span>Selecione contatos na fila para enviar manualmente</span>
                </div>

<button class="send-button" id="sendButton" onclick="sendSelected()" disabled>Enviar selecionados</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Telefone</th>
                        <th>Ticket</th>
                        <th>Status</th>
                        <th>Tentativas</th>
                        <th>Finalizado em</th>
                        <th>Enviado em</th>
                        <th>Mensagem</th>
                    </tr>
                </thead>
                <tbody>
                    ${
        rows ||
        `<tr>
                            <td class="empty" colspan="8">Nenhum contato na fila.</td>
                        </tr>`
    }
                </tbody>
            </table>
        </section>
    </main>

    <script>
        function updateSendButton() {
            const selected = document.querySelectorAll('input[name="phone"]:checked').length;
            document.getElementById("sendButton").disabled = selected === 0;
        }
        
        document.addEventListener("change", (event) => {
            if (event.target.name === "phone") {
                updateSendButton();
            }
        });
        async function sendSelected() {
            const phones = [...document.querySelectorAll('input[name="phone"]:checked')]
                .map((input) => input.value);

            if (phones.length === 0) {
                alert("Selecione pelo menos um contato.");
                return;
            }

            const button = document.getElementById("sendButton");
            button.disabled = true;
            button.textContent = "Enviando...";

            const response = await fetch("/api/followup/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phones }),
            });

            const result = await response.json();

            if (!result.ok) {
                alert(result.error || "Erro ao enviar.");
                button.disabled = false;
                button.textContent = "Enviar selecionados";
                return;
            }

            alert("Envios concluídos: " + result.sent);
            window.location.reload();
        }
    </script>
</body>
</html>
`);
});

app.get("/readme", (req, res) => {
    res.redirect("https://github.com/metrix0/EngravidaFollowUpBlipIntegration");
});

app.get("/api/followup", followupRoute);
app.post("/api/followup", followupRoute);
app.post("/api/followup/send", sendManualFollowupRoute);

app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
});