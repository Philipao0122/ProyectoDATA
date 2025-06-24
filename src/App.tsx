import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { Sidebar as SidebarT, SectionId } from './components/SidebarT';
import Header from './components/Header';
import Feed from './components/Feed';
import TopicDetail from './pages/TopicDetail';
import ImageExtractor from './pages/imageExtractor';
import { topics } from './data/topics';
import { faculties } from './data/faculties';

function App() {
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('concepts');
  const [showTopicSidebar, setShowTopicSidebar] = useState(false);

  const handleSectionChange = useCallback((section: SectionId) => {
    setActiveSection(section);
  }, []);

  const handleTopicView = useCallback(() => {
    setShowTopicSidebar(true);
  }, []);

  // Function to handle home navigation (can be used later)
  // const handleHomeNavigation = useCallback(() => {
  //   setShowTopicSidebar(false);
  // }, []);

  const filteredTopics = topics.filter(topic => 
    (selectedFaculty === 'all' || topic.faculty === selectedFaculty) &&
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
                  <Feed 
                    topics={filteredTopics} 
                    isDarkMode={isDarkMode}
                    onTopicView={handleTopicView}
                  />
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