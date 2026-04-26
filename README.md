# Projeto Integrador V — UNIVESP

Sistema de monitoramento de temperatura e umidade ambientais usando ESP32 + DHT22, com backend em FastAPI, banco de dados Supabase e dashboard web em Next.js.

> **Universidade Virtual do Estado de São Paulo (UNIVESP)** — Projeto Integrador em Computação V
>
> **Equipe:** Roberta · Ivan · Jairo · Rafael
>
> **Orientadora:** Profa. Krizia Emanuelle dos Santos Ferreira

## Visão geral

```
┌──────────────┐     HTTP+API key    ┌──────────────────┐    Postgres    ┌────────────┐
│ ESP32 + DHT22│ ──────────────────► │  FastAPI (Vercel)│ ──────────────►│  Supabase  │
│   (Wokwi)    │                     └──────────────────┘                │ (Postgres) │
└──────────────┘                                                          └─────┬──────┘
                                                                                │
                                                              REST + Realtime   │
                                                                                ▼
                                                                       ┌─────────────────┐
                                                                       │ Next.js (Vercel)│
                                                                       │    Dashboard    │
                                                                       └─────────────────┘
```

## Estrutura do repositório

| Pasta | Descrição |
|---|---|
| [`docs/`](./docs)         | Schema SQL do banco e documentação |
| [`backend/`](./backend)   | API FastAPI que recebe leituras e atende o dashboard |
| [`firmware/`](./firmware) | Código MicroPython da placa ESP32 (simulado no Wokwi) |
| [`frontend/`](./frontend) | Dashboard Next.js com gráficos, tabela e configuração de limites |

## Setup rápido (ordem recomendada)

### 1. Banco de dados (Supabase)

Veja [docs/README.md](./docs/README.md). Em resumo:

1. Criar projeto em [supabase.com](https://supabase.com)
2. Rodar `docs/database-schema.sql` no SQL Editor
3. Trocar as `api_key` placeholder por chaves aleatórias
4. (Opcional) Rodar `docs/database-seed.sql` para dados de teste
5. Criar usuários do grupo em Authentication → Users

### 2. Backend (FastAPI)

Veja [backend/README.md](./backend/README.md). Em resumo:

1. `cd backend && python -m venv venv && source venv/bin/activate`
2. `pip install -r requirements.txt`
3. Copiar `.env.example` para `.env` e preencher
4. `uvicorn app.main:app --reload` (local)
5. Deploy: `vercel deploy` (ou conectar o repo no painel do Vercel apontando para a pasta `backend/`)

### 3. Firmware (ESP32)

Veja [firmware/README.md](./firmware/README.md). Em resumo:

1. Abrir [wokwi.com](https://wokwi.com), criar projeto MicroPython ESP32
2. Copiar os arquivos de `firmware/` para o projeto Wokwi
3. Editar `config.py` com a URL do backend e a `API_KEY` do dispositivo
4. Iniciar a simulação

### 4. Frontend (Next.js)

Veja [frontend/README.md](./frontend/README.md). Em resumo:

1. `cd frontend && npm install`
2. Copiar `.env.local.example` para `.env.local` e preencher
3. `npm run dev`
4. Deploy: conectar o repo no Vercel apontando para a pasta `frontend/`

## Tecnologias

- **Hardware/Simulação:** ESP32 + DHT22, simulado no [Wokwi](https://wokwi.com)
- **Firmware:** MicroPython
- **Backend:** FastAPI + Pydantic, deploy serverless no Vercel
- **Banco de dados:** PostgreSQL via Supabase, com RLS e Realtime
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Recharts
- **Autenticação:** Supabase Auth (usuários) + API key (dispositivos)

## Licença

Projeto acadêmico desenvolvido para a UNIVESP. Uso educacional.
