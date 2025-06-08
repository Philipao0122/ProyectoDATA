import { useState } from 'react';
import axios from 'axios';

// Configure axios to include credentials if needed
axios.defaults.withCredentials = false; // Set to true if your backend requires credentials

interface ImageItem {
  id: string;
  url: string;
  timestamp: number;
}

interface ImageExtractionResponse {
  success: boolean;
  image_url?: string;
  error?: string;
}

export default function ImageExtractor() {
  const [url, setUrl] = useState('');
  const [images, setImages] = useState<ImageItem[]>(() => {
    // Load saved images from local storage on component mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('savedInstagramImages');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    // Clear any previous errors
    
    try {
      const response = await axios.post<ImageExtractionResponse>(
        'http://localhost:5000/extract-image', 
        { url: url.trim() },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      
      if (response.data.success && response.data.image_url) {
        const newImage = {
          id: Date.now().toString(),
          url: response.data.image_url,
          timestamp: Date.now()
        };
        
        const updatedImages = [...images, newImage];
        setImages(updatedImages);
        
        // Save to local storage
        if (typeof window !== 'undefined') {
          localStorage.setItem('savedInstagramImages', JSON.stringify(updatedImages));
        }
      } else {
        throw new Error(response.data.error || 'No se pudo obtener la imagen');
      }
    } catch (err: any) {
      console.error('Error fetching image:', err);
      const errorMessage = err.response?.data?.error || 
                         err.message || 
                         'Error al extraer la imagen. Asegúrate de que la URL sea correcta.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <input
        type="text"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="Pega URL de Instagram"
        className="border p-2 w-full"
      />
      <button 
        onClick={handleExtract} 
        disabled={isLoading}
        className={`bg-blue-500 text-white px-4 py-2 mt-2 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
      >
        {isLoading ? 'Procesando...' : 'Extraer Imagen'}
      </button>
      
      {isLoading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Extrayendo imagen...</p>
        </div>
      )}
      
      <div className="mt-6">
        {images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <div className="w-full border-2 border-gray-200 rounded-lg overflow-hidden shadow-lg bg-gray-100" style={{ aspectRatio: '1/1' }}>
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <img 
                      src={img.url} 
                      alt={`Instagram ${new Date(img.timestamp).toLocaleString()}`} 
                      className="max-w-full max-h-full object-contain"
                      style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
                      onError={(e) => {
                        console.error('Error loading image:', img.url);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.log(`Image loaded - Natural size: ${target.naturalWidth}x${target.naturalHeight}`);
                      }}
                    />
                  </div>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button 
                    onClick={() => {
                      if (confirm('¿Eliminar esta imagen?')) {
                        const updatedImages = images.filter(i => i.id !== img.id);
                        setImages(updatedImages);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('savedInstagramImages', JSON.stringify(updatedImages));
                        }
                      }
                    }}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    title="Eliminar imagen"
                  >
                    🗑️
                  </button>
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {new Date(img.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
        {images.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 py-8 border-2 border-dashed rounded-lg">
            No hay imágenes guardadas. Agrega una imagen para comenzar.
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 mt-2 p-2 bg-red-50 rounded">
          {error}
        </p>
      )}
    </div>
  );
}
