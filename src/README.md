# 📲 Engravida Follow-up

Sistema para enviar follow-up automático para leads que pararam de responder durante o agendamento.

## ⚙️ Como funciona

1. Lê os tickets do Google Sheets (ativado por Cron Job em cron-job.org).
2. Filtra tickets com:
    - data após `IGNORE_BEFORE_DATE`;
    - tag `nao agendou` ou `sem retorno`;
    - sem tag `agendado`;
    - follow-up ainda não enviado para aquele telefone.
3. Envia mensagem pela API da Blip.
4. Salva o telefone no JSONBin para não enviar de novo.
5. Mostra os envios no dashboard `/followup`.

## 🔗 Rotas

```txt
GET /              -> status do servidor
GET /api/followup  -> executa os follow-ups
GET /followup      -> dashboard dos envios

```
# 🔐 Váriaveis de Ambiente

```
PORT=3000
CRON_SECRET=

SPREADSHEET_ID=
SHEET_NAME=

GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY=

JSONBIN_ID=
JSONBIN_KEY=

BLIP_CONTRACT_ID=
BLIP_KEY=

FOLLOWUP_AFTER_DAYS=9
IGNORE_BEFORE_DATE=2026-05-17
```

# ⚠️ Observações
- O Google Sheets é apenas lido, não alterado.
- O JSONBin guarda quem já recebeu follow-up.
- A chave primária no JSONBin é o telefone.