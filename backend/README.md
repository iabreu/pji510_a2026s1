# Backend — FastAPI

API REST que recebe leituras dos ESP32 e atende o dashboard Next.js. Roda como serverless no Vercel.

## Stack

- **FastAPI** + **Pydantic v2** — framework web e validação
- **supabase-py** — cliente do Supabase (banco + auth)
- **Vercel Python** — deploy serverless

## Estrutura

```
backend/
├── api/
│   └── index.py            # Entry point do Vercel (importa app/)
├── app/
│   ├── main.py             # Cria FastAPI app, monta routers
│   ├── config.py           # Settings via pydantic-settings
│   ├── supabase_client.py  # Cliente Supabase (service_role)
│   ├── auth.py             # Autenticação por X-API-Key (ESP32)
│   ├── schemas.py          # Modelos Pydantic
│   └── routes/
│       ├── leituras.py
│       ├── dispositivos.py
│       ├── alertas.py
│       └── estatisticas.py
├── requirements.txt
├── vercel.json
└── .env.example
```

## Endpoints

### Health
- `GET /` — status da API
- `GET /health` — alias

### Leituras
- `POST /leituras` — registrar leitura (requer `X-API-Key`)
- `GET /leituras` — listar com filtros (`dispositivo_id`, `inicio`, `fim`, `limite`)
- `GET /leituras/recentes?horas=24&dispositivo_id=...` — atalho

### Dispositivos
- `GET /dispositivos` — listar todos com status atual
- `GET /dispositivos/{id}` — detalhar
- `PATCH /dispositivos/{id}/limites` — atualizar thresholds

### Alertas
- `GET /alertas` — listar com filtros
- `GET /alertas/recentes?horas=24` — atalho

### Estatísticas
- `GET /estatisticas/{dispositivo_id}?horas=24` — agregações (min, max, média, totais)

A documentação interativa está em `/docs` (Swagger) e `/redoc`.

## Rodar localmente

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Linux/Mac
# venv\Scripts\activate           # Windows

pip install -r requirements.txt

cp .env.example .env
# edite o .env com SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY

uvicorn app.main:app --reload
```

A API estará em `http://localhost:8000`. Docs em `http://localhost:8000/docs`.

## Deploy no Vercel

### Via dashboard (recomendado)

1. Acesse [vercel.com](https://vercel.com) e clique **Add New → Project**
2. Importe este repositório
3. Em **Root Directory**, selecione `backend/`
4. Em **Environment Variables**, adicione:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CORS_ORIGINS` (URL do frontend de produção)
5. Clique **Deploy**

### Via CLI

```bash
cd backend
npm i -g vercel
vercel deploy
# adicionar variáveis de ambiente:
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add CORS_ORIGINS
vercel --prod
```

## Testando o POST de leitura

```bash
# Substitua a URL e a API key
curl -X POST http://localhost:8000/leituras \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_api_key_do_dispositivo" \
  -d '{"temperatura": 23.5, "umidade": 65.2}'
```

Resposta esperada (201):

```json
{
  "id": "uuid-...",
  "dispositivo_id": "uuid-...",
  "temperatura": 23.5,
  "umidade": 65.2,
  "registrado_em": "2026-04-26T..."
}
```
