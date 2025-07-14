# Guia de Instalação e Deploy do DeltaZap em Ubuntu 24.04

Este documento fornece um passo a passo detalhado para configurar, executar e implantar a plataforma de comunicação DeltaZap em um ambiente de produção Linux (Ubuntu 24.04 LTS).

## Visão Geral

O DeltaZap é uma plataforma de comunicação corporativa que utiliza o Next.js. A autenticação (login) e a comunicação em tempo real (chat) são totalmente gerenciadas por um **servidor XMPP externo (como Openfire)**. A aplicação se conecta a este servidor para operar, o que significa que todos os usuários e senhas devem ser criados no painel do Openfire.

Para persistência de dados (histórico de conversas, anotações, status, etc.), o DeltaZap utiliza um banco de dados **PostgreSQL**.

## Tech Stack

- **Framework:** Next.js (com App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS, ShadCN/UI
- **Comunicação:** XMPP (via `@xmpp/client`)
- **Banco de Dados:** PostgreSQL (via `pg`)
- **Inteligência Artificial:** Genkit (Google AI)
- **Gerenciador de Processos (Produção):** PM2

---

## Parte 1: Pré-requisitos do Servidor (Ubuntu 24.04 LTS)

Antes de iniciar a instalação, acesse seu servidor via SSH e garanta que ele possui os seguintes softwares instalados:

1.  **Atualizar o Sistema**
    É sempre uma boa prática começar atualizando os pacotes do seu servidor.
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```

2.  **Node.js:** Versão 18.x ou mais recente.
    ```bash
    # Instalar o curl para baixar o script de instalação do Node.js
    sudo apt install -y curl
    
    # Adicionar o repositório do Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    
    # Instalar o Node.js
    sudo apt-get install -y nodejs
    ```

3.  **Servidor XMPP (Openfire):** Garanta que você tenha um servidor Openfire (ou similar) instalado, em execução e acessível pela rede a partir do seu servidor Ubuntu. É crucial que a **porta WebSocket (geralmente 7070)** esteja habilitada e liberada no firewall.

4.  **Servidor PostgreSQL:** Garanta que você tenha um banco de dados PostgreSQL instalado e acessível pela rede. Você precisará da URL de conexão completa. **Você pode nomear o banco de dados como `deltazap` ou `deltazap_db` para facilitar a identificação.**

5.  **PM2 (Process Manager):** Para manter a aplicação rodando em produção de forma estável.
    ```bash
    sudo npm install pm2 -g
    ```

---

## Parte 2: Preparação e Deploy da Aplicação

Siga estes passos para preparar e implantar a aplicação no seu servidor.

### Passo 1: Build da Aplicação (na sua máquina local)

Primeiro, gere os arquivos otimizados para produção na sua máquina de desenvolvimento.

```bash
npm run build
```
Este comando cria uma pasta `.next/standalone`, que contém uma versão autocontida do servidor Node.js, e a pasta `.next/static` com os assets da aplicação.

### Passo 2: Preparar o Servidor de Produção

1.  **Crie um diretório para a aplicação** no seu servidor.
    ```bash
    # O diretório /var/www é uma localização padrão para aplicações web
    sudo mkdir -p /var/www/deltazap
    ```

2.  **Copie os arquivos necessários** da sua máquina local para o diretório `/var/www/deltazap` no servidor. Você pode usar `scp`, `rsync` ou outro método de sua preferência.

    **Arquivos e pastas a serem copiados:**
    - A pasta inteira: `.next/standalone`
    - A pasta inteira: `.next/static`
    - A pasta: `public`
    - O arquivo: `ecosystem.config.js`
    - O arquivo: `package.json`

    Após a cópia, a estrutura no servidor deve ser semelhante a:
    ```
    /var/www/deltazap/
    ├── .next/
    │   ├── standalone/
    │   └── static/
    ├── public/
    ├── ecosystem.config.js
    └── package.json
    ```

3.  **Crie o arquivo de variáveis de ambiente** **diretamente no servidor**.
    > **Importante:** Este é o passo mais crítico. É aqui que você informa à aplicação como se conectar ao seu banco de dados e a outros serviços. A aplicação não funcionará sem este arquivo.
    ```bash
    # Use o nano ou outro editor de texto para criar o arquivo
    sudo nano /var/www/deltazap/.env.local
    ```
    Adicione o conteúdo a seguir, substituindo pelas suas credenciais de **produção**:
    ```env
    # URL de conexão com o seu banco de dados PostgreSQL remoto.
    # Substitua 'SEU_BANCO_PROD' pelo nome do banco que você criou (ex: deltazap).
    POSTGRES_URL="postgres://SEU_USUARIO_PROD:SUA_SENHA_PROD@SEU_HOST_PROD:SUA_PORTA_PROD/SEU_BANCO_PROD"

    # Chave de API para as funcionalidades de Inteligência Artificial
    # Obtenha sua chave em https://aistudio.google.com/app/apikey
    GOOGLE_API_KEY="SUA_CHAVE_DE_API_PROD"
    ```
    Pressione `Ctrl+X`, depois `Y` e `Enter` para salvar e sair do editor nano.

### Passo 3: Iniciar a Aplicação com PM2

1.  Navegue até o diretório da aplicação no servidor.
    ```bash
    cd /var/www/deltazap
    ```

2.  Inicie a aplicação usando o arquivo de configuração do PM2.
    ```bash
    pm2 start ecosystem.config.js
    ```
    **Importante: Criação Automática do Banco de Dados**
    Na primeira vez que a aplicação for iniciada (após a configuração do `.env.local`), ela tentará se conectar ao PostgreSQL e **criará automaticamente todas as tabelas necessárias**. Você não precisa criar nenhuma tabela manualmente. As tabelas criadas são: `notes`, `appointments`, `support_materials`, `internal_links`, `demands`, `statuses`, `user_chats` e `user_messages`.
    
    Verifique os logs do PM2 (`pm2 logs deltazap`) para confirmar que a conexão foi bem-sucedida e que não houve erros.

3.  **Verifique se a aplicação está rodando.**
    ```bash
    pm2 list
    ```
    Você deve ver o processo `deltazap` com o status `online`.

4.  **(Opcional, mas recomendado) Salvar a lista de processos do PM2** para que a aplicação reinicie automaticamente com o servidor.
    ```bash
    pm2 save
    
    # Para garantir que o serviço do pm2 inicie com o boot do sistema
    pm2 startup
    ```

### Passo 4: Configuração de Firewall e Reverse Proxy (Recomendado)

- A aplicação estará rodando na porta `3000` (conforme definido em `ecosystem.config.js`). Certifique-se de que esta porta está liberada no seu firewall se precisar acessá-la diretamente: `sudo ufw allow 3000`.
- Para um ambiente de produção profissional, é altamente recomendável usar um **servidor web como Nginx ou Apache como um reverse proxy**. Isso permite:
  - Servir sua aplicação na porta 80 (HTTP) e 443 (HTTPS).
  - Configurar um domínio personalizado (ex: `chat.suaempresa.com`).
  - Gerenciar certificados SSL (HTTPS) facilmente com ferramentas como o Let's Encrypt.

A aplicação agora está em execução e pronta para ser acessada!

---

© 2024 Pedro H F Portella. Todos os direitos reservados.