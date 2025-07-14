# Guia de Instalação e Deploy do DeltaZap em Ubuntu 24.04

Este documento fornece um passo a passo detalhado para instalar, configurar, executar e implantar a plataforma de comunicação DeltaZap em um ambiente de produção Linux (Ubuntu 24.04 LTS) a partir de um repositório Git.

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
    
3.  **Git:** Para clonar o repositório da aplicação.
    ```bash
    sudo apt install -y git
    ```

4.  **PM2 (Process Manager):** Para manter a aplicação rodando em produção de forma estável.
    ```bash
    sudo npm install pm2 -g
    ```

5.  **Servidor XMPP (Openfire):** Garanta que você tenha um servidor Openfire (ou similar) instalado, em execução e acessível pela rede a partir do seu servidor Ubuntu. É crucial que a **porta WebSocket (geralmente 7070)** esteja habilitada e liberada no firewall.

6.  **Servidor PostgreSQL:** Garanta que você tenha um banco de dados PostgreSQL instalado e acessível pela rede. Você precisará da URL de conexão completa.

---

## Parte 2: Preparação e Deploy da Aplicação

Siga estes passos para preparar e implantar a aplicação.

### Passo 1: Clonar o Repositório

1.  Crie um diretório para a aplicação no seu servidor. O diretório `/var/www` é uma localização padrão.
    ```bash
    # Exemplo de comando a ser executado no servidor Ubuntu via SSH
    sudo mkdir -p /var/www
    ```
    
2.  Navegue até o diretório e clone o projeto.
    ```bash
    cd /var/www
    sudo git clone https://github.com/pedroportella477/DeltaZap.git deltazap
    ```

3.  Acesse o diretório da aplicação.
    ```bash
    cd /var/www/deltazap
    ```

### Passo 2: Instalar Dependências e Construir a Aplicação

1.  Instale todas as dependências do projeto.
    ```bash
    npm install
    ```
    
2.  Execute o build da aplicação para gerar os arquivos otimizados para produção.
    ```bash
    npm run build
    ```

### Passo 3: Criar o Arquivo de Variáveis de Ambiente
> **Atenção:** Este é o passo mais crítico. É aqui que você informa à aplicação como se conectar ao seu banco de dados e aos serviços de IA. A aplicação não funcionará sem este arquivo.

1.  No servidor, dentro do diretório `/var/www/deltazap`, crie o arquivo `.env.local`.
    ```bash
    sudo nano .env.local
    ```
2.  Adicione o seguinte conteúdo ao arquivo, **substituindo os valores pelos dados do seu ambiente de produção**:
    ```env
    # URL de conexão com o seu banco de dados PostgreSQL remoto.
    # Ex: postgres://user:password@host:port/deltazap_db
    POSTGRES_URL="SUA_URL_DE_CONEXAO_POSTGRESQL"
    
    # Chave de API para as funcionalidades de Inteligência Artificial do Google.
    # Obtenha sua chave em https://aistudio.google.com/app/apikey
    GOOGLE_API_KEY="SUA_CHAVE_DE_API_DO_GOOGLE"
    ```
    Pressione `Ctrl+X`, depois `Y` e `Enter` para salvar e sair do editor nano.

### Passo 4: Iniciar a Aplicação com PM2
> **Observação Importante sobre o Banco de Dados:** Na primeira vez que a aplicação for iniciada, ela tentará se conectar ao PostgreSQL e **criará automaticamente todas as tabelas necessárias**. Você não precisa criar nenhuma tabela manualmente. Verifique os logs do PM2 (`pm2 logs deltazap`) para confirmar que a conexão foi bem-sucedida.

1.  Com o `pm2` instalado globalmente, inicie a aplicação usando o script `start` do `package.json`.
    ```bash
    pm2 start npm --name "deltazap" -- start
    ```
2.  Verifique se a aplicação está rodando.
    ```bash
    pm2 list
    ```
    Você deve ver o processo `deltazap` com o status `online`.

3.  (Recomendado) Salve a lista de processos do PM2 para que a aplicação reinicie automaticamente com o servidor.
    ```bash
    pm2 save
    
    # Execute o comando que o PM2 sugerir para configurar o serviço de inicialização.
    # Geralmente será algo como:
    sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u seu_usuario --hp /home/seu_usuario
    ```

### Passo 5: Configuração de Firewall e Acesso
- A aplicação estará rodando na porta `3000` por padrão. Certifique-se de que esta porta está liberada no seu firewall se precisar acessá-la diretamente: `sudo ufw allow 3000`.
- Para um ambiente profissional, é altamente recomendável usar um **servidor web como Nginx ou Apache como um reverse proxy**. Isso permite servir sua aplicação na porta 80 (HTTP) e 443 (HTTPS) e configurar um domínio personalizado.

A aplicação agora está em execução e pronta para ser acessada!

---

© 2024 Pedro H F Portella. Todos os direitos reservados.
