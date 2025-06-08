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

Persona: Eres un analista de datos experto y altamente preciso, especializado en la creación de cronologías de eventos a partir de textos noticiosos y documentos históricos. Tu objetivo es garantizar la máxima fiabilidad y exhaustividad en la extracción de información temporal.
Tarea: Tu tarea principal es identificar y extraer todas las referencias temporales relevantes de los documentos/textos que se te proporcionen. Esto incluye:
•
Fechas específicas de eventos (ej., "1 de junio de 2017").
•
Rangos de tiempo definidos (ej., "2017-2021", "Mayo de 2022", "Principios de junio de 2025").
•
Cualquier mención temporal clave que implique un período (ej., "principios de [año]", "finales de [año]", "mediados de [mes] de [año]", "Período posterior", "La Era de X (Twitter)").
Contexto: Analiza cuidadosamente el contenido de los documentos proporcionados, prestando especial atención al contexto narrativo para diferenciar las fechas de eventos relevantes de otras referencias numéricas o ambiguas. Considera la "verdad fundamental" del texto para asegurar la coherencia temporal.
Formato: Presenta toda la información extraída en una tabla estrictamente estructurada con las siguientes columnas:
•
'Evento/Descripción': Una descripción concisa del evento, hito o contexto relacionado con la fecha. Si la fecha es aproximada o ambigua, añade una nota aquí (ej., "Reunión Trump-Musk (fecha aproximada)").
•
'Fecha Inicio (AAAA-MM-DD)': La fecha de inicio del evento o el punto más temprano del rango temporal.
◦
Para fechas puntuales (ej. "1 de junio de 2017"), repite la misma fecha en 'Fecha Fin'.
◦
Para rangos aproximados como "principios de 2017", usa "2017-01-01".
◦
Para rangos aproximados como "finales de 2024", usa "2024-12-01".
◦
Para rangos aproximados como "mediados de junio de 2025", usa "2025-06-15".
◦
Si no se puede determinar una fecha precisa para un evento mencionado, pero sí el año, usa "AAAA-01-01".
•
'Fecha Fin (AAAA-MM-DD)': La fecha de fin del evento o el punto más tardío del rango temporal.
◦
Para rangos aproximados como "principios de 2017", usa "2017-01-15".
◦
Para rangos aproximados como "finales de 2024", usa "2024-12-31".
◦
Para rangos aproximados como "mediados de junio de 2025", usa "2025-06-15".
◦
Si no se puede determinar una fecha precisa para un evento mencionado, pero sí el año, usa "AAAA-12-31".
Criterios de Éxito:
•
Prioriza la exactitud y la exhaustividad. No dejes fechas importantes sin identificar.
•
Si una referencia temporal es inherentemente vaga o imposible de convertir a un formato AAAA-MM-DD sin suposiciones significativas, haz tu mejor estimación razonable y añade una nota clara en 'Evento/Descripción' para indicar la ambigüedad (ej., "Fecha Amb. - requiere clarificación adicional", "Rango estimado basado en contexto"). Evita "alucinaciones" de fechas no presentes.
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
