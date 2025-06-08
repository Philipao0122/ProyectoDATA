import React, { useState } from 'react';
import { ArrowLeft, Share2, Bookmark, ThumbsUp, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Topic } from '../types';

interface TopicDetailProps {
  topic: Topic;
  isDarkMode: boolean;
}

const TopicDetail: React.FC<TopicDetailProps> = ({ topic, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('explore');
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="container mx-auto px-4 py-3">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        {/* Topic header */}
        <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 mb-6`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">{topic.icon}</span>
            </div>
            <div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {topic.faculty}
              </span>
              <h1 className="text-2xl font-bold mt-1">{topic.title}</h1>
            </div>
          </div>
          
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
            {topic.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-blue-500 hover:text-blue-600">
                <ThumbsUp size={20} />
                <span>{topic.upvotes}</span>
              </button>
              <button className="flex items-center gap-2 text-blue-500 hover:text-blue-600">
                <MessageSquare size={20} />
                <span>{topic.comments}</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-500 hover:text-gray-600">
                <Share2 size={20} />
                <span>Compartir</span>
              </button>
              <button className="flex items-center gap-2 text-gray-500 hover:text-gray-600">
                <Bookmark size={20} />
                <span>Guardar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content tabs */}
        <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'explore'
                  ? isDarkMode 
                    ? 'border-b-2 border-blue-500 text-blue-400'
                    : 'border-b-2 border-blue-500 text-blue-600'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('explore')}
            >
              EXPLORA CONCEPTOS
            </button>
            <button
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'visualize'
                  ? isDarkMode 
                    ? 'border-b-2 border-blue-500 text-blue-400'
                    : 'border-b-2 border-blue-500 text-blue-600'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('visualize')}
            >
              VISUALIZA DATOS
            </button>
            <button
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'consult'
                  ? isDarkMode 
                    ? 'border-b-2 border-blue-500 text-blue-400'
                    : 'border-b-2 border-blue-500 text-blue-600'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('consult')}
            >
              CONSULTA FUENTES
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'explore' && (
              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className="text-lg font-semibold mb-4">Mapa mental navegable</h3>
                  <div className="aspect-video bg-gray-200 rounded-lg"></div>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className="text-lg font-semibold mb-4">Glosario interactivo</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between">
                      <span>Guerra híbrida</span>
                      <button className="text-blue-500">Ver definición</button>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Ciberguerra</span>
                      <button className="text-blue-500">Ver definición</button>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            {activeTab === 'visualize' && (
              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className="text-lg font-semibold mb-4">Infografía dinámica</h3>
                  <div className="aspect-video bg-gray-200 rounded-lg"></div>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className="text-lg font-semibold mb-4">Línea de tiempo</h3>
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            )}
            {activeTab === 'consult' && (
              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className="text-lg font-semibold mb-4">PDF original del paper</h3>
                  <button className="flex items-center gap-2 text-blue-500 hover:text-blue-600">
                    <Download size={20} />
                    <span>Descargar PDF</span>
                  </button>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className="text-lg font-semibold mb-4">Enlaces verificados</h3>
                  <ul className="space-y-3">
                    <li>
                      <a href="#" className="text-blue-500 hover:underline">
                        Estudio completo - Universidad Nacional
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-blue-500 hover:underline">
                        Datos complementarios - Instituto de Investigación
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicDetail;