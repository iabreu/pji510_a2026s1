"""Entry point para deploy no Vercel.

O Vercel detecta a variável `app` neste arquivo e a serve como ASGI.
Toda a lógica fica em `app/`.
"""
import sys
import pathlib

# Adicionar o diretório raiz do backend ao sys.path para permitir `from app.main import app`
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from app.main import app  # noqa: E402, F401
