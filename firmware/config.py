"""Configurações do dispositivo.

IMPORTANTE: Este arquivo deve ser editado em cada placa com as credenciais
específicas dela. NUNCA comite valores reais — use os placeholders abaixo.
"""

# Wi-Fi --------------------------------------------------------------------
# No Wokwi, use a rede padrão "Wokwi-GUEST" sem senha.
# Em hardware real, coloque o SSID/senha da sua rede.
WIFI_SSID = "Wokwi-GUEST"
WIFI_PASSWORD = ""

# API Backend --------------------------------------------------------------
# URL do FastAPI deployado no Vercel (sem barra final).
# Em desenvolvimento local, NÃO use http://localhost — o ESP32 está em outra
# rede. Use o IP da sua máquina na LAN ou um túnel (ex: ngrok).
API_BASE_URL = "https://seu-backend.vercel.app"

# Endpoint de envio de leituras
ENDPOINT_LEITURAS = API_BASE_URL + "/leituras"

# Chave única deste dispositivo (gerada no Supabase, ver docs/README.md)
API_KEY = "troque_esta_chave_pelo_valor_real_do_supabase"

# Comportamento ------------------------------------------------------------
# Intervalo entre leituras, em segundos
INTERVALO_LEITURA_SEGUNDOS = 30

# Pino digital onde o DHT22 está conectado
PINO_DHT22 = 4

# Timeout de requisições HTTP (segundos)
TIMEOUT_HTTP_SEGUNDOS = 10

# Tentativas de reenvio em caso de falha
MAX_TENTATIVAS = 3
