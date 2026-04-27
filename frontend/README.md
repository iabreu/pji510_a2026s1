# Frontend — Next.js Dashboard

Dashboard web para visualização das leituras dos ESP32, configuração de limites e acompanhamento de alertas. Roda no Vercel.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — estilos
- **Recharts** — gráficos
- **Supabase** — banco de dados + autenticação
- **next-themes** — tema claro/escuro
- **lucide-react** — ícones

## Estrutura

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout (theme provider)
│   ├── globals.css             # Tokens HSL para tema
│   ├── login/page.tsx          # Tela de login
│   └── (dashboard)/            # Rotas autenticadas (compartilham layout)
│       ├── layout.tsx          # Sidebar + header (valida sessão)
│       ├── page.tsx            # Visão geral
│       ├── dashboard-cliente.tsx
│       ├── dispositivo/[id]/
│       │   ├── page.tsx        # Detalhe
│       │   └── detalhe-cliente.tsx
│       ├── leituras/
│       │   ├── page.tsx        # Tabela
│       │   └── leituras-cliente.tsx
│       └── alertas/
│           ├── page.tsx        # Timeline
│           └── alertas-cliente.tsx
├── components/
│   ├── ui/                     # Botões, cards, inputs (Tailwind puro)
│   ├── sidebar.tsx, header.tsx
│   ├── kpi-card.tsx, card-dispositivo.tsx
│   ├── grafico-historico.tsx
│   ├── tabela-leituras.tsx
│   ├── lista-alertas.tsx
│   ├── threshold-form.tsx
│   ├── seletor-periodo.tsx
│   ├── status-badge.tsx
│   ├── theme-toggle.tsx
│   └── providers.tsx
├── lib/
│   ├── supabase/{client,server,middleware}.ts
│   ├── hooks.ts                # Polling (atualização periódica)
│   ├── types.ts                # Tipos alinhados com o banco
│   ├── api.ts                  # Cliente do FastAPI
│   └── utils.ts                # cn(), formatadores, CSV
├── middleware.ts               # Proteção de rotas (redireciona pra /login)
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Funcionalidades

- **Login** — Supabase Auth (email + senha). Sem registro aberto.
- **Visão geral** — Cards de cada dispositivo, KPIs, gráfico comparativo (alterna entre temperatura e umidade), alertas recentes
- **Detalhe do dispositivo** — KPIs, estatísticas (média/min/máx), gráficos de temperatura e umidade com a faixa permitida em destaque, formulário de limites, alertas
- **Leituras** — Tabela com filtros, paginação e exportação CSV
- **Alertas** — Timeline com filtros por dispositivo, tipo e período
- **Tema claro/escuro** com persistência
- **Atualização automática** — o dashboard consulta o banco a cada 5 segundos, novas leituras aparecem sem reload

## Rodar localmente

### Pré-requisitos

- Node.js 18+
- Backend FastAPI rodando (em `http://localhost:8000`)
- Banco Supabase configurado com schema e usuários (ver `docs/README.md`)

### Setup

```bash
cd frontend
npm install

cp .env.local.example .env.local
# edite .env.local com:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```

Abra `http://localhost:3000` e faça login com uma das contas criadas no Supabase.

## Deploy no Vercel

### Via dashboard

1. Em [vercel.com](https://vercel.com), **Add New → Project**
2. Importar o repositório
3. **Root Directory:** `frontend/`
4. **Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` — URL do backend deployado (ex.: `https://seu-backend.vercel.app`)
5. **Deploy**

Depois do deploy, lembre de atualizar `CORS_ORIGINS` no backend para incluir a URL do frontend no Vercel.

## Decisões de design

**Server Components + Client Components.** As páginas (`page.tsx`) são Server Components que carregam dados iniciais via `createClient()` do servidor (com cookie de sessão). Esses dados são passados como props para componentes cliente (`*-cliente.tsx`) que fazem polling a cada 5 segundos para manter os dados atualizados.

**Polling.** Cada página pega um snapshot inicial no Server Component. Os componentes cliente consultam o Supabase periodicamente para atualizar os dados na tela sem precisar recarregar a página.

**Sem Radix UI.** Os componentes UI foram escritos com Tailwind puro pra manter o bundle leve e o código simples de defender academicamente. Acessibilidade básica (`aria-label`, focus rings, semântica) está coberta.

**Formatação em pt-BR.** Datas, números e textos formatados em português brasileiro via `date-fns/locale/ptBR`.
