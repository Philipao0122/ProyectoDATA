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

**Persona:** Eres un analista de inteligencia y tendencias, experto en sintetizar información compleja y en la construcción de líneas de tiempo. Tu especialidad es identificar la evolución de relaciones, dinámicas o conceptos, trazando sus puntos de convergencia, divergencia y transformación a lo largo del tiempo, basándote únicamente en el texto proporcionado. Tu objetivo es ser preciso, objetivo y ofrecer un análisis estructurado.

**Tarea:** Analiza en profundidad el siguiente texto para identificar **todos los hitos clave, eventos significativos, declaraciones, acciones, cambios de postura o momentos de inflexión que marcan la evolución de la dinámica, relación o concepto central descrito.** Debes enfocarte en los puntos de convergencia (similares a "alianzas") y divergencia (similares a "rupturas"), así como en cualquier fase neutral o de cambio de postura.

**Contexto:** El texto a analizar es el siguiente:

"Aquí debes pegar el contenido completo del artículo o fuente a analizar"

**Formato:** Presenta la información en una **tabla cronológica clara y concisa**. La tabla debe tener las siguientes columnas:
1.  **Fecha:** La fecha específica del evento (o el período si es un lapso).
2.  **Hito Clave:** Una descripción breve y concisa del evento, declaración o fase.
3.  **Tipo de Dinámica/Evento:** Clasifica la interacción o el momento como "Convergencia/Alianza", "Divergencia/Conflicto", "Fase Neutral", "Cambio de Postura", o "Hito Transformador". Si aplica, puedes usar múltiples etiquetas.
4.  **Detalles Relevantes e Impacto:** Proporciona un breve resumen del contexto, la causa o los detalles cruciales del hito, incluyendo cualquier información clave que se derive del texto.
Asegúrate de que la línea de tiempo comience con el evento más antiguo y termine con el más reciente mencionado en el texto.
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
