# DicaDevPedro - Guia de Instalação e Deploy do DeltaZap

Este documento fornece um passo a passo detalhado para configurar, executar e implantar a plataforma de comunicação DeltaZap em um ambiente de produção Linux.

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

## Parte 1: Pré-requisitos do Servidor

Antes de iniciar a instalação, garanta que seu servidor (recomendado Ubuntu/Debian) possui os seguintes softwares instalados:

1.  **Node.js:** Versão 18.x ou mais recente.
    ```bash
    # Exemplo de instalação no Ubuntu/Debian
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```
2.  **Servidor XMPP:** Um servidor Openfire (ou similar) instalado, em execução e acessível pela rede. É crucial que a **porta WebSocket (geralmente 7070)** esteja habilitada e liberada no firewall.
3.  **Servidor PostgreSQL:** Um banco de dados PostgreSQL instalado e acessível pela rede a partir do servidor onde o DeltaZap será executado.
4.  **PM2 (Process Manager):** Para manter a aplicação rodando em produção.
    ```bash
    sudo npm install pm2 -g
    ```

---

## Parte 2: Configuração para Desenvolvimento Local

Para executar o projeto em sua máquina local para desenvolvimento e testes.

1.  **Clonar o Repositório**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd deltazap
    ```

2.  **Instalar Dependências**
    ```bash
    npm install
    ```

3.  **Configurar Variáveis de Ambiente**
    - Crie um arquivo chamado `.env.local` na raiz do projeto.
    - Adicione as seguintes variáveis, substituindo pelos seus dados de desenvolvimento:

    ```env
    # Conexão com o Banco de Dados PostgreSQL (pode ser local ou remoto)
    POSTGRES_URL="postgres://SEU_USUARIO:SUA_SENHA@SEU_HOST:SUA_PORTA/SEU_BANCO"

    # Chave de API para as funcionalidades de Inteligência Artificial (Google AI)
    # Obtenha sua chave em https://aistudio.google.com/app/apikey
    GOOGLE_API_KEY="SUA_CHAVE_DE_API_AQUI"
    ```
    **Importante:** Este arquivo não deve ser enviado para o controle de versão (Git).

4.  **Configurar Conexão XMPP Local**
    - Acesse o painel administrativo em `/admin/login` (usuário: `master`, senha: `@Delta477`).
    - Vá para "Configurações" e insira o IP e a porta WebSocket do seu servidor Openfire.
    - **Atenção:** Esta configuração é salva apenas no seu navegador (`localStorage`) e serve para facilitar os testes locais.

5.  **Executar o Servidor de Desenvolvimento**
    ```bash
    npm run dev
    ```
    O aplicativo estará disponível em `http://localhost:9002`.

---

## Parte 3: Deploy em Servidor de Produção Linux

Siga estes passos para implantar a aplicação em seu servidor Linux.

### Passo 1: Build da Aplicação (na sua máquina local)

Execute o comando de build para gerar os arquivos otimizados para produção.

```bash
npm run build
```
Este comando cria uma pasta `.next/standalone`, que contém uma versão autocontida do servidor Node.js, e a pasta `.next/static` com os assets da aplicação.

### Passo 2: Preparar o Servidor de Produção

1.  **Crie um diretório para a aplicação** no seu servidor.
    ```bash
    sudo mkdir -p /var/www/deltazap
    cd /var/www/deltazap
    ```

2.  **Copie os arquivos necessários** da sua máquina local para o diretório `/var/www/deltazap` no servidor. Você pode usar `scp`, `rsync` ou outro método de sua preferência.
    - A pasta inteira: `.next/standalone`
    - A pasta inteira: `.next/static`
    - A pasta: `public`
    - O arquivo: `ecosystem.config.js`
    - O arquivo: `package.json` (necessário para o PM2 identificar o nome da aplicação)

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

3.  **Crie o arquivo de variáveis de ambiente de produção** **diretamente no servidor**.
    ```bash
    sudo nano /var/www/deltazap/.env.local
    ```
    Adicione o conteúdo com suas credenciais de **produção**:
    ```env
    POSTGRES_URL="postgres://SEU_USUARIO_PROD:SUA_SENHA_PROD@SEU_HOST_PROD:SUA_PORTA_PROD/SEU_BANCO_PROD"
    GOOGLE_API_KEY="SUA_CHAVE_DE_API_PROD"
    ```

### Passo 3: Iniciar a Aplicação com PM2

1.  Navegue até o diretório da aplicação no servidor.
    ```bash
    cd /var/www/deltazap
    ```

2.  Inicie a aplicação usando o arquivo de configuração do PM2.
    ```bash
    pm2 start ecosystem.config.js
    ```

3.  **Verifique se a aplicação está rodando.**
    ```bash
    pm2 list
    ```
    Você deve ver o processo `deltazap` com o status `online`.

4.  **(Opcional) Salvar a lista de processos do PM2** para que a aplicação reinicie automaticamente com o servidor.
    ```bash
    pm2 save
    ```

### Passo 4: Configuração de Firewall e Reverse Proxy (Recomendado)

- A aplicação estará rodando na porta `3000` (conforme definido em `ecosystem.config.js`). Certifique-se de que esta porta está liberada no seu firewall se precisar acessá-la diretamente: `sudo ufw allow 3000`.
- Para um ambiente de produção profissional, é altamente recomendável usar um **servidor web como Nginx ou Apache como um reverse proxy**. Isso permite:
  - Servir sua aplicação na porta 80 (HTTP) e 443 (HTTPS).
  - Configurar um domínio personalizado (ex: `chat.suaempresa.com`).
  - Gerenciar certificados SSL (HTTPS) facilmente com ferramentas como o Let's Encrypt.

A aplicação agora está em execução no seu servidor Linux!

---

© 2024 Pedro H F Portella. Todos os direitos reservados.
