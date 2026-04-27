# Banco de Dados — Supabase

Este diretório contém o schema e os dados de teste do banco PostgreSQL hospedado no Supabase.

## Arquivos

| Arquivo | Descrição |
|---|---|
| `database-schema.sql` | Schema completo: tabelas, índices, triggers, view e RLS |
| `database-seed.sql`   | Dados de teste — 24 h de leituras simuladas por dispositivo |

## Configurando o Supabase do zero

### 1. Criar o projeto

Acesse [supabase.com](https://supabase.com), crie um novo projeto e anote:

- **URL do projeto** (algo como `https://xxxxx.supabase.co`)
- **anon key** — usada pelo frontend
- **service_role key** — usada pelo backend (NUNCA exponha no frontend ou no GitHub)

### 2. Executar o schema

No painel do Supabase, vá em **SQL Editor → New query**, cole o conteúdo de `database-schema.sql` e clique em **Run**.

O schema é idempotente — pode ser executado várias vezes sem causar erro (faz `DROP IF EXISTS` no início).

### 3. Trocar as `api_key` dos dispositivos

O schema cria 2 dispositivos com chaves placeholder. Gere chaves seguras e atualize:

```sql
-- Gerar duas chaves aleatórias
SELECT 'ESP32-001' AS dispositivo, encode(gen_random_bytes(32), 'hex') AS api_key
UNION ALL
SELECT 'ESP32-002', encode(gen_random_bytes(32), 'hex');

-- Aplicar (substitua pelos valores gerados acima)
UPDATE dispositivos SET api_key = 'cole_aqui_a_chave_1' WHERE nome = 'ESP32-001';
UPDATE dispositivos SET api_key = 'cole_aqui_a_chave_2' WHERE nome = 'ESP32-002';
```

Anote as chaves — você vai usá-las no `wokwi/config.py` de cada placa.

### 4. (Opcional) Popular com dados de teste

Cole `database-seed.sql` no SQL Editor e execute. Isso cria 24 h de leituras simuladas para cada dispositivo, útil para desenvolver o frontend sem o ESP32 ligado.

### 5. Criar usuários do grupo

Em **Authentication → Users → Add user**, crie uma conta para cada integrante (Roberta, Ivan, Jairo, Rafael). Marque **"Auto Confirm User"** para pular o envio de email de confirmação.

Como decidimos não ter registro aberto, o login fica restrito a essas 4 contas pré-criadas.

## Estrutura

### Tabelas

- **dispositivos** — Cadastro dos ESP32 com seus limites (thresholds) e `api_key`
- **leituras** — Histórico de medições de temperatura e umidade
- **alertas** — Eventos gerados quando uma leitura sai dos limites

### View

- **vw_dispositivos_status** — Para cada dispositivo, retorna a última leitura e o status calculado (`online`/`offline`) baseado em `intervalo_offline_segundos`

### Triggers

- `trg_leituras_gerar_alertas` — Insere automaticamente em `alertas` quando uma leitura viola um limite
- `trg_dispositivos_atualizado_em` — Mantém `atualizado_em` em sincronia ao editar um dispositivo

### Realtime

As tabelas `dispositivos`, `leituras` e `alertas` estão na publicação `supabase_realtime`. O frontend assina mudanças via WebSocket — sem polling.

### Row Level Security

| Tabela | SELECT | UPDATE | INSERT/DELETE |
|---|---|---|---|
| dispositivos | `authenticated` | `authenticated` | apenas backend (`service_role`) |
| leituras | `authenticated` | — | apenas backend (`service_role`) |
| alertas | `authenticated` | — | apenas backend / trigger |

O backend FastAPI usa a `service_role` key para gravar leituras (bypassa RLS). O frontend Next.js usa a `anon` key + sessão do usuário autenticado para ler.
