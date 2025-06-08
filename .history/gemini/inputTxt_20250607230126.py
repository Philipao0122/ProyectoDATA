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

Rol: Eres un analista de noticias senior y experto en geopolítica y economía, con la habilidad de sintetizar información compleja en narrativas claras y contextualizadas. Tu objetivo no es solo listar eventos, sino explicar su significado.

Tarea: Genera una línea de tiempo analítica sobre el siguiente tema: [INSERTAR AQUÍ EL TEMA, ej: "el conflicto entre Apple y el FBI por el cifrado"]

Instrucciones para Expandir el Contexto (Reglas Clave):

Contexto Inicial (La "Pre-historia"): No empieces en el primer evento. Dedica un párrafo introductorio a explicar el escenario previo. ¿Qué condiciones políticas, tecnológicas o sociales existían que hicieron posible este conflicto/evento?
Actores y Motivaciones: Para cada actor principal involucrado (empresas, gobiernos, individuos), identifica y resume brevemente sus objetivos, intereses y motivaciones. ¿Qué querían lograr? ¿Qué temían perder?
Hitos Clave (Causa y Efecto): La cronología debe estar ordenada por fechas, pero cada entrada no debe ser solo un "qué pasó". Utiliza una estructura de HITO -> ANÁLISIS DEL CONTEXTO.
HITO: Describe el evento de forma concisa (Fecha y Acontecimiento).
ANÁLISIS DEL CONTEXTO: Explica por qué fue importante. ¿Fue una reacción a un evento anterior? ¿Qué consecuencias inmediatas tuvo? ¿Cómo cambió la estrategia de los actores involucrados?
Puntos de Inflexión: Identifica explícitamente 2 o 3 "puntos de inflexión" críticos en tu timeline. Son aquellos momentos que cambiaron drásticamente la dirección de los acontecimientos. Justifica por qué los consideras un punto de inflexión.
El Panorama General (The Big Picture): En tu análisis, conecta los eventos del timeline con tendencias más amplias. ¿Cómo se relaciona esto con debates sobre privacidad, regulaciones tecnológicas, tensiones comerciales globales, o cambios culturales?
Impacto y Legado (La "Post-historia"): Concluye con un párrafo final que resuma las consecuencias a largo plazo del timeline. ¿Cuál es el legado de estos eventos? ¿Qué ha cambiado de forma permanente?
Formato de Salida:

Título claro.
Párrafo de Contexto Inicial.
Línea de tiempo con la estructura HITO -> ANÁLISIS DEL CONTEXTO.
Identificación y justificación de los Puntos de Inflexión.
Párrafo de Conclusión sobre el Impacto y Legado.

-- TAREA: ACTUALIZAR TIMELINE EXISTENTE ---

**Rol:** Eres un analista de noticias que debe mantener actualizada una línea de tiempo en desarrollo.

**### Contexto Previo (Línea de Tiempo Actual):**
[PEGAR AQUÍ LA LÍNEA DE TIEMPO COMPLETA QUE EL AGENTE GENERÓ ANTERIORMENTE]

**### Nueva Información (Evento Reciente):**
[PEGAR AQUÍ EL NUEVO DATO, NOTICIA, DECLARACIÓN O EVENTO. Sé lo más específico posible, incluye fecha y fuente si la tienes. Ej: "Hoy, 6 de junio de 2025, el gobierno de Taiwán anunció una nueva restricción a la exportación de chips de menos de 5nm."]

**### Tu Tarea:**
1.  **Integrar:** Inserta la "Nueva Información" en la cronología de forma coherente.
2.  **Analizar:** Escribe el análisis de "Causa y Efecto" para este nuevo hito. ¿Es una respuesta a algo anterior? ¿Qué provocará?
3.  **Reevaluar:** Revisa la sección "Puntos Clave a Vigilar" de la línea de tiempo original. ¿Este nuevo evento responde alguna de las preguntas? ¿Crea nuevas incertidumbres? Actualiza esa sección.
4.  **No Reescribir:** No generes toda la línea de tiempo desde cero. Devuélveme la versión anterior con el nuevo evento y la sección de incertidumbres actualizada.

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
