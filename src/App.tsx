import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarT, 
  Header, 
  Feed, 
  LoadingSpinner,
  SectionId 
} from './components';
import TopicDetail from './pages/TopicDetail';
import ImageExtractor from './pages/imageExtractor';
import { faculties } from './data/faculties';
import { topicService } from './services/api';
import type { Topic } from './types';

function App() {
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('concepts');
  const [showTopicSidebar, setShowTopicSidebar] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSectionChange = useCallback((section: SectionId) => {
    setActiveSection(section);
  }, []);

  // Cargar temas al montar el componente
  useEffect(() => {
    console.group('App - useEffect');
    console.log('Iniciando carga de temas...');
    
    const loadTopics = async () => {
      try {
        setIsLoading(true);
        console.log('Llamando a topicService.getAllTopics()');
        const data = await topicService.getAllTopics();
        
        console.log('Datos recibidos:', data);
        const topicsData = Array.isArray(data) ? data : [];
        console.log('Temas a mostrar:', topicsData.length);
        
        setTopics(topicsData);
        setError(null);
        console.log('Estado actualizado correctamente');
      } catch (err) {
        console.error('Error en la carga de temas:', err);
        setError('Error al cargar los temas. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        console.log('Finalizando carga de temas');
        setIsLoading(false);
        console.groupEnd();
      }
    };

    loadTopics();
    
    // Limpieza
    return () => {
      console.log('Limpieza del efecto de carga de temas');
    };
  }, []);

  const handleTopicView = useCallback(() => {
    setShowTopicSidebar(true);
  }, []);

  // Function to handle home navigation (can be used later)
  // const handleHomeNavigation = useCallback(() => {
  //   setShowTopicSidebar(false);
  // }, []);

  const filteredTopics = topics.filter(topic => 
    (selectedFaculty === 'all' || topic.faculty.name === selectedFaculty) &&
    (searchQuery === '' || 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Router>
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Routes>
          <Route path="/" element={
            <>
              <Header 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
              />
              <div className="flex flex-1 overflow-hidden">
                {showTopicSidebar ? (
                  <SidebarT 
                    activeSection={activeSection}
                    onSectionChange={handleSectionChange}
                  />
                ) : (
                  <Sidebar 
                    faculties={faculties}
                    selectedFaculty={selectedFaculty}
                    setSelectedFaculty={setSelectedFaculty}
                    isDarkMode={isDarkMode}
                  />
                )}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <LoadingSpinner />
                    </div>
                  ) : error ? (
                    <div className="text-center py-10 text-red-500">
                      <p>{error}</p>
                      <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Reintentar
                      </button>
                    </div>
                  ) : (
                    <Feed 
                      topics={filteredTopics} 
                      isDarkMode={isDarkMode}
                      onTopicView={handleTopicView}
                    />
                  )}
                </main>
              </div>
            </>
          } />
          <Route 
            path="/topic/:id" 
            element={
              <>
                <Header 
                  searchQuery={searchQuery} 
                  setSearchQuery={setSearchQuery} 
                  isDarkMode={isDarkMode}
                  setIsDarkMode={setIsDarkMode}
                />
                <div className="flex flex-1 overflow-hidden">
                  <SidebarT
                    activeSection={activeSection}
                    onSectionChange={handleSectionChange}
                  />
                  <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <TopicDetail 
                      topic={topics[0]} // TODO: Fetch topic by ID from URL params
                      isDarkMode={isDarkMode} 
                      activeSection={activeSection}
                      onSectionChange={handleSectionChange}
                    />
                  </main>
                </div>
              </>
            } 
          />
          <Route 
            path="/image-extractor" 
            element={
              <>
                <Header 
                  searchQuery={searchQuery} 
                  setSearchQuery={setSearchQuery} 
                  isDarkMode={isDarkMode}
                  setIsDarkMode={setIsDarkMode}
                />
                <div className="flex flex-1 overflow-hidden">
                  <Sidebar 
                    faculties={faculties} 
                    selectedFaculty={selectedFaculty}
                    setSelectedFaculty={setSelectedFaculty}
                    isDarkMode={isDarkMode}
                  />
                  <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <ImageExtractor />
                  </main>
                </div>
              </>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;