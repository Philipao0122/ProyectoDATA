import React from 'react';
import TopicCard from './TopicCard';
import { Topic } from '../types';
import { Globe } from 'lucide-react';

interface FeedProps {
  topics: Topic[];
  isDarkMode: boolean;
}

const Feed: React.FC<FeedProps> = ({ topics, isDarkMode }) => {
  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className={`p-4 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} mb-4`}>
          <Globe size={40} className="text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No se encontraron resultados</h3>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Intenta con otra búsqueda o categoría
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topics.map((topic) => (
        <TopicCard key={topic.id} topic={topic} isDarkMode={isDarkMode} />
      ))}
    </div>
  );
};

export default Feed;