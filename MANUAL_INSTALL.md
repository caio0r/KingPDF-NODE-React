# manual_install.md

# 🧩 Guia de Instalação Manual (Windows) - KingPDF

Este guia cobre a instalação "raiz" sem Docker, usando **Python** e **Node.js** diretamente no Windows, configurado para produção com reinício automático.

---

## 1️⃣ Instalar Pré-requisitos

### 🔹 Node.js (Obrigatório para o Frontend)
1.  Baixe a versão **LTS**: [https://nodejs.org](https://nodejs.org)
2.  Após instalar, abra o **PowerShell** e confirme:
    ```powershell
    node -v
    npm -v
    ```

### 🔹 Python (Obrigatório para o Backend)
1.  Baixe a versão 3.10 ou superior: [https://www.python.org/downloads/](https://www.python.org/downloads/)
2.  ⚠️ **IMPORTANTE**: Na primeira tela da instalação, marque a caixinha:
    *   `[x] Add Python to PATH`
3.  Confirme no PowerShell:
    ```powershell
    python --version
    pip --version
    ```
    *(Se der erro, reinicie o PC).*

---

## 2️⃣ Baixar o Projeto

Abra o PowerShell na pasta onde quer salvar o projeto (ex: Documents) e rode:

```powershell
git clone https://github.com/caio0r/KingPDF-NODE-React.git
cd KingPDF-NODE-React
```

---

## 3️⃣ Configurar o BACKEND (Porta 8999)

O backend foi configurado para rodar na porta **8999** para evitar conflitos!

1.  Entre na pasta:
    ```powershell
    cd backend
    ```

2.  Instale as bibliotecas Python:
    ```powershell
    pip install -r requirements.txt
    ```

3.  Teste se o servidor sobe (sem fechar o terminal):
    ```powershell
    # Comando para iniciar na porta 8999
    python -m uvicorn main:app --host 0.0.0.0 --port 8999
    ```
    *Se aparecer "Application startup complete", está funcionando!
    Pressione `Ctrl + C` para parar o teste.*

---

## 4️⃣ Configurar o FRONTEND (Porta 4040)

O frontend foi configurado para rodar na porta **4040**.

1.  Abra **outro** terminal (ou volte a raiz `cd ..`) e entre na pasta frontend:
    ```powershell
    cd frontend
    ```

2.  Instale as dependências:
    ```powershell
    npm install
    # (Se pedir para corrigir vulnerabilidades, pode ignorar por enquanto ou rodar npm audit fix)
    ```

3.  Buildar o projeto para produção (Deixa mais rápido):
    ```powershell
    npm run build
    ```

4.  Teste se o site sobe:
    ```powershell
    npm start
    ```
    *Deve aparecer: `Ready on http://localhost:4040`*
    *Pressione `Ctrl + C` para parar.*

---

## 5️⃣ Deixar Rodando para Sempre (PM2) 🔥

O **PM2** é um gerenciador que mantém o site online 24h, mesmo se der erro, e inicia junto com o Windows.

1.  **Instalar o PM2** (Globalmente):
    ```powershell
    npm install -g pm2
    pip install pywin32 # Necessário para rodar scripts python em background no windows as vezes
    ```

2.  **Iniciar o Backend**:
    Certifique-se de estar na pasta raiz do projeto (`KingPDF-NODE-React`).
    ```powershell
    cd backend
    pm2 start "python -m uvicorn main:app --host 0.0.0.0 --port 8999" --name kingpdf-backend
    ```

3.  **Iniciar o Frontend**:
    Volte e entre na pasta frontend.
    ```powershell
    cd ..
    cd frontend
    pm2 start npm --name kingpdf-frontend -- start -- -p 4040
    ```

4.  **Confirmar Status**:
    Rode: `pm2 status`
    *Você deve ver duas linhas verdes (online).*

5.  **Salvar para reiniciar com o Windows**:
    ```powershell
    pm2 save
    pm2 startup
    ```
    *O PM2 vai gerar um comando. Copie e cole esse comando no terminal para finalizar a configuração de boot.*

---

## ✅ Tudo Pronto!

*   **Backend**: http://localhost:8999/docs (Testar API)
*   **Acesse o Site**: http://localhost:4040

**Comandos Úteis do PM2:**
*   `pm2 status` (Ver se está rodando)
*   `pm2 logs` (Ver erros)
*   `pm2 restart all` (Reiniciar tudo)
*   `pm2 stop all` (Parar tudo)
