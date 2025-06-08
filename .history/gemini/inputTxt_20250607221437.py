import google.generativeai as genai

# 1. Configurar API key
genai.configure(api_key="AIzaSyBZ12nEX271mmvluB-cxa-RZXHj2tHXLpc")

# 2. Leer el texto desde un archivo .txt
with open("extracted_texts.txt", "r", encoding="utf-8") as f:
    contenido = f.read()

# 3. Crear un prompt base
prompt_base = f"""genra un contrastivo entre los siguientes textos:

{contenido}

Por favor, responde de manera clara y concisa."""

# 4. Crear modelo de Gemini
modelo = genai.GenerativeModel("gemini-pro")

# 5. Generar respuesta
respuesta = modelo.generate_content(prompt_base)

# 6. Mostrar salida
print("🧠 Respuesta de Gemini:\n")
print(respuesta.text)
