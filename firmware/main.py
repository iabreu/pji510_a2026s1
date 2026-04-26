"""Loop principal do ESP32.

Conecta ao Wi-Fi, lê temperatura e umidade do DHT22 e envia para o backend
FastAPI a cada INTERVALO_LEITURA_SEGUNDOS.
"""
import time
import network
import urequests
import ujson
import dht
from machine import Pin

import config


# ============================================================================
# Wi-Fi
# ============================================================================
def conectar_wifi():
    """Conecta na rede Wi-Fi configurada e aguarda obter IP."""
    sta = network.WLAN(network.STA_IF)
    sta.active(True)

    if not sta.isconnected():
        print("[wifi] conectando em '{}'...".format(config.WIFI_SSID))
        sta.connect(config.WIFI_SSID, config.WIFI_PASSWORD)

        tentativas = 0
        while not sta.isconnected() and tentativas < 30:
            time.sleep(1)
            tentativas += 1
            print("  ... tentativa {}".format(tentativas))

    if sta.isconnected():
        print("[wifi] conectado. IP: {}".format(sta.ifconfig()[0]))
        return True
    else:
        print("[wifi] falha ao conectar")
        return False


# ============================================================================
# Sensor
# ============================================================================
def ler_sensor(sensor):
    """Lê o DHT22 e retorna (temperatura, umidade) ou (None, None) em erro."""
    try:
        sensor.measure()
        return sensor.temperature(), sensor.humidity()
    except OSError as e:
        print("[sensor] erro de leitura: {}".format(e))
        return None, None


# ============================================================================
# Envio HTTP
# ============================================================================
def enviar_leitura(temperatura, umidade):
    """Envia POST /leituras para o backend. Retorna True se 2xx."""
    payload = ujson.dumps({
        "temperatura": temperatura,
        "umidade": umidade,
    })
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": config.API_KEY,
    }

    for tentativa in range(1, config.MAX_TENTATIVAS + 1):
        try:
            print("[http] POST {} (tentativa {})".format(
                config.ENDPOINT_LEITURAS, tentativa
            ))
            resp = urequests.post(
                config.ENDPOINT_LEITURAS,
                data=payload,
                headers=headers,
                timeout=config.TIMEOUT_HTTP_SEGUNDOS,
            )
            status = resp.status_code
            resp.close()

            if 200 <= status < 300:
                print("[http] ok ({})".format(status))
                return True
            else:
                print("[http] erro http {}".format(status))
        except Exception as e:
            print("[http] excecao: {}".format(e))

        # backoff antes de retentar
        if tentativa < config.MAX_TENTATIVAS:
            time.sleep(2 * tentativa)

    return False


# ============================================================================
# Loop principal
# ============================================================================
def main():
    print("\n=== Projeto Integrador V — UNIVESP ===")
    print("Inicializando ESP32...")

    if not conectar_wifi():
        print("[main] sem wifi, parando.")
        return

    sensor = dht.DHT22(Pin(config.PINO_DHT22))
    print("[main] sensor DHT22 inicializado no pino {}".format(config.PINO_DHT22))
    print("[main] iniciando loop (intervalo: {}s)\n".format(
        config.INTERVALO_LEITURA_SEGUNDOS
    ))

    while True:
        temperatura, umidade = ler_sensor(sensor)

        if temperatura is not None and umidade is not None:
            print("[leitura] temp: {:.1f} C | umid: {:.1f} %".format(
                temperatura, umidade
            ))
            enviar_leitura(temperatura, umidade)
        else:
            print("[leitura] falhou, pulando envio")

        time.sleep(config.INTERVALO_LEITURA_SEGUNDOS)


# Executar
try:
    main()
except KeyboardInterrupt:
    print("\n[main] interrompido pelo usuario")
except Exception as e:
    print("\n[main] erro fatal: {}".format(e))
    raise
