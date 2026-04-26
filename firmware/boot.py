# boot.py — executado uma vez ao ligar o ESP32, antes de main.py.
# Mantém-se mínimo: a lógica fica em main.py.
import gc
import esp

esp.osdebug(None)  # silencia logs do firmware no console
gc.collect()
