import React, { useState } from 'react';
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
  isDarkMode: boolean;
  onViewClick: (e: React.MouseEvent) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, isDarkMode, onViewClick }) => {
  const [expanded] = useState(false);
  const [activeTab] = useState('explore');
  const navigate = useNavigate();

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewClick(e);
    navigate(`/topic/${topic.id}`);
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
          <div className={`flex-1 px-4 py-3 text-center text-sm font-medium ${
              activeTab === 'explore' 
                ? isDarkMode ? 'text-blue-400' : 'text-blue-600' 
                : isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              EXPLORA CONCEPTOS
          </div>
          <div className={`flex-1 px-4 py-3 text-center text-sm font-medium ${
              activeTab === 'visualize' 
                ? isDarkMode ? 'text-blue-400' : 'text-blue-600' 
                : isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              VISUALIZA DATOS
          </div>
          <div className={`flex-1 px-4 py-3 text-center text-sm font-medium ${
              activeTab === 'consult' 
                ? isDarkMode ? 'text-blue-400' : 'text-blue-600' 
                : isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              CONSULTA FUENTES
          </div>
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
              onClick={handleViewClick}
              className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 transition-colors"
            >
              <Eye size={18} />
              <span>Ver</span>
            </button>
          </div>
          <div className="flex items-center gap-1 text-sm text-blue-400">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicCard;