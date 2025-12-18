# Guia de Deploy Completo - Raikiri PDF Tools 🚀

Este manual cobre todo o ciclo, desde subir o código para o Git até colocar em produção automática no Windows.

## 📋 Requisitos de Sistema (Hardware)

Para garantir que a aplicação rode lisa na máquina de teste/produção:

| Recurso | Mínimo | Recomendado | Motivo |
| :--- | :--- | :--- | :--- |
| **Processador** | 2 Núcleos (i3 ou similar) | 4 Núcleos (i5 ou superior) | Conversões de PDF e OCR consomem CPU. |
| **Memória RAM** | 4 GB | 8 GB+ | PDFs grandes (50MB+) e OCR carregam muito na RAM. |
| **Armazenamento** | 10 GB Livre | 20 GB SSD | Espaço para imagens Docker e arquivos temporários. |
| **SO** | Windows 10/11 Pro | Windows 10/11 Pro | Docker Desktop requer virtualização. |

---

## 1️⃣ Subindo o Projeto para o GitHub/GitLab

Antes de instalar na outra máquina, você precisa salvar seu código na nuvem.

1.  **Crie um repositório** no GitHub/GitLab.
2.  Abra o terminal na pasta do projeto (`Raikiri`).
3.  Execute os comandos:

```bash
# Iniciar repositório (se ainda não fez)
git init

# Adicionar todos os arquivos
git add .

# Criar o primeiro "save"
git commit -m "Versão 1.0 Finalizada - Editor PDF Completo"

# Conectar com seu repositório remoto (troque a URL)
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/raikiri-pdf.git

# Enviar o código
git push -u origin main
```

---

## 2️⃣ Instalação na Máquina de Teste (Cliente)

Na máquina onde o sistema vai rodar:

1.  **Instale os Pré-requisitos**:
    *   [Docker Desktop para Windows](https://docs.docker.com/desktop/install/windows-install/) (Instale e abra).
    *   [Git para Windows](https://git-scm.com/download/win).

2.  **Baixe o Projeto**:
    *   Abra o terminal (CMD ou PowerShell).
    *   Clone o repositório: `git clone https://github.com/SEU_USUARIO/raikiri-pdf.git`
    *   Entre na pasta: `cd raikiri-pdf`

3.  **Inicie o Sistema**:
    *   Rode o comando: `docker-compose up -d --build`
    *   *Nota: A primeira vez pode demorar uns 5-10 minutos baixando tudo.*

---

## 3️⃣ Auto-Start (Rodar Direto/Sozinho) ⚡

Para que o usuário não precise digitar comandos, criamos um atalho simples.

### Opção A: Arquivo `.bat` (Clique Duplo)

Crie um arquivo chamado `INICIAR_SISTEMA.bat` na Área de Trabalho com o conteúdo:

```batch
@echo off
echo Iniciando Raikiri PDF Tools...
cd /d "C:\Caminho\Para\A\Pasta\raikiri-pdf"
docker-compose up -d
echo.
echo Sistema iniciado!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000
timeout /t 5
start http://localhost:3000
```
*Basta o usuário clicar duas vezes nesse arquivo.*

### Opção B: Iniciar com o Windows (Invisible)

Para rodar sempre que o PC ligar, sem janelas pretas:

1.  Pressione `Win + R`, digite `shell:startup` e dê Enter.
2.  Coloque um **Atalho** do arquivo `INICIAR_SISTEMA.bat` dentro dessa pasta.
3.  Pronto! Toda vez que o usuário logar, o sistema subirá silenciosamente.

---

## 🔧 Manutenção Rápida

Está dando erro?

1.  **Reiniciar tudo**:
    ```bash
    docker-compose down
    docker-compose up -d
    ```
2.  **Limpar tudo (Reset de fábrica)**:
    ```bash
    docker system prune -a
    ```
