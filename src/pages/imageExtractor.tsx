import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { createWorker } from 'tesseract.js';
import { FaTrash, FaSpinner, FaImage, FaSearch, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configure axios to include credentials if needed
axios.defaults.withCredentials = false; // Set to true if your backend requires credentials

interface ImageItem {
  id: string;
  url: string;
  timestamp: number;
  extractedText?: string;
  isProcessing?: boolean;
  error?: string;
}

interface ImageExtractionResponse {
  success: boolean;
  image_url?: string;
  error?: string;
}

interface TextAnalysisResponse {
  success: boolean;
  analysis?: string;
  error?: string;
}

interface TextItem {
  text: string;
  timestamp: string;
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const extractTextFromImage = async (imageUrl: string): Promise<string> => {
    try {
      // Create a worker with default settings
      const worker = await createWorker();
      
      try {
        // Recognize text from the image
        const result = await worker.recognize(imageUrl);
        return result.data.text.trim();
      } finally {
        // Always terminate the worker to free up resources
        await worker.terminate();
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      throw new Error('No se pudo extraer texto de la imagen');
    }
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
        
        // Add the new image with loading state
        const updatedImages = [...images, { ...newImage, isProcessing: true }];
        setImages(updatedImages);
        
        try {
          // Extract text from the image
          const extractedText = await extractTextFromImage(newImage.url);
          
          // Update the image with extracted text
          const finalUpdatedImages = updatedImages.map(img => 
            img.id === newImage.id 
              ? { ...img, extractedText, isProcessing: false, error: undefined }
              : img
          );
          
          setImages(finalUpdatedImages);
          
          // Save to local storage
          if (typeof window !== 'undefined') {
            localStorage.setItem('savedInstagramImages', JSON.stringify(finalUpdatedImages));
          }
        } catch (error) {
          // Update with error state if text extraction fails
          const errorUpdatedImages = updatedImages.map(img => 
            img.id === newImage.id
              ? { ...img, isProcessing: false, error: 'Error al extraer texto' }
              : img
          );
          setImages(errorUpdatedImages);
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('savedInstagramImages', JSON.stringify(errorUpdatedImages));
          }
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

  const handleAnalyzeTexts = async () => {
    if (images.length === 0) {
      toast.warning('No hay imágenes para analizar');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setShowAnalysisModal(true);
    
    try {
      // First, save all extracted texts to the backend
      const texts = images
        .filter(img => img.extractedText && !img.error)
        .map(img => ({
          text: img.extractedText,
          timestamp: new Date(img.timestamp).toISOString()
        }));

      if (texts.length === 0) {
        throw new Error('No hay textos extraídos para analizar');
      }

      // Call the analysis endpoint
      const response = await axios.post<TextAnalysisResponse>(
        'http://localhost:5000/analyze-text', 
        { texts },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data?.analysis) {
        setAnalysisResult(response.data.analysis);
      } else {
        throw new Error('No se pudo obtener el análisis');
      }
    } catch (err: any) {
      console.error('Error analyzing texts:', err);
      const errorMessage = err.response?.data?.error || 
                         err.message || 
                         'Error al analizar los textos';
      setAnalysisResult(`Error: ${errorMessage}`);
      toast.error('Error al analizar los textos');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCloseModal = () => {
    setShowAnalysisModal(false);
  };

  // Load saved images from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedImages = localStorage.getItem('savedInstagramImages');
      if (savedImages) {
        try {
          const parsedImages = JSON.parse(savedImages);
          // Ensure all images have required fields
          const validImages = parsedImages.map((img: any) => ({
            ...img,
            isProcessing: false, // Reset processing state on load
            error: undefined     // Clear any previous errors
          }));
          setImages(validImages);
        } catch (err) {
          console.error('Error parsing saved images:', err);
        }
      }
    }
  }, []);

  // Save images to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && images.length > 0) {
      localStorage.setItem('savedInstagramImages', JSON.stringify(images));
    }
  }, [images]);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Pega URL de Instagram"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleExtract()}
          />
          <button 
            onClick={handleExtract} 
            disabled={isLoading || images.length >= 4}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isLoading || images.length >= 4
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <FaSpinner className="animate-spin" /> Procesando...
              </span>
            ) : (
              'Extraer Imagen'
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {images.length >= 4 && (
          <div className="mt-3 p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
            Has alcanzado el límite de 4 imágenes. Elimina una para agregar más.
          </div>
        )}
      </div>
      
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((img) => (
              <div key={img.id} className="relative group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative pb-[100%] bg-gray-50">
                  {img.isProcessing ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                    </div>
                  ) : img.error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-red-50 text-red-600 text-center">
                      <FaImage className="text-3xl mb-2" />
                      <p className="text-sm font-medium">Error al procesar</p>
                      <p className="text-xs opacity-75">{img.error}</p>
                    </div>
                  ) : (
                    <>
                      <img 
                        src={img.url} 
                        alt={`Imagen extraída`}
                        className="absolute inset-0 w-full h-full object-contain p-2"
                        onError={(e) => {
                          console.error('Error loading image:', img.url);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('¿Eliminar esta imagen?')) {
                              setImages(prev => prev.filter(i => i.id !== img.id));
                            }
                          }}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                          title="Eliminar imagen"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="p-3 border-t border-gray-100">
                  {img.extractedText && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Texto extraído:</p>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {img.extractedText}
                      </p>
                    </div>
                  )}
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      {new Date(img.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                
                {/* Extracted Text Preview */}
                {img.extractedText && (
                  <div className="p-4 bg-gray-50">
                    <p className="text-sm text-gray-600">
                      {img.extractedText}
                    </p>
                  </div>
                )}
                
                {/* Processing Indicator */}
                {img.isProcessing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8 border-2 border-dashed rounded-lg">
            No hay imágenes guardadas. Agrega una imagen para comenzar.
          </div>
        )}
      
      {error && (
        <p className="text-red-500 mt-2 p-2 bg-red-50 rounded">
          {error}
        </p>
      )}

      {/* Analysis Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={handleAnalyzeTexts}
          disabled={isAnalyzing || images.length === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white shadow-lg transition-all ${
            isAnalyzing || images.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-1'
          }`}
        >
          {isAnalyzing ? (
            <>
              <FaSpinner className="animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <FaSearch />
              Contrastar Contenido
            </>
          )}
        </button>
      </div>

      {/* Analysis Result Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Análisis de Contenido</h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {analysisResult ? (
                <div className="prose max-w-none">
                  {analysisResult.startsWith('Error:') ? (
                    <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                      {analysisResult}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {analysisResult.split('\n\n').map((section, index) => {
                        // Handle section headers
                        if (section.startsWith('## ')) {
                          return (
                            <h3 key={index} className="text-lg font-semibold mt-6 mb-2 text-blue-700">
                              {section.substring(3).trim()}
                            </h3>
                          );
                        }
                        // Handle list items
                        if (section.startsWith('* ')) {
                          return (
                            <ul key={index} className="list-disc pl-6 space-y-1">
                              {section.split('\n').filter(Boolean).map((item, i) => (
                                <li key={i} className="text-gray-700">
                                  {item.replace('*', '').trim()}
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        // Regular paragraphs
                        return (
                          <p key={index} className="text-gray-700 leading-relaxed">
                            {section.trim()}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <FaSpinner className="animate-spin text-blue-500 text-3xl mb-4" />
                  <p className="text-gray-600">Analizando contenido...</p>
                  <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos momentos</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
