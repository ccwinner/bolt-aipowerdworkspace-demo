import React, { useState, useEffect } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { MainContent } from './components/MainContent';
import { ProjectDashboard } from './components/ProjectDashboard';
import { SettingsModal } from './components/SettingsModal';
import { Login } from './components/Login';
import { useDocumentStore } from './store/documentStore';
import { useTaskProgressStore } from './store/taskProgressStore';
import { MessageType } from './types/messageTypes';
import { supabase } from './supabaseClient';

interface SessionState {
  session: any | null;
  loading: boolean;
}

function App() {
  const [activeTab, setActiveTab] = useState('document');
  const [activeChatTab, setActiveChatTab] = useState('ai');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>({
    session: null,
    loading: true
  });
  const { setDocumentContent } = useDocumentStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionState({ session, loading: false });
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSessionState({ session, loading: false });
      });

      // Cleanup subscription
      return () => subscription.unsubscribe();
    });
  }, []);

  useEffect(() => {
    const unsubscribe = useTaskProgressStore.subscribe((state) => {
      const completedTask = state.tasks.find(task => task.status === 'completed');
      if (completedTask) {
        switch (completedTask.type) {
          case MessageType.DOCUMENT:
            setActiveTab('document');
            break;
          case MessageType.ROADMAP:
            setActiveTab('roadmap');
            break;
          case MessageType.EMAIL:
            setActiveTab('email');
            break;
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    sessionState.loading ? (
      <div className="min-h-screen flex items-center justify-center bg-spotify-black">
        <div className="text-spotify-white-text">Loading...</div>
      </div>
    ) : !sessionState.session ? (
      <Login isDarkMode={isDarkMode} />
    ) : (
    <div className={`h-screen ${
      isDarkMode 
        ? 'dark bg-spotify-black text-spotify-white-text' 
        : 'bg-light-background text-light-primary'
    } flex overflow-hidden font-sans antialiased`}>
      <ChatPanel 
        activeChatTab={activeChatTab} 
        setActiveChatTab={setActiveChatTab} 
        isDarkMode={isDarkMode}
        onPRDResponse={(content) => {
          setDocumentContent(content);
          setActiveTab('document');
        }}
      />
      <MainContent 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <ProjectDashboard isDarkMode={isDarkMode} />
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
    )
  );
}

export default App;