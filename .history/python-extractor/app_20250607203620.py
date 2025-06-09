from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from PIL import Image
import requests
from io import BytesIO
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import os
import logging
from werkzeug.serving import WSGIRequestHandler
import tempfile

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create temp directory if it doesn't exist
temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp')
os.makedirs(temp_dir, exist_ok=True)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

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
    except:
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
            # Create a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg', dir=temp_dir) as temp_file:
                img.save(temp_file, 'JPEG')
                temp_filename = os.path.basename(temp_file.name)
            
            # Create a URL to access the image
            image_url = f'http://{request.host}/download/{temp_filename}'
            
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
