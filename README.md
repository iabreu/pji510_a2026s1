# Projeto Integrador V — UNIVESP

Sistema de monitoramento de temperatura e umidade usando ESP32 + sensor DHT22. O projeto foi desenvolvido como trabalho de conclusão do Projeto Integrador em Computação V da UNIVESP (Universidade Virtual do Estado de São Paulo).

**Equipe:** Ivan, Jairo e Rafael

## O que o sistema faz

O sistema coleta dados de temperatura e umidade de um sensor DHT22 conectado a um microcontrolador ESP32. Esses dados são enviados para uma API na nuvem e armazenados em um banco de dados. Um painel web (dashboard) exibe os dados em tempo real, com gráficos, tabelas e alertas automáticos quando os valores saem dos limites configurados.

O ESP32 é simulado no Wokwi, uma plataforma de simulação de hardware online.

## Como funciona (arquitetura)

```
ESP32 + DHT22          FastAPI               Supabase              Next.js
  (Wokwi)             (Backend)          (Banco de dados)        (Frontend)
     │                    │                     │                     │
     │  POST /leituras    │                     │                     │
     │ ─────────────────► │  INSERT leitura     │                     │
     │   (com API key)    │ ──────────────────► │                     │
     │                    │                     │                     │
     │                    │                     │                     │
     │                    │                     │  consulta a cada 5s │
     │                    │                     │ ◄──────────────────  │
     │                    │                     │   responde dados    │
     │                    │                     │ ──────────────────► │
     │                    │                     │                     │
     │                    │                     │  Trigger gera       │
     │                    │                     │  alertas se valor   │
     │                    │                     │  saiu dos limites   │
```

1. O **ESP32** lê o sensor a cada 30 segundos e envia os dados via HTTP para a API
2. O **backend** (FastAPI) recebe os dados, valida a API key do dispositivo e grava no banco
3. O **Supabase** armazena as leituras e gera alertas automaticamente quando os valores saem dos limites (via trigger no banco)
4. O **frontend** (Next.js) consulta o banco a cada 5 segundos (polling) para exibir os dados atualizados, sem precisar recarregar a página manualmente

## Estrutura das pastas

```
projeto-integrador-v/
│
├── database-schema.sql     # Cria tabelas, triggers, view e permissões
├── database-seed.sql       # Dados de teste (24h de leituras simuladas)
│
├── backend/                # API em Python (FastAPI)
│   ├── api/index.py        # Ponto de entrada para o Vercel
│   ├── app/
│   │   ├── main.py         # Configuração do FastAPI (rotas, CORS)
│   │   ├── config.py       # Variáveis de ambiente
│   │   ├── supabase_client.py  # Conexão com o Supabase
│   │   ├── auth.py         # Validação da API key dos dispositivos
│   │   ├── schemas.py      # Modelos de dados (Pydantic)
│   │   └── routes/         # Endpoints da API
│   │       ├── leituras.py
│   │       ├── dispositivos.py
│   │       ├── alertas.py
│   │       └── estatisticas.py
│   ├── requirements.txt    # Dependências Python
│   ├── vercel.json         # Configuração de deploy no Vercel
│   └── .env.example        # Modelo de variáveis de ambiente
│
├── wokwi/               # Código do ESP32 (MicroPython)
│   ├── main.py             # Loop principal (lê sensor, envia dados)
│   ├── boot.py             # Inicialização do ESP32
│   ├── config.py           # Configurações (WiFi, URL da API, API key)
│   └── diagram.json        # Circuito do Wokwi (ESP32 + DHT22)
│
└── frontend/               # Painel web (Next.js)
    ├── app/                # Páginas da aplicação
    │   ├── layout.tsx      # Layout geral (tema, fontes)
    │   ├── login/          # Página de login
    │   └── (dashboard)/    # Páginas protegidas (só para usuários logados)
    │       ├── page.tsx            # Visão geral (KPIs, gráficos, alertas)
    │       ├── leituras/           # Tabela de leituras com exportação CSV
    │       ├── alertas/            # Lista de alertas
    │       └── dispositivo/[id]/   # Detalhe de um dispositivo
    ├── components/         # Componentes reutilizáveis
    ├── lib/                # Funções auxiliares
    │   ├── supabase/       # Clientes Supabase (browser, servidor, middleware)
    │   ├── api.ts          # Chamadas ao backend FastAPI
    │   ├── hooks.ts        # Hooks de polling (atualização periódica dos dados)
    │   ├── types.ts        # Tipos TypeScript
    │   └── utils.ts        # Formatação de datas, números, CSV
    ├── middleware.ts        # Proteção de rotas (redireciona para /login)
    └── package.json        # Dependências Node.js
```

## Tecnologias usadas

| Tecnologia | Para que usamos |
|---|---|
| **ESP32 + DHT22** | Microcontrolador e sensor de temperatura/umidade |
| **MicroPython** | Linguagem de programação do ESP32 |
| **Wokwi** | Simulador online do circuito (não usamos hardware físico) |
| **FastAPI** | Framework Python para criar a API do backend |
| **Supabase** | Banco de dados PostgreSQL na nuvem, com autenticação |
| **Next.js 14** | Framework React para o frontend (dashboard) |
| **TypeScript** | Linguagem do frontend (JavaScript com tipagem) |
| **Tailwind CSS** | Estilização das páginas |
| **Recharts** | Gráficos de temperatura e umidade |
| **Vercel** | Hospedagem do backend e do frontend |

## Como rodar o projeto

### Pré-requisitos

- Conta no [Supabase](https://supabase.com) (gratuito)
- Conta no [Vercel](https://vercel.com) (gratuito)
- Conta no [Wokwi](https://wokwi.com) (gratuito)
- Python 3.11+ (para rodar o backend localmente)
- Node.js 18+ (para rodar o frontend localmente)

### Passo 1 — Banco de dados (Supabase)

1. Crie um projeto no [Supabase](https://supabase.com)
2. No **SQL Editor**, cole e execute o conteúdo de `database-schema.sql`
3. (Opcional) Execute `database-seed.sql` para ter dados de teste
4. Gere API keys reais para os dispositivos:
   ```sql
   UPDATE dispositivos SET api_key = encode(gen_random_bytes(32), 'hex') WHERE nome = 'ESP32-001' RETURNING api_key;
   UPDATE dispositivos SET api_key = encode(gen_random_bytes(32), 'hex') WHERE nome = 'ESP32-002' RETURNING api_key;
   ```
5. Em **Authentication > Users**, crie as contas dos integrantes do grupo
6. Anote a **URL do projeto**, a **anon key** e a **service_role key** (em Project Settings > API)

### Passo 2 — Backend (FastAPI)

Para rodar localmente:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edite o .env com a URL e service_role key do Supabase
uvicorn app.main:app --reload
```

Para deploy no Vercel:
1. Conecte o repositório no [Vercel](https://vercel.com)
2. Crie um projeto com **Root Directory** = `backend`
3. Adicione as variáveis de ambiente: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGINS`
4. Faça o deploy

### Passo 3 — Frontend (Next.js)

Para rodar localmente:

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edite o .env.local com a URL do Supabase, anon key e URL da API
npm run dev
```

Para deploy no Vercel:
1. Crie outro projeto no Vercel (mesmo repositório)
2. **Root Directory** = `frontend`
3. Adicione as variáveis: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`
4. Faça o deploy
5. Depois do deploy, atualize `CORS_ORIGINS` no backend para incluir a URL do frontend

### Passo 4 — ESP32 no Wokwi

1. Acesse [wokwi.com](https://wokwi.com) e crie um novo projeto **ESP32 MicroPython**
2. Copie os arquivos da pasta `wokwi/` para o projeto:
   - `main.py`, `boot.py`, `config.py`, `diagram.json`
3. No `config.py` do Wokwi, configure:
   - `API_BASE_URL` com a URL do backend no Vercel
   - `API_KEY` com a chave gerada no Passo 1
4. Clique em **Play** para iniciar a simulação
5. O terminal serial deve mostrar as leituras sendo enviadas

## Funcionalidades do dashboard

- **Visão geral** — KPIs (dispositivos online, total de leituras, alertas), cards de cada dispositivo e gráfico de temperatura/umidade
- **Detalhe do dispositivo** — Gráfico individual com faixas de limites, configuração dos thresholds de alerta
- **Leituras** — Tabela com filtros por dispositivo e período, exportação para CSV
- **Alertas** — Lista de alertas gerados automaticamente quando temperatura ou umidade saem dos limites
- **Atualização automática** — O dashboard consulta o banco a cada 5 segundos, mostrando dados novos sem precisar recarregar a página
- **Tema claro/escuro** — Alternável pelo botão no canto superior
