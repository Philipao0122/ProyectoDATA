import os
import sys
from openai import OpenAI

def main():
    print(" Iniciando el script...")
    
    # Configuración de la API
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key="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",
    )

    # Configuración opcional para OpenRouter
    extra_headers = {
        "HTTP-Referer": "https://tusitio.com",
        "X-Title": "MiScriptDePrueba",
    }

    # Leer el archivo de texto
    script_dir = os.path.dirname(os.path.abspath(__file__))
    ruta_txt = os.path.join(script_dir, "extracted_texts.txt")
    
    print(f" Buscando archivo en: {ruta_txt}")
    
    try:
        with open(ruta_txt, "r", encoding="utf-8") as f:
            texto = f.read()
        print(f" Archivo leído correctamente. Tamaño: {len(texto)} caracteres")
    except Exception as e:
        print(f" Error al leer el archivo: {e}")
        print("Asegúrate de que el archivo 'extracted_texts.txt' está en la misma carpeta que el script.")
        return

    # Crear el prompt
    prompt = f"""A continuación se presenta un texto:

{texto}

# Rol: Analista de noticias
# Tarea: Analiza el contenido, identifica el tema principal, busca eventos relacionados en los últimos 90 días, y genera una línea de tiempo con fuente y fecha.


1. Extrae el tema principal de la noticia ingresada.
2. Realiza una búsqueda contextual de los eventos más importantes relacionados con ese tema, ocurridos en los últimos 90 días.
3. Organiza los eventos encontrados en una línea de tiempo cronológica.
4. Para cada evento incluye:
   - Fecha exacta (si está disponible)
   - Descripción corta del evento
   - Fuente del evento (si aplica)

## Periodo analizado: Últimos 60 días

| Fecha       | Evento clave                                                         | Fuente (opcional)   |
|-------------|----------------------------------------------------------------------|---------------------|
| 2025-04-XX  | [Descripción breve del hecho ocurrido en esa fecha]                 | [Fuente o medio]    |
| 2025-05-XX  | [Otro hecho relacionado]                                             | [Fuente o medio]    |
| ...         | ...                                                                  | ...                 |

---

# 📰 Contraste entre medios (si aplica)

| Medio       | Enfoque/resumen del tratamiento de la noticia |
|-------------|-----------------------------------------------|
| [Medio A]   | [Resumen breve del ángulo del medio]          |
| [Medio B]   | [Resumen breve]                                |

---

# 📌 Conclusión

[Resumen de los hechos principales, evolución del tema y observaciones sobre el tratamiento periodístico si es relevante.]
"""

    print("\n Enviando solicitud al modelo...")
    
    try:
        # Llamar al modelo
        completion = client.chat.completions.create(
            model="deepseek/deepseek-r1-0528-qwen3-8b:free",
            messages=[{"role": "user", "content": prompt}],
            extra_headers=extra_headers,
        )
        
        # Mostrar la respuesta
        print("\n Respuesta del modelo:")
        print("-" * 50)
        print(completion.choices[0].message.content)
        print("-" * 50)
        
    except Exception as e:
        print(f"\n Error al llamar a la API: {e}")
        print("Por favor verifica tu conexión a internet y la configuración de la API.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n Programa interrumpido por el usuario.")
        sys.exit(0)
    except Exception as e:
        print(f"\n Error inesperado: {e}")
        sys.exit(1)
