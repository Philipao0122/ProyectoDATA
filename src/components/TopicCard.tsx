import React, { useState } from 'react';
import { Eye, Download, MessageSquare, Share2, Bookmark, ChevronDown, ChevronUp } from 'lucide-react';
import { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
  isDarkMode: boolean;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, isDarkMode }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('explore');
  const [isSaved, setIsSaved] = useState(false);

  const handleQuickView = () => {
    // Implementar vista rápida
    console.log('Quick view clicked');
  };

  const handleDownload = () => {
    // Implementar descarga
    console.log('Download clicked');
  };

  const handleComment = () => {
    setExpanded(true);
    setActiveTab('consult');
  };

  return (
    <div 
      className={`mb-4 rounded-lg overflow-hidden ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}
    >
      <div className={`p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{topic.icon}</span>
            </div>
            <h3 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {topic.faculty}
            </h3>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full ${
            isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}>
            {topic.type}
          </span>
        </div>
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {topic.title}
        </h2>
      </div>

      {expanded && (
        <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex">
            <button
              className={`flex-1 px-4 py-3 text-center text-sm font-medium transition-colors ${
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
              className={`flex-1 px-4 py-3 text-center text-sm font-medium transition-colors ${
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
              className={`flex-1 px-4 py-3 text-center text-sm font-medium transition-colors ${
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

          <div className="p-4">
            {activeTab === 'explore' && (
              <ul className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className={`p-3 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}>
                  • Mapa mental navegable
                </li>
                <li className={`p-3 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}>
                  • Glosario interactivo
                </li>
                <li className={`p-3 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}>
                  • Relaciones entre actores
                </li>
              </ul>
            )}
            {activeTab === 'visualize' && (
              <ul className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className={`p-3 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}>
                  • Infografía dinámica
                </li>
                <li className={`p-3 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}>
                  • Línea de tiempo
                </li>
                <li className={`p-3 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}>
                  • Redes de influencia
                </li>
              </ul>
            )}
            {activeTab === 'consult' && (
              <ul className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className={`p-3 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}>
                  • PDF original del paper
                </li>
                <li className={`p-3 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}>
                  • Análisis LLM resumido
                </li>
                <li className={`p-3 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}>
                  • Enlaces verificados
                </li>
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {expanded ? topic.description : `${topic.description.substring(0, 150)}...`}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button 
              onClick={handleQuickView}
              className={`flex items-center gap-1 text-sm ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
              } transition-colors`}
            >
              <Eye size={18} />
              <span>Vista rápida</span>
            </button>
            <button 
              onClick={handleDownload}
              className={`flex items-center gap-1 text-sm ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
              } transition-colors`}
            >
              <Download size={18} />
              <span>Descargar</span>
            </button>
            <button 
              onClick={handleComment}
              className={`flex items-center gap-1 text-sm ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
              } transition-colors`}
            >
              <MessageSquare size={18} />
              <span>Comentar</span>
            </button>
          </div>
          <button 
            onClick={() => setExpanded(!expanded)}
            className={`flex items-center gap-1 text-sm ${
              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
            } transition-colors`}
          >
            {expanded ? (
              <>
                <ChevronUp size={18} />
                <span>Menos</span>
              </>
            ) : (
              <>
                <ChevronDown size={18} />
                <span>Más</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicCard;