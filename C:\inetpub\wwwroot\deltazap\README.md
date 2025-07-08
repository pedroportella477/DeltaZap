# DeltaZap

DeltaZap é uma plataforma de comunicação corporativa construída com Next.js, TypeScript e Tailwind CSS. Ela se conecta a um servidor XMPP (como Openfire) para comunicação em tempo real e utiliza PostgreSQL para persistência de dados adicionais, como anotações, compromissos e materiais de apoio.

## Funcionalidades Principais

- **Comunicação em Tempo Real:** Chats individuais e em grupo via protocolo XMPP.
- **Persistência de Dados:** Histórico de conversas, notas, compromissos e outros dados são salvos em um banco de dados PostgreSQL.
- **Gestão de Status e Presença:** Os usuários podem definir seu status de presença (online, ausente, etc.).
- **Ferramentas de Produtividade:**
  - Agenda de Compromissos individual.
  - Bloco de Notas privado.
  - Gestão de Demandas (tasks/tickets).
- **Painel Administrativo:** Para gerenciamento de links internos e materiais de apoio para a equipe.
- **Integração com IA (Genkit):**
  - Sugestão de respostas inteligentes em conversas.
  - Geração de imagens para avatares e status.

## Tech Stack

- **Framework:** Next.js (com App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS, ShadCN/UI
- **Comunicação:** XMPP (via `@xmpp/client`)
- **Banco de Dados:** PostgreSQL (via `pg`)
- **Inteligência Artificial:** Genkit (Google AI)

## Configuração e Instalação

### Pré-requisitos

- Node.js
- Um servidor XMPP (ex: Openfire) configurado e em execução.
- Um banco de dados PostgreSQL acessível remotamente.

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-repositorio>
    cd <nome-do-repositorio>
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env.local` na raiz do projeto e adicione a seguinte variável:
    ```env
    POSTGRES_URL="postgres://SEU_USUARIO:SUA_SENHA@SEU_HOST:SUA_PORTA/SEU_BANCO"
    ```
    Substitua os placeholders pelas suas credenciais do PostgreSQL.

4.  **Configure o Servidor XMPP (para desenvolvimento):**
    - Acesse o painel administrativo em `/admin/login` (usuário: `master`, senha: `@Delta477`).
    - Navegue até "Configurações" e insira o IP e a porta WebSocket do seu servidor Openfire. Essas configurações são salvas localmente no seu navegador.

5.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

O aplicativo estará disponível em `http://localhost:9002`.

## Deploy em Produção (Linux)

1.  **Build da Aplicação:**
    ```bash
    npm run build
    ```
    O Next.js gerará uma saída otimizada para produção, incluindo um diretório `.next/standalone` que contém tudo o que é necessário para rodar o servidor.

2.  **Configuração do Ambiente:**
    - Certifique-se de que a variável de ambiente `POSTGRES_URL` está definida no seu servidor de produção.
    - O servidor XMPP deve estar acessível a partir do ambiente de produção.

3.  **Execução do Servidor:**
    Use um gerenciador de processos como `pm2` para rodar o servidor Node.js. O arquivo `ecosystem.config.js` está incluído para facilitar este processo.
    ```bash
    pm2 start ecosystem.config.js
    ```
