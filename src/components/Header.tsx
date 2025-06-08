import React, { useState } from 'react';
import { Search, User, Menu, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  searchQuery, 
  setSearchQuery,
  isDarkMode,
  setIsDarkMode
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-sm`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-4"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">PI</span>
            </div>
            <h1 className="text-lg font-semibold hidden sm:block">Plataforma Interactiva</h1>
          </div>
        </div>
        
        <div className={`relative mx-4 flex-1 max-w-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <input
            type="text"
            placeholder="Buscar temas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`block w-full pl-10 pr-3 py-2 border-none focus:outline-none focus:ring-0 ${
              isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block">Usuario</span>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <User size={16} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="p-2">
            <div className={`p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} font-semibold`}>
              FACULTADES
            </div>
            <button
              className={`w-full text-left px-4 py-3 ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
            >
              Ingeniería
            </button>
            <button
              className={`w-full text-left px-4 py-3 ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
            >
              Medicina
            </button>
            <button
              className={`w-full text-left px-4 py-3 ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
            >
              Ciencias
            </button>
            <button
              className={`w-full text-left px-4 py-3 ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
            >
              Derecho
            </button>
            <button
              className={`w-full text-left px-4 py-3 ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
            >
              Humanidades
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;