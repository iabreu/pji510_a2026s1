-- ============================================================================
-- Projeto Integrador V - UNIVESP
-- Seed: dados de teste para desenvolvimento do frontend
-- ============================================================================
-- Gera 24 horas de leituras (uma a cada 5 minutos) para cada dispositivo ativo,
-- com curva de temperatura realista (mais frio de madrugada, mais quente à tarde)
-- e alguns spikes fora dos limites para popular a tabela de alertas.
--
-- Como executar:
--   1. Execute database-schema.sql primeiro
--   2. Cole este arquivo no SQL Editor do Supabase e execute
-- ============================================================================

-- Limpar leituras existentes (CASCADE remove alertas associados também)
TRUNCATE leituras CASCADE;

-- Gerar 24h de leituras a cada 5 minutos para cada dispositivo ativo
DO $$
DECLARE
    v_dispositivo  RECORD;
    v_timestamp    TIMESTAMPTZ;
    v_temperatura  NUMERIC;
    v_umidade      NUMERIC;
    v_hora_do_dia  INTEGER;
BEGIN
    FOR v_dispositivo IN SELECT id, nome FROM dispositivos WHERE ativo LOOP
        v_timestamp := NOW() - INTERVAL '24 hours';

        WHILE v_timestamp <= NOW() LOOP
            v_hora_do_dia := EXTRACT(HOUR FROM v_timestamp);

            -- Curva diária de temperatura: pico ~18h, mínimo ~6h
            -- Base de 22°C +/- 6°C com ruído aleatório de +/- 1°C
            v_temperatura := 22 + 6 * SIN((v_hora_do_dia - 6) * PI() / 12)
                                + (RANDOM() - 0.5) * 2;

            -- Umidade: oscila entre ~50% e ~75%, anti-correlacionada com temperatura
            v_umidade     := 60 + 10 * SIN((v_hora_do_dia - 18) * PI() / 12)
                                + (RANDOM() - 0.5) * 5;

            -- ~2% das leituras: spike de temperatura para gerar alertas de demonstração
            IF RANDOM() < 0.02 THEN
                v_temperatura := v_temperatura + 8;
            END IF;

            -- ~1% das leituras: queda de umidade para gerar alerta
            IF RANDOM() < 0.01 THEN
                v_umidade := v_umidade - 35;
            END IF;

            INSERT INTO leituras (dispositivo_id, temperatura, umidade, registrado_em)
            VALUES (v_dispositivo.id,
                    ROUND(v_temperatura::NUMERIC, 2),
                    ROUND(GREATEST(LEAST(v_umidade, 100), 0)::NUMERIC, 2),
                    v_timestamp);

            v_timestamp := v_timestamp + INTERVAL '5 minutes';
        END LOOP;
    END LOOP;
END $$;

-- ============================================================================
-- Verificação: resumo das leituras geradas por dispositivo
-- ============================================================================
SELECT
    d.nome,
    d.localizacao,
    COUNT(l.id)                              AS total_leituras,
    MIN(l.registrado_em)                     AS primeira_leitura,
    MAX(l.registrado_em)                     AS ultima_leitura,
    ROUND(AVG(l.temperatura)::NUMERIC, 2)    AS temperatura_media,
    ROUND(MIN(l.temperatura)::NUMERIC, 2)    AS temperatura_min,
    ROUND(MAX(l.temperatura)::NUMERIC, 2)    AS temperatura_max,
    ROUND(AVG(l.umidade)::NUMERIC, 2)        AS umidade_media
FROM dispositivos d
LEFT JOIN leituras l ON l.dispositivo_id = d.id
GROUP BY d.id, d.nome, d.localizacao
ORDER BY d.nome;

-- ============================================================================
-- Verificação: alertas gerados (pelo trigger fn_gerar_alertas)
-- ============================================================================
SELECT
    d.nome,
    a.tipo,
    COUNT(*) AS quantidade
FROM dispositivos d
JOIN alertas a ON a.dispositivo_id = d.id
GROUP BY d.id, d.nome, a.tipo
ORDER BY d.nome, a.tipo;
