#!/usr/bin/env python3
"""
Script principal que orquesta el flujo completo de extracción y análisis de texto.

Uso:
    python main.py [--extract] [--analyze] [--all]

Opciones:
    --extract   Ejecuta solo la extracción de texto
    --analyze   Ejecuta solo el análisis del texto extraído
    --all       Ejecuta extracción y análisis (por defecto)
"""
import os
import sys
import time
import argparse
import subprocess
from pathlib import Path

# Configuración de rutas
PROJECT_ROOT = Path(__file__).parent
EXTRACTED_TEXTS = PROJECT_ROOT / "gemini" / "extracted_texts.txt"
ANALYSIS_RESULT = PROJECT_ROOT / "gemini" / "analysis_result.txt"
PYTHON_EXTRACTOR_APP = PROJECT_ROOT / "python-extractor" / "app.py"

# Configurar el logger
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

# Configurar el logger
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

def ensure_directories():
    """Asegura que existan los directorios necesarios."""
    os.makedirs(PROJECT_ROOT / "python-extractor" / "temp", exist_ok=True)
    os.makedirs(PROJECT_ROOT / "gemini", exist_ok=True)

def run_extraction():
    """Ejecuta la extracción de texto."""
    logger.info("Iniciando proceso de extracción de texto...")
    
    # Asegurarse de que el directorio de gemini existe
    os.makedirs(PROJECT_ROOT / "gemini", exist_ok=True)
    
    # Iniciar el servidor Flask
    flask_process = subprocess.Popen(
        [sys.executable, str(PYTHON_EXTRACTOR_APP)],
        env={
            **os.environ,
            'FLASK_APP': str(PYTHON_EXTRACTOR_APP),
            'FLASK_ENV': 'development'
        }
    )
    
    logger.info("Servidor Flask iniciado en http://localhost:5000")
    logger.info("Presiona Ctrl+C para detener el servidor")
    
    try:
        flask_process.wait()
    except KeyboardInterrupt:
        logger.info("Deteniendo el servidor...")
        flask_process.terminate()
        flask_process.wait()
        logger.info("Servidor detenido")

def run_analysis():
    """Ejecuta el análisis del texto extraído."""
    logger.info("Iniciando análisis del texto extraído...")
    
    if not EXTRACTED_TEXTS.exists():
        logger.error(f"No se encontró el archivo de textos extraídos: {EXTRACTED_TEXTS}")
        return False
    
    try:
        # Importar dinámicamente el módulo de análisis
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "inputTxt", 
            str(PROJECT_ROOT / "gemini" / "inputTxt.py")
        )
        input_txt = importlib.util.module_from_spec(spec)
        sys.modules["inputTxt"] = input_txt
        spec.loader.exec_module(input_txt)
        
        # Ejecutar el análisis
        result = input_txt.analyze_text_from_file(str(EXTRACTED_TEXTS))
        
        if result.get('success'):
            with open(ANALYSIS_RESULT, 'w', encoding='utf-8') as f:
                f.write(result.get('analysis', 'No se pudo generar el análisis'))
            logger.info(f"Análisis completado y guardado en: {ANALYSIS_RESULT}")
            return True
        else:
            error_msg = result.get('error', 'Error desconocido')
            logger.error(f"Error en el análisis: {error_msg}")
            return False
            
    except Exception as e:
        logger.error(f"Error al ejecutar el análisis: {str(e)}", exc_info=True)
        return False

def main():
    """Función principal."""
    parser = argparse.ArgumentParser(description='Sistema de extracción y análisis de texto')
    parser.add_argument('--extract', action='store_true', help='Ejecutar solo la extracción de texto')
    parser.add_argument('--analyze', action='store_true', help='Ejecutar solo el análisis del texto extraído')
    parser.add_argument('--all', action='store_true', help='Ejecutar extracción y análisis (por defecto)')
    
    args = parser.parse_args()
    
    # Si no se especifica ninguna opción, se ejecuta todo por defecto
    if not any([args.extract, args.analyze, args.all]) and len(sys.argv) == 1:
        args.all = True
    
    ensure_directories()
    
    try:
        if args.extract or args.all:
            run_extraction()
        
        if args.analyze or (args.all and not args.extract):
            run_analysis()
            
    except KeyboardInterrupt:
        logger.info("Proceso interrumpido por el usuario.")
    except Exception as e:
        logger.error(f"Error en la ejecución: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
