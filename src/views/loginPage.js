export function renderLoginPage() {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login | Follow-ups</title>
    <style>
        * { box-sizing: border-box; }

        body {
            margin: 0;
            min-height: 100vh;
            font-family: Inter, Arial, sans-serif;
            background: #f4f6f8;
            color: #111827;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }

        .login-card {
            width: 100%;
            max-width: 420px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 18px;
            box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
            padding: 28px;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #eef2ff;
            color: #3730a3;
            border: 1px solid #c7d2fe;
            padding: 8px 12px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 20px;
        }

        h1 {
            margin: 0;
            font-size: 28px;
            letter-spacing: -0.03em;
        }

        p {
            margin: 8px 0 24px;
            color: #6b7280;
            font-size: 14px;
            line-height: 1.5;
        }

        label {
            display: block;
            font-size: 13px;
            font-weight: 700;
            color: #374151;
            margin-bottom: 8px;
        }

        .password-wrap {
            position: relative;
        }

        input {
            width: 100%;
            border: 1px solid #d1d5db;
            background: #ffffff;
            color: #111827;
            border-radius: 12px;
            padding: 13px 44px 13px 14px;
            font-size: 15px;
            outline: none;
        }

        input:focus {
            border-color: #111827;
            box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.08);
        }

        .eye-button {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            border: 0;
            background: transparent;
            cursor: pointer;
            color: #6b7280;
            font-size: 18px;
            padding: 4px;
        }

        .eye-button:hover {
            color: #111827;
        }

        .submit-button {
            width: 100%;
            margin-top: 16px;
            border: 0;
            cursor: pointer;
            background: #111827;
            color: white;
            padding: 13px 14px;
            border-radius: 999px;
            font-size: 14px;
            font-weight: 700;
        }

        .submit-button:hover {
            background: #374151;
        }

        .footer {
            margin-top: 18px;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <form class="login-card" method="POST" action="/followup/login">
        <div class="badge">🔒 Área protegida</div>

        <h1>Dashboard de Follow-ups</h1>
        <p>Digite a senha para acessar a fila e os envios manuais de follow-up.</p>

        <label for="password">Senha</label>

        <div class="password-wrap">
            <input id="password" name="password" type="password" placeholder="Digite a senha" autofocus />
            <button class="eye-button" type="button" onclick="togglePassword()" aria-label="Mostrar ou ocultar senha">
                <span id="eyeIcon">◉</span>
            </button>
        </div>

        <button class="submit-button" type="submit">Entrar</button>

        <div class="footer">Engravida Follow-up Integration</div>
    </form>

        <script>
            let passwordVisible = false;
        
            function togglePassword() {
                const input = document.getElementById("password");
                const icon = document.getElementById("eyeIcon");
        
                passwordVisible = !passwordVisible;
        
                input.type = passwordVisible ? "text" : "password";
                icon.textContent = passwordVisible ? "◎" : "◉";
            }
        </script>
</body>
</html>
`;
}