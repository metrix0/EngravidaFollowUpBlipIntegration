import express from "express";
import { env } from "./config/env.js";
import { followupRoute } from "./routes/followupRoute.js";
import { getFollowupState } from "./clients/jsonBinClient.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        ok: true,
        service: "engravida-followup",
    });
});

app.get("/followup", async (req, res) => {
    const followups = await getFollowupState();

    const items = Object.entries(followups)
        .map(([phone, data]) => ({
            phone,
            ...data,
        }))
        .sort((a, b) => new Date(b.sentAt || 0) - new Date(a.sentAt || 0));

    const rows = items.map((item) => `
        <tr>
            <td>${item.phone || ""}</td>
            <td>${item.ticketId || ""}</td>
            <td>${item.attempts || 0}</td>
            <td>${item.sentAt ? new Date(item.sentAt).toLocaleString("pt-BR") : ""}</td>
            <td>${item.message || ""}</td>
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
            background: #ecfdf3;
            color: #027a48;
            border: 1px solid #abefc6;
            padding: 8px 12px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 600;
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
            color: #3730a3;
            font-weight: 700;
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
        .readme-button {
            text-decoration: none;
            background: #111827;
            color: white;
            padding: 9px 14px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 700;
        }
        
        .readme-button:hover {
            background: #374151;
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
                min-width: 900px;
            }
        }
    </style>
</head>
<body>
    <main class="page">
        <section class="header">
            <div class="title">
                <h1>Dashboard de Follow-ups</h1>
                <p>Monitoramento dos contatos que já receberam follow-up automático.</p>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                <a class="readme-button" href="https://github.com/metrix0/EngravidaFollowUpBlipIntegration" target="_blank">📘 Open README</a>
            
                <div class="badge">
                    ● Sistema ativo
                </div>
            </div>
        </section>

        <section class="grid">
            <div class="metric">
                <span>Total enviados</span>
                <strong>${items.length}</strong>
            </div>

            <div class="metric">
                <span>Último envio</span>
                <strong>${items[0]?.sentAt ? new Date(items[0].sentAt).toLocaleDateString("pt-BR") : "-"}</strong>
            </div>

            <div class="metric">
                <span>Base</span>
                <strong>JSONBin</strong>
            </div>
        </section>

        <section class="card">
            <div class="card-header">
                <div>
                    <h2>Histórico de envios</h2>
                    <span>Ordenado do mais recente para o mais antigo</span>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Telefone</th>
                        <th>Ticket</th>
                        <th>Tentativas</th>
                        <th>Enviado em</th>
                        <th>Mensagem</th>
                    </tr>
                </thead>
                <tbody>
                    ${
        rows ||
        `<tr>
                            <td class="empty" colspan="5">Nenhum follow-up enviado ainda.</td>
                        </tr>`
    }
                </tbody>
            </table>
        </section>
    </main>
</body>
</html>
`);
});
app.get("/readme", (req, res) => {
    res.sendFile("README.md", { root: process.cwd() });
});

app.get("/api/followup", followupRoute);
app.post("/api/followup", followupRoute);

app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
});