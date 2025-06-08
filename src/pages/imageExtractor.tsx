import { useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios to include credentials if needed
axios.defaults.withCredentials = false; // Set to true if your backend requires credentials

interface ImageItem {
  id: string;
  url: string;
  timestamp: number;
  extractedText?: string;
  processing?: boolean;
  error?: string;
}

interface ApiResponse {
  success: boolean;
  image_url?: string;
  error?: string;
  text?: string;
}

interface ExtractTextResponse {
  success: boolean;
  text?: string;
  error?: string;
}

interface ExtractImageResponse {
  success: boolean;
  image_url?: string;
  error?: string;
}

export default function ImageExtractor() {
  const [url, setUrl] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // Load saved images from localStorage on component mount
  useEffect(() => {
    const savedImages = localStorage.getItem('savedInstagramImages');
    if (savedImages) {
      try {
        const parsed = JSON.parse(savedImages);
        const cleanedImages = parsed.map((img: any) => ({
          id: img.id || Date.now().toString(),
          url: img.url,
          timestamp: img.timestamp || Date.now()
        }));
        setImages(cleanedImages);
      } catch (e) {
        console.error('Error parsing saved images:', e);
      }
    }
  }, []);

  const extractTextFromImages = async () => {
    if (isExtracting) return;
    
    console.log('Starting text extraction for all images...');
    setIsExtracting(true);
    setError('');
    
    const updatedImages = [...images];
    let hasChanges = false;

    for (let i = 0; i < updatedImages.length; i++) {
      const img = updatedImages[i];
      console.log(`Processing image ${i + 1}/${updatedImages.length}`);
      
      // Skip if already processed or has an error
      if (img.extractedText !== undefined || img.error) {
        console.log(`Image ${i + 1} already processed, skipping`);
        continue;
      }

      try {
        // Mark as processing
        updatedImages[i] = { ...img, processing: true, error: undefined };
        setImages([...updatedImages]);
        
        console.log(`Extracting text from image ${i + 1}...`);
        const response = await axios.post<ExtractTextResponse>(
          'http://localhost:5000/extract-text', 
          { image_url: img.url }
        );

        if (response.data.success && response.data.text) {
          const previewText = response.data.text.substring(0, 50) + (response.data.text.length > 50 ? '...' : '');
          console.log(`Successfully extracted text from image ${i + 1}:`, previewText);
          
          updatedImages[i] = { 
            ...img, 
            extractedText: response.data.text,
            processing: false 
          };
          hasChanges = true;
        } else {
          throw new Error(response.data.error || 'No se pudo extraer texto de la imagen');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error(`Error processing image ${i + 1}:`, errorMessage);
        updatedImages[i] = { 
          ...img, 
          error: errorMessage,
          processing: false 
        };
        hasChanges = true;
      }

      // Update state after each image to show progress
      if (hasChanges) {
        const newImages = [...updatedImages];
        setImages(newImages);
        localStorage.setItem('savedInstagramImages', JSON.stringify(newImages));
      }
    }

    if (!hasChanges) {
      console.log('No new images to process');
      setError('No hay imágenes nuevas para procesar');
    } else {
      console.log('Finished processing all images');
    }
    
    setIsExtracting(false);
  };

  const handleExtract = async () => {
    if (!url.trim()) {
      setError('Por favor ingresa una URL de Instagram');
      return;
    }
    if (images.length >= 4) {
      setError('Has alcanzado el límite de 4 imágenes');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post<ExtractImageResponse>('http://localhost:5000/extract-image', { url: url.trim() });
      const responseData = response.data;
      
      if (responseData.success && responseData.image_url) {
        const newImage = {
          id: Date.now().toString(),
          url: responseData.image_url,
          timestamp: Date.now()
        };
        const updatedImages = [...images, newImage];
        setImages(updatedImages);
        localStorage.setItem('savedInstagramImages', JSON.stringify(updatedImages));
        setUrl(''); // Clear the input after successful extraction
      } else {
        throw new Error(responseData.error || 'No se pudo obtener la imagen');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al extraer la imagen';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Extractor de Imágenes de Instagram</h1>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Pega la URL de Instagram"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleExtract}
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 whitespace-nowrap"
            >
              {isLoading ? 'Extrayendo...' : 'Extraer Imagen'}
            </button>
          </div>
          <div>
            <button
              onClick={extractTextFromImages}
              disabled={!images.length || isExtracting}
              className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${
                !images.length || isExtracting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isExtracting ? 'Procesando...' : 'Obtener Data'}
            </button>
            <p className="text-sm text-gray-500 mt-1">Extrae texto de todas las imágenes</p>

          </div>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
      <div className="mt-6">
        {images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <img 
                  src={img.url} 
                  alt={`Instagram ${img.id}`} 
                  className="w-full max-h-[80vh] object-contain rounded-lg bg-gray-100"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => {
                      const newImages = images.filter(i => i.id !== img.id);
                      setImages(newImages);
                      localStorage.setItem('savedInstagramImages', JSON.stringify(newImages));
                    }}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    title="Eliminar imagen"
                  >
                    🗑️
                  </button>
                </div>
                
                {/* Image Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2 space-y-1">
                  {/* Timestamp */}
                  <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded inline-block">
                    {new Date(img.timestamp).toLocaleTimeString()}
                  </div>
                  
                  {/* Extracted Text Preview */}
                  {img.extractedText && (
                    <div className="bg-black bg-opacity-70 text-white text-xs p-2 rounded max-h-20 overflow-y-auto">
                      <p className="break-words">
                        {img.extractedText.length > 100 
                          ? `${img.extractedText.substring(0, 100)}...` 
                          : img.extractedText}
                      </p>
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {img.error && (
                    <div className="bg-red-600 bg-opacity-80 text-white text-xs p-2 rounded">
                      Error: {img.error}
                    </div>
                  )}
                  
                  {/* Processing Indicator */}
                  {img.processing && (
                    <div className="bg-blue-600 bg-opacity-80 text-white text-xs p-2 rounded flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center text-gray-500 py-8 border-2 border-dashed rounded-lg">
          No hay imágenes guardadas. Agrega una imagen para comenzar.
        </div>
      </div>
      
      {error && (
        <p className="text-red-500 mt-2 p-2 bg-red-50 rounded">
          {error}
        </p>
      )}
    </div>
  );
}
