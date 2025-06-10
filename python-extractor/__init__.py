"""
Paquete para la extracción de texto de imágenes.
"""

# Hacer que la aplicación Flask esté disponible al importar el paquete
from .app import app, save_extracted_text

__all__ = ['app', 'save_extracted_text']
