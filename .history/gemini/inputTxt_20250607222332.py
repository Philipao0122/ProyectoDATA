from openai import OpenAI

# === CONFIGURACIÓN ===
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",  # <-- Reemplaza aquí tu API key
)

# === OPCIONAL: PARA APARECER EN EL RANKING DE OPENROUTER ===
extra_headers = {
    "HTTP-Referer": "https://tusitio.com",  # <-- Opcional: URL de tu sitio web
    "X-Title": "MiScriptDePrueba",         # <-- Opcional: Título para OpenRouter
}

# === LEER ARCHIVO .TXT ===
ruta_txt = "extracted_texts.txt"
with open(ruta_txt, "r", encoding="utf-8") as f:
    texto = f.read()

# === PROMPT BASE ===
prompt = f"""
A continuación se presenta un texto:

\"\"\"{texto}\"\"\"

Por favor, realiza un resumen conciso y profesional del contenido.
"""

# === LLAMAR AL MODELO ===
completion = client.chat.completions.create(
    model="deepseek/deepseek-r1-0528-qwen3-8b:free",  # Puedes cambiar a otro
    messages=[
        {
            "role": "user",
            "content": prompt
        }
    ],
    extra_headers=extra_headers,
)

# === MOSTRAR RESULTADO ===
print("\n📄 Respuesta del modelo:\n")
print(completion.choices[0].message.content)
