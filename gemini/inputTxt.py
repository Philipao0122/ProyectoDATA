import os
import sys
import json
from pathlib import Path
from typing import Optional, Dict, Any, List
from datetime import datetime
from dotenv import load_dotenv
import requests

class GroqClient:
    def __init__(self, api_key: str):
        """Inicializa el cliente de Groq."""
        self.api_key = api_key
        self.base_url = "https://api.groq.com/openai/v1"
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
    def chat_completion(self, messages: List[Dict[str, str]], model: str = "meta-llama/llama-4-scout-17b-16e-instruct") -> Dict[str, Any]:
        """Realiza una solicitud de chat completion a la API de Groq."""
        url = f"{self.base_url}/chat/completions"
        payload = {
            "model": model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        try:
            response = requests.post(
                url,
                headers=self.headers,
                json=payload,
                timeout=60
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error en la solicitud a Groq API: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Respuesta del servidor: {e.response.text}")
            raise

def get_groq_client() -> GroqClient:
    """Configura y retorna el cliente de Groq."""
    try:
        # Cargar variables de entorno
        env_path = Path(__file__).resolve().parent.parent / '.env'
        print(f"Buscando archivo .env en: {env_path}")
        
        if not env_path.exists():
            raise FileNotFoundError(f"No se encontró el archivo .env en {env_path}")
        
        # Cargar el archivo .env
        load_dotenv(env_path, override=True)
        print("Archivo .env cargado correctamente")
        
        # Verificar variable de entorno
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("ERROR: GROQ_API_KEY no está configurada en el archivo .env")
            
        return GroqClient(api_key)
        
    except Exception as e:
        print(f"Error al configurar el cliente de Groq: {str(e)}")
        raise

def analyze_text(text: str, model: str = "meta-llama/llama-4-scout-17b-16e-instruct") -> Dict[str, Any]:
    """
    Analiza el texto proporcionado utilizando la API de Groq.
    
    Args:
        text: Texto a analizar
        model: Modelo de Groq a utilizar
        
    Returns:
        Dict con la respuesta del modelo o información de error
    """
    print(f"\nIniciando análisis con modelo: {model}")
    print(f"Longitud del texto: {len(text)} caracteres")
    
    try:
        # Obtener cliente de Groq
        groq_client = get_groq_client()
        
        # Verificar que el texto no esté vacío
        if not text or len(text.strip()) < 10:
            return {
                "success": False,
                "error": "El texto proporcionado está vacío o es demasiado corto"
            }
        
        # Crear los mensajes para el chat
        messages = [
            {
                "role": "system",
                "content": """Eres un analista de noticias senior y experto en geopolítica y economía, con la habilidad de sintetizar información compleja en narrativas claras y contextualizadas. Tu objetivo no es solo listar eventos, sino explicar su significado.

Tarea: Genera una línea de tiempo analítica sobre el tema presente en el texto proporcionado.

Instrucciones para Expandir el Contexto (Reglas Clave):

1. Contexto Inicial (La "Pre-historia"): No empieces en el primer evento. Dedica un párrafo introductorio a explicar el escenario previo. ¿Qué condiciones políticas, tecnológicas o sociales existían que hicieron posible este conflicto/evento?
2. Secuencia Cronológica: Ordena los eventos en orden cronológico, pero agrupa los relacionados temáticamente.
3. Conexiones Causales: Explica cómo cada evento llevó al siguiente.
4. Impacto: Incluye el impacto de cada evento importante.
5. Conclusión: Proporciona una visión general de la situación actual y posibles desarrollos futuros."""
            },
            {
                "role": "user",
                "content": f"Analiza el siguiente texto y genera un análisis detallado siguiendo las instrucciones proporcionadas:\n\n{text}"
            }
        ]
        
        # Realizar la solicitud a la API de Groq
        print("Enviando solicitud a Groq API...")
        response = groq_client.chat_completion(messages, model=model)
        
        # Procesar la respuesta
        if "choices" in response and len(response["choices"]) > 0:
            analysis = response["choices"][0]["message"]["content"]
            
            # Calcular tokens usados
            usage = response.get("usage", {})
            
            return {
                "success": True,
                "analysis": analysis,
                "model": model,
                "usage": {
                    "prompt_tokens": usage.get("prompt_tokens", 0),
                    "completion_tokens": usage.get("completion_tokens", 0),
                    "total_tokens": usage.get("total_tokens", 0)
                }
            }
        
        # Configurar la solicitud
        url = f"{groq_client.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {groq_client.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": model,
            "messages": [{"role": "user", "content": f"Analiza el siguiente texto y genera un análisis detallado siguiendo las instrucciones proporcionadas:\n\n{text}"}],
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        print("\nEnviando solicitud a la API...")
        print(f"URL: {url}")
        print(f"Headers: {json.dumps(headers, indent=2)}")
        print(f"Modelo: {model}")
        
        # Realizar la petición con mayor tiempo de espera
        import requests
        from requests.adapters import HTTPAdapter
        from urllib3.util.retry import Retry
        
        # Configurar sesión con reintentos
        session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[500, 502, 503, 504]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("https://", adapter)
        
        print("\nRealizando petición a la API... (esto puede tardar unos segundos)")
        try:
            response = session.post(
                url,
                headers=headers,
                json=data,
                timeout=120  # Aumentar a 2 minutos
            )
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": "La solicitud a la API ha excedido el tiempo de espera (120 segundos)"
            }
        
        print(f"\nRespuesta recibida - Código: {response.status_code}")
        print(f"Headers de respuesta: {dict(response.headers)}")
        
        if response.status_code != 200:
            return {
                "success": False,
                "error": f"Error en la API: {response.status_code} - {response.text}",
                "status_code": response.status_code
            }
            
        result = response.json()
        
        # Procesar respuesta exitosa
        if "choices" in result and len(result["choices"]) > 0:
            response_content = result["choices"][0]["message"]["content"]
            usage_info = result.get("usage", {})
            
            print(f"\nAnálisis completado exitosamente")
            print(f"Tokens usados: {usage_info.get('total_tokens', 'N/A')}")
            
            return {
                "success": True,
                "analysis": response_content,
                "model": model,
                "usage": usage_info
            }
        else:
            return {
                "success": False,
                "error": f"Respuesta inesperada de la API: {result}",
                "raw_response": result
            }
        
    except Exception as e:
        error_msg = f"Error al analizar el texto: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": error_msg
        }

def analyze_text_from_file(file_path: str = None) -> Dict[str, Any]:
    """
    Lee texto de un archivo y lo envía a analizar.
    
    Args:
        file_path: Ruta opcional al archivo. Si no se proporciona, se usa la ruta por defecto
        
    Returns:
        Dict con la respuesta del análisis o información de error
    """
    try:
        # Si no se proporciona ruta, usar la ruta por defecto
        if file_path is None:
            file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'extracted_texts.txt')
        
        print(f"\n[analyze_text_from_file] Iniciando análisis del archivo: {file_path}")
        print(f"[analyze_text_from_file] Directorio actual: {os.getcwd()}")
        print(f"[analyze_text_from_file] Ruta absoluta del archivo: {os.path.abspath(file_path) if file_path else 'No disponible'}")
        
        # Verificar si el archivo existe
        if not os.path.exists(file_path):
            error_msg = f"El archivo no existe: {file_path}"
            print(f"❌ [analyze_text_from_file] {error_msg}")
            return {
                "success": False,
                "error": error_msg,
                "file_path": file_path,
                "absolute_path": os.path.abspath(file_path) if file_path else None,
                "cwd": os.getcwd(),
                "files_in_dir": os.listdir(os.path.dirname(file_path) if file_path else '.')
            }
        
        # Verificar permisos del archivo
        if not os.access(file_path, os.R_OK):
            error_msg = f"No se tienen permisos de lectura para el archivo: {file_path}"
            print(f"❌ [analyze_text_from_file] {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }
            
        # Leer el archivo
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read().strip()
        except UnicodeDecodeError:
            # Intentar con diferentes codificaciones si falla con UTF-8
            try:
                with open(file_path, "r", encoding="latin-1") as f:
                    text = f.read().strip()
            except Exception as e:
                error_msg = f"Error al leer el archivo con codificación UTF-8 o Latin-1: {str(e)}"
                print(f"❌ [analyze_text_from_file] {error_msg}")
                return {
                    "success": False,
                    "error": error_msg
                }
            
        print(f"[analyze_text_from_file] Tamaño del archivo: {len(text)} caracteres")
        
        # Verificar que el archivo no esté vacío
        if not text or len(text) < 10:  # Menos de 10 caracteres se considera vacío
            error_msg = "El archivo de texto está vacío o no tiene suficiente contenido"
            print(f"❌ [analyze_text_from_file] {error_msg}")
            return {
                "success": False,
                "error": error_msg,
                "file_path": file_path,
                "file_size": len(text)
            }
        
        # Mostrar una muestra del contenido para depuración
        sample = text[:200] + ('...' if len(text) > 200 else '')
        print(f"[analyze_text_from_file] Muestra del contenido (primeros 200 caracteres):\n---\n{sample}\n---")
            
        # Limitar el tamaño del texto si es muy grande
        max_length = 10000  # Aumentar el límite a 10,000 caracteres
        if len(text) > max_length:
            print(f"⚠️  [analyze_text_from_file] El texto es muy grande ({len(text)} caracteres). Recortando a {max_length} caracteres...")
            text = text[:max_length]
        
        print("[analyze_text_from_file] Llamando a analyze_text...")
        result = analyze_text(text)
        print(f"[analyze_text_from_file] Resultado de analyze_text: {result.get('success', False)}")
        
        return result
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        error_msg = f"Error en analyze_text_from_file: {str(e)}"
        print(f"❌ [analyze_text_from_file] {error_msg}\n{error_trace}")
        return {
            "success": False,
            "error": error_msg,
            "traceback": error_trace,
            "file_path": file_path,
            "absolute_path": os.path.abspath(file_path) if file_path else None,
            "cwd": os.getcwd()
        }

def main():
    """Función principal para uso como script independiente."""
    print("Iniciando análisis de texto...")
    
    try:
        # Usar la ruta por defecto
        result = analyze_text_from_file()
        
        # Mostrar resultados
        if result.get("success"):
            print("\n✅ Análisis completado exitosamente")
            print("=" * 60)
            print(result["analysis"])
            print("=" * 60)
            
            # Mostrar estadísticas de uso si están disponibles
            if result.get("usage"):
                usage = result["usage"]
                print(f"\n📊 Estadísticas de uso:")
                print(f"   - Modelo: {result.get('model', 'Desconocido')}")
                print(f"   - Tokens usados: {usage.get('total_tokens', 'N/A')}")
                print(f"   - Tokens de entrada: {usage.get('prompt_tokens', 'N/A')}")
                print(f"   - Tokens generados: {usage.get('completion_tokens', 'N/A')}")
                
            # Guardar el análisis en un archivo
            output_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'analysis_result.txt')
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(f"Análisis realizado el: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"Modelo: {result.get('model', 'Desconocido')}\n")
                f.write("=" * 60 + "\n\n")
                f.write(result["analysis"])
                
            print(f"\n💾 Resultados guardados en: {output_file}")
            
        else:
            print(f"\n❌ Error en el análisis: {result.get('error', 'Error desconocido')}")
            
    except KeyboardInterrupt:
        print("\n⚠️  Análisis interrumpido por el usuario")
        return 1
    except Exception as e:
        print(f"\n❌ Error inesperado: {str(e)}")
        return 1
        
    return 0

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nPrograma interrumpido por el usuario.")
        sys.exit(0)
    except Exception as e:
        print(f"\nError inesperado: {e}")
        sys.exit(1)
