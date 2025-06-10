import traceback
from flask import Flask, request, jsonify, send_from_directory, send_file, make_response
from flask_cors import CORS, cross_origin
from PIL import Image
import requests
from io import BytesIO, StringIO
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import os
import logging
import sys
import pytesseract
from werkzeug.serving import WSGIRequestHandler
import tempfile
from datetime import datetime
import subprocess
import json
from pathlib import Path
import sys
import os

# Agregar el directorio raíz del proyecto al path para poder importar el módulo inputTxt
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.append(project_root)

# Importar el módulo de análisis de texto
from gemini.inputTxt import analyze_text, analyze_text_from_file

# Configure CORS
cors = CORS()

def create_app():
    app = Flask(__name__)
    cors.init_app(app)
    return app

app = create_app()

# Configure CORS to allow all origins
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configure Tesseract path (update this to your Tesseract installation path)
if sys.platform == 'win32':
    # Common Tesseract installation paths on Windows
    tesseract_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
    ]
    for path in tesseract_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            break
    else:
        print("Warning: Tesseract not found in common locations. Please ensure it's installed and in your PATH.")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create temp directory if it doesn't exist
temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp')
os.makedirs(temp_dir, exist_ok=True)

# Path for the text file to store all extracted text
text_file_path = os.path.join(temp_dir, 'extracted_texts.txt')

# Ensure the text file exists
try:
    if not os.path.exists(text_file_path):
        with open(text_file_path, 'w', encoding='utf-8') as f:
            f.write('Archivo de textos extraídos\n' + '=' * 30 + '\n\n')
except Exception as e:
    logger.error(f'Error creating text file: {str(e)}')

def save_extracted_text(text: str, image_url: str = None):
    """
    Guarda el texto extraído en el archivo, incluyendo la fuente de la imagen si se proporciona.
    
    Args:
        text: Texto extraído de la imagen
        image_url: URL de la imagen de donde se extrajo el texto (opcional)
    """
    try:
        # 1. Asegurarse de que el directorio temporal existe
        os.makedirs(temp_dir, exist_ok=True)
        logger.info(f'Directorio temporal: {temp_dir}')
        logger.info(f'Ruta del archivo de texto: {text_file_path}')
        
        # 2. Guardar en la ubicación temporal local
        with open(text_file_path, 'a', encoding='utf-8') as f:
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            entry = f'\n\n--- {timestamp} ---\n'
            if image_url:
                entry += f'[Fuente: {image_url}]\n\n'
            entry += text.strip() + '\n' + '='*50 + '\n'
            f.write(entry)
        
        # 3. Verificar que el archivo se guardó correctamente
        if not os.path.exists(text_file_path):
            logger.error(f'Error: No se pudo crear el archivo {text_file_path}')
            return False
            
        file_size = os.path.getsize(text_file_path)
        logger.info(f'Texto guardado correctamente. Tamaño del archivo: {file_size} bytes')
        
        # 4. Leer el contenido para verificación
        try:
            with open(text_file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                logger.info(f'Contenido actual del archivo (primeros 200 caracteres): {content[:200]}...')
                
                # Extraer fuentes de imágenes del contenido
                import re
                source_matches = re.findall(r'\[Fuente: (.*?)\]', content)
                image_sources = list(set(source_matches))  # Eliminar duplicados
                logger.info(f'Fuentes de imágenes encontradas: {image_sources}')
                
                return True
                
        except Exception as e:
            logger.error(f'Error al verificar el archivo guardado: {str(e)}')
            return False
            
    except Exception as e:
        logger.error(f'Error en save_extracted_text: {str(e)}', exc_info=True)
        return False
    
    try:
        # 3. Crear la ruta de destino en la carpeta gemini
        gemini_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'gemini'))
        os.makedirs(gemini_dir, exist_ok=True)
        gemini_text_path = os.path.join(gemini_dir, 'extracted_texts.txt')
        
        # 4. Copiar el archivo a la carpeta gemini
        import shutil
        shutil.copy2(text_file_path, gemini_text_path)
        logger.info(f'Archivo de texto copiado a: {gemini_text_path}')
        
        # Verificar que el archivo se copió correctamente
        if not os.path.exists(gemini_text_path):
            raise Exception(f'No se pudo copiar el archivo a {gemini_text_path}')
            
        logger.info(f'Tamaño del archivo copiado: {os.path.getsize(gemini_text_path)} bytes')
        
        # 5. Ejecutar el análisis automáticamente
        logger.info('Iniciando análisis automático del texto...')
        
        # Asegurarse de que el módulo inputTxt esté en el path
        gemini_dir_parent = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        if gemini_dir_parent not in sys.path:
            sys.path.append(gemini_dir_parent)
        
        logger.info(f'Buscando inputTxt en: {sys.path}')
        
        from gemini.inputTxt import analyze_text_from_file
        logger.info('Módulo inputTxt importado correctamente')
        
        # Llamar a la función de análisis
        logger.info(f'Analizando archivo: {gemini_text_path}')
        result = analyze_text_from_file(gemini_text_path)
        
        logger.info(f'Resultado del análisis: {result}')
        
        try:
            if result.get('success'):
                # Guardar el resultado del análisis
                analysis_path = os.path.join(gemini_dir, 'analysis_result.txt')
                analysis_content = result.get('analysis', 'No se pudo generar el análisis')
                
                # Guardar el análisis en un archivo
                with open(analysis_path, 'w', encoding='utf-8') as f:
                    f.write(analysis_content)
                
                logger.info(f'Análisis guardado en: {analysis_path}')
                logger.info(f'Tamaño del archivo de análisis: {os.path.getsize(analysis_path)} bytes')
                
                return {
                    "status": "success", 
                    "analysis_path": analysis_path,
                    "analysis": analysis_content
                }
            else:
                error_msg = result.get("error", "Error desconocido en el análisis")
                logger.error(f'Error en el análisis: {error_msg}')
                return {
                    "status": "error",
                    "message": f"Error en el análisis: {error_msg}",
                    "details": result
                }
                    
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            logger.error(f'Error al ejecutar el análisis: {str(e)}\n{error_details}')
            return {
                "status": "error", 
                "message": f"Error al ejecutar el análisis: {str(e)}",
                "traceback": error_details
            }
            
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        error_msg = f'Error al guardar el texto extraído: {str(e)}'
        logger.error(f'{error_msg}\n{error_details}')
        return {
            "status": "error", 
            "message": error_msg,
            "traceback": error_details
        }

# CORS is already configured above

# Log all requests
@app.before_request
def log_request_info():
    if request.path != '/':  # Skip logging for static files unless needed
        logger.info(f'Request: {request.method} {request.path}')
        logger.info(f'Headers: {dict(request.headers)}')
        if request.get_data():
            logger.info(f'Body: {request.get_data().decode()}')

@app.after_request
def after_request(response):
    # Skip logging for static files
    if request.path.startswith('/static/'):
        return response
    
    # Log response status and data if it's JSON
    response_data = None
    try:
        if response.is_json:
            response_data = response.get_json()
    except Exception:
        pass
        
    if response_data:
        logger.info(f'Response: {response.status} {response_data}')
    else:
        logger.info(f'Response: {response.status} [Non-JSON response]')
        
    return response

def obtener_imagen_instagram(url):
    # Configurar Selenium
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    
    # Configurar el navegador para parecer más real
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        # Abrir la URL
        driver.get(url)
        
        # Esperar a que la página cargue completamente
        time.sleep(5)
        
        # Intentar diferentes selectores comunes de Instagram
        selectores = [
            "//img[contains(@alt, 'Photo by')]",  # Selector por atributo alt
            "//div[contains(@class, 'x5yr21d')]//img",  # Selector por clase contenedora
            "//div[contains(@class, '_aagv')]//img",  # Clase común para imágenes
            "//article//img",  # Último recurso: cualquier imagen dentro de un artículo
            "//img[contains(@src, 'scontent.cdninstagram.com')]"  # Selector por dominio de la imagen
        ]
        
        img_element = None
        for selector in selectores:
            try:
                elements = driver.find_elements("xpath", selector)
                for element in elements:
                    src = element.get_attribute('src')
                    if src and 'http' in src:
                        img_element = element
                        break
                if img_element:
                    break
            except:
                continue
        
        if not img_element:
            # Tomar captura de pantalla para depuración
            driver.save_screenshot('debug_screenshot.png')
            print("Se ha guardado una captura de pantalla para depuración: debug_screenshot.png")
            raise Exception("No se pudo encontrar ningún elemento de imagen con los selectores conocidos")
        
        img_url = img_element.get_attribute('src')
        if not img_url:
            raise Exception("La URL de la imagen está vacía")
            
        # Descargar imagen
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(img_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        img = Image.open(BytesIO(response.content))
        logger.info(f'Imagen descargada - Dimensiones originales: {img.width}x{img.height}')
        return img

    except Exception as e:
        print(f"Error al obtener la imagen: {str(e)}")
        return None
    finally:
        driver.quit()

@app.route('/extract-image', methods=['POST'])
def extract_image():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'URL no proporcionada'}), 400
    
    try:
        img = obtener_imagen_instagram(data['url'])
        if img:
            # Create a temporary file while preserving original image quality
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg', dir=temp_dir) as temp_file:
                # Save with maximum quality (100) and original dimensions
                img.save(temp_file, 'JPEG', quality=100, optimize=True, progressive=True)
                temp_filename = os.path.basename(temp_file.name)
            
            image_url = f'http://{request.host}/download/{temp_filename}'
            logger.info(f'Imagen guardada con dimensiones originales: {img.width}x{img.height}')
            
            # Extract text using pytesseract
            try:
                # Convert image to RGB if it's not
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Extract text in Spanish and English
                text = pytesseract.image_to_string(img, lang='spa+eng')
                
                if text and text.strip():
                    logger.info(f'Successfully extracted text: {text[:100]}...')  # Log first 100 chars
                    save_extracted_text(text)
                else:
                    logger.info('No text was extracted from the image')
            except Exception as e:
                logger.error(f'Error extracting text: {str(e)}', exc_info=True)
                # Continue even if text extraction fails - we still want to return the image
            
            return jsonify({
                'success': True,
                'image_url': image_url
            })
        else:
            return jsonify({'error': 'No se pudo extraer la imagen'}), 500
    except Exception as e:
        logger.error(f'Error processing image: {str(e)}', exc_info=True)
        return jsonify({'error': f'Error al procesar la imagen: {str(e)}'}), 500

# Route to serve downloaded images
@app.route('/download/<filename>')
def download_file(filename):
    try:
        file_path = os.path.join(temp_dir, filename)
        if os.path.exists(file_path):
            return send_file(file_path, mimetype='image/jpeg')
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        logger.error(f'Error serving file {filename}: {str(e)}')
        return jsonify({'error': 'Error serving file'}), 500

@app.route('/extract-text', methods=['POST', 'OPTIONS'])
@cross_origin()
def extract_text():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response, 200

    try:
        data = request.get_json()
        logger.info(f'Datos recibidos en extract-text: {data}')
        
        if not data or 'image_url' not in data:
            error_msg = 'No se proporcionó la URL de la imagen en la solicitud'
            logger.error(error_msg)
            return jsonify({'success': False, 'error': error_msg}), 400
        
        image_url = data['image_url']
        max_retries = 3  # Número máximo de intentos de extracción
        attempts = 0
        text = ''
        
        logger.info(f'Procesando URL de imagen: {image_url}')
        
        # Skip temporary files
        if 'tmp' in image_url or 'temp' in image_url:
            logger.info('Skipping temporary file')
            return jsonify({
                'success': False,
                'error': 'Archivo temporal omitido',
                'skipped': True
            })
        
        while attempts < max_retries and not text.strip():
            attempts += 1
            logger.info(f'Extraction attempt {attempts}/{max_retries}')
            
            try:
                # Download the image
                response = requests.get(image_url, stream=True, timeout=10)
                response.raise_for_status()
                
                # Open the image
                img = Image.open(BytesIO(response.content))
                
                # Apply image preprocessing for better OCR
                # 1. Convert to grayscale
                img = img.convert('L')
                
                # 2. Increase contrast
                from PIL import ImageEnhance
                enhancer = ImageEnhance.Contrast(img)
                img = enhancer.enhance(2.0)
                
                # 3. Resize if too small
                if min(img.size) < 300:
                    ratio = 300 / min(img.size)
                    new_size = (int(img.width * ratio), int(img.height * ratio))
                    img = img.resize(new_size, Image.Resampling.LANCZOS)
                
                # Extract text using pytesseract with custom config
                custom_config = r'--oem 3 --psm 6 -c preserve_interword_spaces=1'
                text = pytesseract.image_to_string(img, lang='spa+eng', config=custom_config)
                
                # Clean up the extracted text
                text = text.strip()
                
                if text:
                    logger.info(f'Successfully extracted text: {text[:100]}...')
                    break
                    
                logger.warning(f'No text extracted on attempt {attempts}')
                
            except Exception as e:
                logger.error(f'Error in extraction attempt {attempts}: {str(e)}')
                if attempts == max_retries:
                    raise
                
                # Wait before retry
                import time
                time.sleep(1)
        
        if not text.strip():
            logger.error('Failed to extract text after all attempts')
            return jsonify({
                'success': False,
                'error': 'No se pudo extraer texto de la imagen después de varios intentos',
                'attempts': attempts
            })
        
        # Save the extracted text with image URL
        save_extracted_text(text, image_url)
        
        return jsonify({
            'success': True,
            'text': text,
            'attempts': attempts
        })
        
    except requests.exceptions.RequestException as e:
        error_msg = f'Error downloading image: {str(e)}'
        logger.error(error_msg)
        return jsonify({
            'success': False,
            'error': f'Error al descargar la imagen: {str(e)}',
            'attempts': attempts if 'attempts' in locals() else 1
        }), 400
    except Exception as e:
        error_msg = f'Error processing image: {str(e)}'
        logger.error(error_msg, exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Error al procesar la imagen: {str(e)}',
            'attempts': attempts if 'attempts' in locals() else 1
        }), 500

@app.route('/analysis-result/<image_id>', methods=['GET'])
def get_analysis_result(image_id):
    """
    Endpoint to get the analysis result for a specific image.
    """
    try:
        # In a real app, you would use the image_id to find the specific analysis
        # For now, we'll just return the latest analysis
        analysis_file = os.path.join(temp_dir, 'analysis_result.txt')
        
        if not os.path.exists(analysis_file):
            return jsonify({
                'success': False,
                'error': 'No analysis available'
            }), 404
            
        with open(analysis_file, 'r', encoding='utf-8') as f:
            analysis_content = f.read()
            
        return jsonify({
            'success': True,
            'analysis': analysis_content,
            'model': 'meta-llama/llama-4-scout-17b-16e-instruct',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f'Error getting analysis result: {str(e)}', exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Error getting analysis result: {str(e)}'
        }), 500

@app.route('/analyze-texts', methods=['POST'])
def analyze_texts():
    """
    Endpoint para analizar el texto extraído usando el modelo de IA.
    Esta es una versión mejorada que usa el módulo inputTxt directamente.
    """
    try:
        logger.info("Solicitud recibida en /analyze-texts")
        
        # Asegurarse de que el archivo existe y tiene contenido
        if not os.path.exists(text_file_path):
            error_msg = 'No hay textos extraídos para analizar'
            logger.error(error_msg)
            return jsonify({
                'success': False,
                'error': error_msg
            }), 400
        
        # Verificar el contenido del archivo
        with open(text_file_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            
        if len(content) <= 50:  # Solo encabezado o vacío
            error_msg = 'No hay suficiente texto para analizar'
            logger.warning(error_msg)
            return jsonify({
                'success': False,
                'error': error_msg
            }), 400
        
        # Asegurarse de que el directorio gemini existe
        gemini_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'gemini')
        os.makedirs(gemini_dir, exist_ok=True)
        
        # Ruta al archivo de texto en el directorio gemini
        gemini_text_path = os.path.join(gemini_dir, 'extracted_texts.txt')
        
        # Copiar el archivo de texto al directorio gemini
        logger.info(f"Copiando {text_file_path} a {gemini_text_path}")
        with open(text_file_path, 'r', encoding='utf-8') as src_file, \
             open(gemini_text_path, 'w', encoding='utf-8') as dest_file:
            dest_file.write(content)
        
        # Importar el módulo de análisis dinámicamente
        logger.info("Importando módulo de análisis")
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from gemini.inputTxt import analyze_text_from_file
        
        # Ejecutar el análisis
        logger.info("Iniciando análisis del texto...")
        result = analyze_text_from_file(gemini_text_path)
        
        # Verificar el resultado
        if result.get('success', False):
            logger.info("Análisis completado con éxito")
            return jsonify({
                'success': True,
                'analysis': result.get('analysis', ''),
                'model': result.get('model', 'unknown'),
                'usage': result.get('usage', {})
            })
        else:
            error_msg = result.get('error', 'Error desconocido al analizar el texto')
            logger.error(f"Error en el análisis: {error_msg}")
            return jsonify({
                'success': False,
                'error': error_msg
            }), 500
            
    except ImportError as e:
        error_msg = f'Error al importar el módulo de análisis: {str(e)}'
        logger.error(error_msg, exc_info=True)
        return jsonify({
            'success': False,
            'error': error_msg
        }), 500
        
    except Exception as e:
        error_msg = f'Error inesperado al analizar los textos: {str(e)}'
        logger.error(error_msg, exc_info=True)
        return jsonify({
            'success': False,
            'error': error_msg
        }), 500

@app.route('/download-texts', methods=['GET'])
def download_texts():
    try:
        # Verificar si el archivo existe
        if not os.path.exists(text_file_path):
            with open(text_file_path, 'w', encoding='utf-8') as f:
                f.write('Archivo de textos extraídos\n' + '=' * 30 + '\n\n')
            return jsonify({"error": "No se ha extraído ningún texto aún"}), 404
            
        # Verificar si el archivo tiene contenido
        with open(text_file_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            
        if len(content) <= 50:  # Solo el encabezado o vacío
            return jsonify({"error": "No hay contenido para descargar"}), 404
            
        # Crear una respuesta con el archivo
        response = make_response(send_file(
            text_file_path,
            as_attachment=True,
            download_name='extracted_texts.txt',
            mimetype='text/plain; charset=utf-8'
        ))
        
        # Configurar headers para forzar la descarga
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        
        return response
        
    except Exception as e:
        logger.error(f'Error al descargar archivo: {str(e)}')
        return jsonify({"error": f"Error al descargar el archivo: {str(e)}"}), 500

from gemini import inputTxt

@app.route('/analyze-text', methods=['POST'])
def analyze_extracted_text():
    """
    Endpoint para analizar el texto extraído usando el modelo de IA.
    Incluye información sobre las fuentes de las imágenes utilizadas.
    """
    try:
        logger.info("="*50)
        logger.info("INICIANDO ANÁLISIS DE TEXTO")
        logger.info("="*50)
        
        # Obtener datos de la solicitud
        request_data = request.get_json()
        logger.info(f"Datos de la solicitud: {json.dumps(request_data, indent=2) if request_data else 'No hay datos'}")
        
        content = ""
        image_sources = []
        
        # 1. Intentar obtener el texto del cuerpo de la solicitud primero
        if request_data and 'texts' in request_data and isinstance(request_data['texts'], list):
            logger.info("Procesando textos desde el cuerpo de la solicitud")
            for item in request_data['texts']:
                if 'text' in item:
                    content += str(item['text']).strip() + "\n\n"
                if 'source' in item.get('metadata', {}):
                    source = item['metadata']['source']
                    if source and source not in image_sources:
                        image_sources.append(source)
                        logger.info(f"Fuente encontrada en metadata: {source}")
        
        # 2. Si no hay contenido en la solicitud, intentar leer del archivo
        if not content.strip():
            logger.info("No se encontró texto en la solicitud, intentando leer del archivo")
            logger.info(f"Ruta del archivo: {text_file_path}")
            logger.info(f"El archivo existe: {os.path.exists(text_file_path)}")
            
            if not os.path.exists(text_file_path):
                error_msg = f"El archivo de texto no existe en: {text_file_path}"
                logger.error(error_msg)
                return jsonify({
                    "success": False,
                    "error": error_msg,
                    "current_directory": os.getcwd(),
                    "files_in_directory": os.listdir(os.path.dirname(text_file_path) or '.')
                }), 400
                
            file_size = os.path.getsize(text_file_path)
            logger.info(f"Tamaño del archivo: {file_size} bytes")
            
            if file_size == 0:
                error_msg = "El archivo de texto está vacío"
                logger.error(error_msg)
                return jsonify({
                    "success": False,
                    "error": error_msg,
                    "file_path": text_file_path
                }), 400
            
            try:
                with open(text_file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                logger.info(f"Se leyeron {len(content)} caracteres del archivo")
            except Exception as e:
                error_msg = f"Error al leer el archivo: {str(e)}"
                logger.error(error_msg, exc_info=True)
                return jsonify({
                    "success": False,
                    "error": error_msg,
                    "file_path": text_file_path
                }), 500
        
        # 3. Procesar el contenido para extraer fuentes si es del archivo
        content_lines = []
        if content and not image_sources:  # Solo procesar fuentes si no vinieron de la solicitud
            logger.info("Procesando contenido para extraer fuentes")
            current_source = None
            for line in content.split('\n'):
                line = line.strip()
                if line.startswith('[Fuente:') and ']' in line:
                    source_start = line.find('[Fuente:') + 9
                    source_end = line.find(']', source_start)
                    if source_end > source_start:
                        current_source = line[source_start:source_end].strip()
                        if current_source and current_source not in image_sources:
                            image_sources.append(current_source)
                            logger.info(f"Fuente encontrada en el contenido: {current_source}")
                elif line and not line.startswith('---') and not line.startswith('==='):
                    content_lines.append(line)
            
            if content_lines:
                content = '\n'.join(content_lines)
        
        logger.info(f"Tamaño del texto a analizar: {len(content)} caracteres")
        logger.info(f"Número de fuentes encontradas: {len(image_sources)}")
        
        if not content.strip():
            error_msg = "No hay texto válido para analizar después del procesamiento"
            logger.error(error_msg)
            return jsonify({
                "success": False,
                "error": error_msg,
                "sources": {
                    "count": len(image_sources),
                    "urls": image_sources
                },
                "content_sample": content[:500] if content else ""
            }), 400
        
        # Guardar el contenido limpio temporalmente para análisis
        temp_analysis_file = os.path.join(temp_dir, 'temp_analysis.txt')
        try:
            with open(temp_analysis_file, 'w', encoding='utf-8') as f:
                f.write(content)
            logger.info(f"Contenido guardado temporalmente en: {temp_analysis_file}")
            
            # Analizar el texto usando el módulo inputTxt
            logger.info("Iniciando análisis con inputTxt...")
            result = inputTxt.analyze_text_from_file(temp_analysis_file)
            logger.info(f"Resultado del análisis: {result.get('success', False)}")
            
            # Debug: Mostrar las claves del resultado
            logger.info(f"Claves en el resultado: {list(result.keys())}")
            
            # Si el análisis fue exitoso, guardar el resultado
            if result.get("success", False):
                # Debug: Mostrar el tipo y contenido de la respuesta
                logger.info(f"Tipo de result['analysis']: {type(result.get('analysis'))}")
                logger.info(f"Contenido de result['analysis']: {str(result.get('analysis'))[:200]}...")
                
                # Obtener el contenido del análisis
                analysis_content = result.get('analysis', '')
                
                # Crear el objeto de resultado
                analysis_result = {
                    "analysis": analysis_content,
                    "model": result.get("model", "meta-llama/llama-4-scout-17b-16e-instruct"),
                    "usage": result.get("usage", {
                        "prompt_tokens": 0,
                        "completion_tokens": 0,
                        "total_tokens": 0
                    }),
                    "sources": {
                        "count": len(image_sources),
                        "urls": image_sources
                    }
                }
                
                # Asegurarse de que el análisis no esté vacío
                if not analysis_result["analysis"]:
                    logger.error("El análisis está vacío. Contenido completo de result:")
                    logger.error(json.dumps(result, indent=2, ensure_ascii=False))
                    raise Exception("El análisis se completó pero está vacío")
                
                # Guardar el resultado del análisis
                analysis_file = os.path.join(temp_dir, 'analysis_result.json')
                try:
                    with open(analysis_file, 'w', encoding='utf-8') as f:
                        json.dump(analysis_result, f, ensure_ascii=False, indent=2)
                    logger.info(f"Resultado del análisis guardado en: {analysis_file}")
                    
                    # También guardar una versión legible en texto plano
                    txt_file = os.path.join(temp_dir, 'analysis_result.txt')
                    with open(txt_file, 'w', encoding='utf-8') as f:
                        f.write(f"Modelo: {analysis_result['model']}\n")
                        f.write(f"Tokens usados: {analysis_result['usage'].get('total_tokens', 'N/A')}\n")
                        f.write("-" * 50 + "\n")
                        f.write(analysis_result['analysis'])
                        
                        if image_sources:
                            f.write("\n\n--- FUENTES DE IMÁGENES ---\n")
                            for i, source in enumerate(image_sources, 1):
                                f.write(f"{i}. {source}\n")
                    
                except Exception as e:
                    logger.error(f"Error al guardar el resultado del análisis: {str(e)}", exc_info=True)
                    raise Exception(f"Error al guardar el resultado: {str(e)}")
                
                logger.info(f"Análisis completado. Tokens usados: {analysis_result['usage'].get('total_tokens', 'N/A')}")
                
                # Devolver el resultado exitoso
                return jsonify({
                    "success": True,
                    "message": "Análisis completado exitosamente",
                    "analysis": analysis_content,
                    "model": analysis_result["model"],
                    "usage": analysis_result["usage"],
                    "sources": {
                        "count": len(image_sources),
                        "urls": image_sources
                    }
                })
            else:
                error_msg = result.get("error", "Error desconocido en el análisis")
                logger.error(f"Error en el análisis. Resultado completo: {json.dumps(result, indent=2, ensure_ascii=False) if isinstance(result, dict) else str(result)}")
                raise Exception(error_msg)
                
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error durante el análisis: {error_msg}", exc_info=True)
            
            # Verificar si es un error de la API de Groq
            if "API" in error_msg and "error" in result:
                error_msg = f"Error en la API de Groq: {result.get('error', 'Error desconocido')}"
            
            return jsonify({
                "success": False,
                "error": f"Error durante el análisis: {error_msg}",
                "sources": {
                    "count": len(image_sources),
                    "urls": image_sources
                },
                "debug_info": {
                    "content_length": len(content) if 'content' in locals() else 0,
                    "has_analysis": False,
                    "error_type": type(e).__name__
                }
            }), 500
            
    except Exception as e:
        error_msg = f'Error inesperado al analizar los textos: {str(e)}'
        logger.error(error_msg, exc_info=True)
        return jsonify({
            'success': False,
            'error': error_msg,
            'traceback': traceback.format_exc() if app.debug else None
        }), 500

@app.route('/debug/text-file', methods=['GET'])
def debug_text_file():
    """Endpoint de depuración para verificar el contenido del archivo de texto"""
    try:
        if not os.path.exists(text_file_path):
            return jsonify({
                "exists": False,
                "path": text_file_path,
                "current_directory": os.getcwd(),
                "files_in_directory": os.listdir(os.path.dirname(text_file_path) or '.')
            })
            
        with open(text_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        return jsonify({
            "exists": True,
            "path": text_file_path,
            "size_bytes": len(content),
            "content_preview": content[:1000],
            "content_ends_with": content[-200:] if len(content) > 200 else content
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "path": text_file_path,
            "current_directory": os.getcwd()
        }), 500

if __name__ == '__main__':
    # Crear el directorio temporal si no existe
    os.makedirs(temp_dir, exist_ok=True)
    logger.info(f"Directorio temporal: {temp_dir}")
    logger.info(f"Archivo de texto: {text_file_path}")
    
    # Iniciar la aplicación
    app.run(debug=True, port=5000)
