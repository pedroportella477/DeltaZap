# DeltaZap

O DeltaZap é uma plataforma de comunicação corporativa que utiliza o Next.js para a interface do usuário. A autenticação (login) e a comunicação em tempo real (chat) são totalmente gerenciadas por um **servidor XMPP externo (como Openfire)**. A aplicação se conecta a este servidor para operar, o que significa que todos os usuários e senhas devem ser criados no painel do Openfire.

Para funcionalidades adicionais, o DeltaZap usa um banco de dados **PostgreSQL** para persistir dados como histórico de conversas, anotações, compromissos e materiais de apoio.

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

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd <nome-do-repositorio>
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as Variáveis de Ambiente
Para que a aplicação funcione corretamente, especialmente em produção, é crucial configurar as variáveis de ambiente. Crie um arquivo chamado `.env.local` na raiz do seu projeto (na mesma pasta do `package.json`) e adicione as seguintes variáveis:

```env
# Conexão com o Banco de Dados PostgreSQL
# Substitua os placeholders pelas suas credenciais.
POSTGRES_URL="postgres://SEU_USUARIO:SUA_SENHA@SEU_HOST:SUA_PORTA/SEU_BANCO"

# Chave de API para as funcionalidades de Inteligência Artificial (Google AI)
# Obtenha sua chave em https://aistudio.google.com/app/apikey
GOOGLE_API_KEY="SUA_CHAVE_DE_API_AQUI"
```
**Importante:** Este arquivo `.env.local` não deve ser enviado para o controle de versão (Git) por segurança.

### 4. Configure o Servidor XMPP (para desenvolvimento)
- Acesse o painel administrativo em `/admin/login` (usuário: `master`, senha: `@Delta477`).
- Navegue até "Configurações" e insira o IP e a porta WebSocket do seu servidor Openfire. Essas configurações são salvas localmente no seu navegador para facilitar os testes.

### 5. Execute o servidor de desenvolvimento
```bash
npm run dev
```
O aplicativo estará disponível em `http://localhost:9002`.

## Deploy em Produção (Linux)

1.  **Build da Aplicação:**
    ```bash
    npm run build
    ```
    Este comando gera uma pasta `.next/standalone` otimizada para produção, contendo apenas os arquivos necessários para rodar o servidor.

2.  **Configuração do Ambiente no Servidor:**
    - Copie a pasta `.next/standalone` para o seu servidor.
    - Na mesma pasta onde você colocou o diretório `standalone`, crie o arquivo `.env.local` com as variáveis `POSTGRES_URL` e `GOOGLE_API_KEY`, conforme descrito na seção "Configuração das Variáveis de Ambiente".
    - Copie o arquivo `ecosystem.config.js` para o mesmo local.

3.  **Execução do Servidor:**
    Use um gerenciador de processos como `pm2` para rodar o servidor Node.js. O arquivo `ecosystem.config.js` está incluído para facilitar este processo.
    ```bash
    pm2 start ecosystem.config.js
    ```

**Observação:** A configuração `output: 'standalone'` no `next.config.ts` garante que a pasta de build seja autocontida. Você não precisa instalar `node_modules` no servidor, apenas copiar a pasta `standalone` e fornecer as variáveis de ambiente.
