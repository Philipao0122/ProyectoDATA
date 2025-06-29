import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  User, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  FileText,
  Link as LinkIcon,
  BarChart2,
  Network,
  List,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
  isDarkMode: boolean;
  onViewClick: (e: React.MouseEvent) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, isDarkMode, onViewClick }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('explore');
  const navigate = useNavigate();

  // Valores por defecto y procesamiento de datos
  const {
    title = 'Título no disponible',
    description = 'Sin descripción disponible',
    faculty = { name: 'Sin facultad', color: '#6b7280' },
    type = 'Análisis',
    tags = [],
    created_at = new Date().toISOString(),
    views = 0,
    upvotes = 0,
    downvotes = 0,
    comments = 0,
    summary = description, // Usar descripción si no hay resumen
    author = { name: 'Autor desconocido', role: 'Usuario', avatar_url: undefined },
    icon,
    status = 'published',
    is_featured = false,
    actions = {
      view_url: '',
      download_url: '',
      comment_enabled: true,
      share_enabled: true
    },
    related_topics = []
  } = topic;

  // Procesamiento de datos
  const facultyInitial = useMemo(() => 
    faculty?.name?.charAt(0).toUpperCase() || 'U', 
    [faculty?.name]
  );

  const formattedDate = useMemo(() => {
    try {
      return new Date(created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Fecha no disponible';
    }
  }, [created_at]);

  const truncatedSummary = useMemo(() => {
    if (!summary) return '';
    return summary.length > 150 ? `${summary.substring(0, 150)}...` : summary;
  }, [summary]);

  const badgeColor = useMemo(() => {
    switch (status) {
      case 'published':
        return isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800';
      case 'draft':
        return isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
      default:
        return isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800';
    }
  }, [status, isDarkMode]);

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewClick(e);
    navigate(`/topic/${topic.id}`);
  };

  return (
    <div 
      className={`group mb-6 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
        isDarkMode 
          ? 'bg-gray-800 border border-gray-700 hover:border-blue-500' 
          : 'bg-white border border-gray-200 hover:border-blue-400'
      } ${is_featured ? 'ring-2 ring-blue-500' : ''}`}
      onClick={handleViewClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Header con facultad y fecha */}
      <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"
              style={{ 
                backgroundColor: faculty.color,
                boxShadow: `0 0 0 2px ${isDarkMode ? '#1f2937' : '#ffffff'}, 0 0 0 3px ${faculty.color}80`
              }}
              title={faculty.name}
            >
              <span className="text-white font-bold">
                {icon || facultyInitial}
              </span>
            </div>
            <div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {faculty.name}
              </h3>
              <div className="flex items-center text-xs text-gray-500">
                <Clock size={12} className="mr-1 flex-shrink-0" />
                <span className="truncate">{formattedDate}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {is_featured && (
              <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}>
                Destacado
              </span>
            )}
            <span className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${badgeColor}`}>
              {status === 'published' ? 'Publicado' : status === 'draft' ? 'Borrador' : 'Archivado'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h2 className={`text-xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h2>
          <span className={`ml-3 text-xs px-2 py-1 rounded-full whitespace-nowrap ${
            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
          }`}>
            {type}
          </span>
        </div>
        
        {truncatedSummary && (
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {truncatedSummary}
          </p>
        )}
        
        {/* Etiquetas */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className={`text-xs px-2 py-1 rounded-full ${
                  isDarkMode ? 'bg-gray-700 text-blue-300' : 'bg-blue-50 text-blue-700'
                }`}
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
              }`}>
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Sección de acciones */}
      <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex">
          {actions.comment_enabled && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // Lógica para comentarios
              }}
              className={`flex-1 py-2 text-center text-sm flex items-center justify-center ${
                isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare size={16} className="mr-2" />
              Comentar
            </button>
          )}
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 my-2" />
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Lógica para compartir
            }}
            className={`flex-1 py-2 text-center text-sm flex items-center justify-center ${
              isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Network size={16} className="mr-2" />
            Compartir
          </button>

          {actions.download_url && (
            <>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 my-2" />
              <a 
                href={actions.download_url}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 py-2 text-center text-sm flex items-center justify-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                download
              >
                <FileText size={16} className="mr-2" />
                Descargar
              </a>
            </>
          )}
        </div>
      </div>

      {/* Sección de temas relacionados */}
      {related_topics && related_topics.length > 0 && (
        <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-all duration-300 overflow-hidden ${
          expanded ? 'max-h-96' : 'max-h-0'
        }`}>
          <div className="p-4">
            <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Temas Relacionados
            </h4>
            <div className="flex flex-wrap gap-2">
              {related_topics.map((relatedTopicId, index) => (
                <span 
                  key={index}
                  className={`text-xs px-2 py-1 rounded-full ${
                    isDarkMode ? 'bg-gray-700 text-blue-300' : 'bg-blue-50 text-blue-800'
                  }`}
                >
                  {relatedTopicId}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Footer con estadísticas y acciones */}
      <div className={`p-4 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1" title={`${upvotes} Me gusta`}>
              <ThumbsUp size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {upvotes}
              </span>
            </div>
            <div className="flex items-center space-x-1" title={`${downvotes} No me gusta`}>
              <ThumbsDown size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {downvotes}
              </span>
            </div>
            <div className="flex items-center space-x-1" title={`${comments} Comentarios`}>
              <MessageSquare size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {comments}
              </span>
            </div>
            <div className="flex items-center space-x-1" title={`${views} visualizaciones`}>
              <Eye size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {views}
              </span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex -space-x-2">
              <div 
                className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden"
                title={author.name}
              >
                {author?.avatar_url ? (
                  <img 
                    src={author.avatar_url} 
                    alt={author.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={12} className="text-gray-600 dark:text-gray-300" />
                )}
              </div>
            </div>
            <span className={`ml-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {author.name?.split(' ')[0] || 'Anónimo'}
            </span>
          </div>
        </div>
        
        {/* Botón para expandir/colapsar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className={`w-full mt-3 py-1 flex items-center justify-center text-xs font-medium rounded-md transition-colors ${
            isDarkMode 
              ? 'text-blue-400 hover:bg-gray-700' 
              : 'text-blue-600 hover:bg-gray-100'
          }`}
        >
          {expanded ? (
            <>
              <span>Menos detalles</span>
              <ChevronUp size={16} className="ml-1" />
            </>
          ) : (
            <>
              <span>Más detalles</span>
              <ChevronDown size={16} className="ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TopicCard;