# DeltaZap: A Plataforma de Comunicação Inteligente para Equipes

O DeltaZap é uma plataforma de comunicação corporativa que une comunicação em tempo real, ferramentas de organização e o poder da inteligência artificial para otimizar a colaboração em equipe.

## Visão Geral

- **Comunicação Centralizada:** Chats individuais e em grupo, com histórico persistente e status de presença.
- **Inteligência Artificial:** Inclui sugestões de respostas inteligentes e geração de imagens para avatares.
- **Ferramentas de Produtividade:** Agenda de compromissos, bloco de notas, central de links e gestão de demandas.
- **Painel Administrativo:** Para gestão de conteúdo e configurações.

## Arquitetura e Tech Stack

- **Framework:** Next.js (com App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS & ShadCN/UI
- **Comunicação em Tempo Real:** XMPP (requer um servidor externo como Openfire para autenticação e chat).
- **Banco de Dados:** PostgreSQL (para persistência de dados como histórico, notas, etc.).
- **Inteligência Artificial:** Genkit (Google AI).
- **Gerenciador de Processos (Produção):** PM2.

Para instruções detalhadas de instalação e deploy, consulte o arquivo `DicaDevPedro.md`.
