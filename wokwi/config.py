# No Wokwi, use "Wokwi-GUEST" sem senha.
# Em hardware real, coloque o SSID/senha da sua rede.
WIFI_SSID = "Wokwi-GUEST"
WIFI_PASSWORD = ""

# URL do FastAPI no Vercel (sem barra final).
# No dev local, use o IP da máquina na LAN ou um túnel (ngrok), não localhost.
API_BASE_URL = "https://seu-backend.vercel.app"
ENDPOINT_LEITURAS = API_BASE_URL + "/leituras"

# Chave do dispositivo (gerada no Supabase)
API_KEY = "troque_esta_chave_pelo_valor_real_do_supabase"

INTERVALO_LEITURA_SEGUNDOS = 30
PINO_DHT22 = 4
TIMEOUT_HTTP_SEGUNDOS = 10
MAX_TENTATIVAS = 3
