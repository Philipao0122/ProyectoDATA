# Extractor y Analizador de Imágenes

Aplicación web para extraer, organizar y analizar texto de imágenes con capacidades avanzadas de agrupación de información.

## Características Principales

- **Extracción de Texto**: Utiliza Tesseract.js para extraer texto de imágenes cargadas o desde URLs.
- **Agrupación Inteligente**: Organiza automáticamente la información extraída en categorías lógicas.
- **Análisis de Contenido**: Procesa el texto extraído para identificar temas clave y patrones.
- **Almacenamiento Local**: Guarda el historial de extracciones para referencia futura.
- **Interfaz Intuitiva**: Fácil de usar con una interfaz de usuario limpia y responsiva.

## Tecnologías Utilizadas

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Python (Flask)
- **OCR**: Tesseract.js
- **Navegación Web**: Selenium
- **Procesamiento de Imágenes**: Pillow
- **API**: RESTful

## Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd project
   ```

2. **Configurar el entorno de Python**
   ```bash
   cd python-extractor
   pip install -r requirements.txt
   ```

3. **Instalar dependencias de Node.js**
   ```bash
   cd ..
   npm install
   ```

4. **Configurar variables de entorno**
   Copiar el archivo `.env.example` a `.env` y configurar las variables necesarias.

## Ejecución

1. **Iniciar el servidor backend**
   ```bash
   cd python-extractor
   python app.py
   ```

2. **Iniciar la aplicación frontend**
   ```bash
   cd ..
   npm run dev
   ```

3. **Abrir en el navegador**
   La aplicación estará disponible en `http://localhost:3000`

## Funcionalidades de Agrupación

### Extracción Estructurada
- Extrae texto de imágenes manteniendo la estructura jerárquica original
- Identifica y agrupa automáticamente información relacionada

### Análisis de Contenido
- Procesa el texto extraído para identificar temas principales
- Agrupa contenido por categorías temáticas
- Extrae entidades nombradas (nombres, lugares, fechas, etc.)

### Gestión de Datos
- Almacena las extracciones de forma organizada
- Permite búsqueda y filtrado de contenido extraído
- Exporta la información agrupada en diferentes formatos

## Estructura del Proyecto

```
project/
├── python-extractor/    # Backend en Flask
│   ├── app.py           # Punto de entrada del servidor
│   └── requirements.txt # Dependencias de Python
├── src/                 # Frontend en React
│   ├── pages/           # Componentes de página
│   └── ...
└── public/             # Archivos estáticos
```

## Uso

1. Ingresa una URL de imagen o sube un archivo local
2. La aplicación extraerá el texto automáticamente
3. Revisa la información agrupada en la interfaz
4. Utiliza las herramientas de análisis para obtener más información
5. Guarda o exporta los resultados según sea necesario

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contribución

Las contribuciones son bienvenidas. Por favor, lee nuestras pautas de contribución antes de enviar tus cambios.
