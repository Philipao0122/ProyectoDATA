import React from 'react';
import { BookOpen, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Faculty } from '../types';

interface SidebarProps {
  faculties: Faculty[];
  selectedFaculty: string;
  setSelectedFaculty: (faculty: string) => void;
  isDarkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  faculties, 
  selectedFaculty, 
  setSelectedFaculty,
  isDarkMode
}) => {
  return (
    <aside className={`w-64 border-r ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} hidden md:block`}>
      <div className={`p-4 border-b flex items-center gap-2 font-semibold ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <BookOpen size={20} className="text-blue-500" />
        <h2 className="text-lg uppercase tracking-wide">FACULTADES</h2>
      </div>
      <nav className="p-2">
        <button
          className={`w-full text-left px-4 py-3 rounded-md transition-colors duration-200 mb-1 ${
            selectedFaculty === 'all'
              ? 'bg-blue-500 text-white'
              : isDarkMode 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-100'
          }`}
          onClick={() => setSelectedFaculty('all')}
        >
          Todos
        </button>
        {faculties.map((faculty) => (
          <button
            key={faculty.id}
            className={`w-full text-left px-4 py-3 rounded-md transition-colors duration-200 mb-1 ${
              selectedFaculty === faculty.id
                ? 'bg-blue-500 text-white'
                : isDarkMode 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedFaculty(faculty.id)}
          >
            {faculty.name}
          </button>
        ))}
      </nav>
      <div className="mt-auto p-2 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/image-extractor"
          className={`flex items-center gap-2 w-full text-left px-4 py-3 rounded-md transition-colors duration-200 ${
            window.location.pathname === '/image-extractor'
              ? 'bg-blue-500 text-white'
              : isDarkMode 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-100'
          }`}
        >
          <ImageIcon size={18} />
          <span>Image Extractor</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;