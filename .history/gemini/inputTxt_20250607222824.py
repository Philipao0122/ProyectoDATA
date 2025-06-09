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

# Contraste de Noticias

## 📰 Fuentes analizadas:
- Semana
- El Tiempo
- El Espectador
- El País

## 📌 Comparativa de enfoques

### 1. Semana
- **Tono**: Crítico
- **Foco**: Trump cuestiona salud mental de Musk

### 2. El Tiempo
- **Tono**: Financiero / dramático
- **Foco**: Pérdida de valor de Musk tras disputa

### 3. El Espectador
- **Tono**: Sensacionalista
- **Foco**: Cruce de insultos “loco” vs “ingrato”

### 4. El País
- **Tono**: Denuncia
- **Foco**: Acusación de Musk a Trump por supuesta relación con Epstein

---

## 🧭 Línea de tiempo de eventos clave

| Fecha estimada | Evento |
|----------------|--------|
| [Año] | Inicio de tensiones entre Musk y Trump (Musk critica políticas) |
| [Mes] | Trump hace comentarios sarcásticos sobre Musk |
| [Día] | Musk responde con acusación pública |
| [Día] | Medios reportan pérdida financiera de Musk |
| [Actualidad] | Declaraciones cruzadas y cobertura en medios internacionales |

---

## 🔍 Conclusión

[Breve análisis del impacto de este cruce en la imagen pública de ambos y cómo los medios influyen en la percepción.]
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
