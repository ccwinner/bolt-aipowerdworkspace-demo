import React, { useEffect } from 'react';
import { FileText, Table, Mail, Grid, Settings, MoreHorizontal, Sun, Moon } from 'lucide-react';
import { DocumentView } from './DocumentView';
import { EmailEditor } from './EmailEditor';
import { TaskBoard } from './TaskBoard';

interface MainContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onOpenSettings: () => void;
}

export function MainContent({ 
  activeTab, 
  setActiveTab, 
  isDarkMode, 
  toggleTheme, 
  onOpenSettings 
}: MainContentProps) {
  useEffect(() => {
    const handleTabSwitch = (e: CustomEvent) => {
      setActiveTab(e.detail);
    };
    
    window.addEventListener('switchTab', handleTabSwitch as EventListener);
    return () => window.removeEventListener('switchTab', handleTabSwitch as EventListener);
  }, [setActiveTab]);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-spotify-black">
      <div className={`flex items-center border-b ${isDarkMode ? 'border-spotify-light-black' : 'border-gray-200'} p-3`}>
        <div className="flex space-x-1">
          <button 
            className={`px-4 py-2 rounded-lg text-sm flex items-center space-x-2 ${
              activeTab === 'document' 
                ? isDarkMode ? 'bg-spotify-green text-white' : 'bg-gray-200' 
                : isDarkMode ? 'hover:bg-spotify-light-black text-spotify-light-text' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('document')}
          >
            <FileText size={16} />
            <span>Document</span>
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm flex items-center space-x-2 ${
              activeTab === 'roadmap' 
                ? isDarkMode ? 'bg-spotify-green text-white' : 'bg-gray-200' 
                : isDarkMode ? 'hover:bg-spotify-light-black text-spotify-light-text' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('roadmap')}
          >
            <Table size={16} />
            <span>Roadmap</span>
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm flex items-center space-x-2 ${
              activeTab === 'email' 
                ? isDarkMode ? 'bg-spotify-green text-white' : 'bg-gray-200' 
                : isDarkMode ? 'hover:bg-spotify-light-black text-spotify-light-text' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('email')}
          >
            <Mail size={16} />
            <span>Email</span>
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm flex items-center space-x-2 ${
              activeTab === 'tasks' 
                ? isDarkMode ? 'bg-spotify-green text-white' : 'bg-gray-200' 
                : isDarkMode ? 'hover:bg-spotify-light-black text-spotify-light-text' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('tasks')}
          >
            <Grid size={16} />
            <span>Tasks</span>
          </button>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <button
            className={`p-2 ${isDarkMode ? 'hover:bg-spotify-light-black text-spotify-light-text' : 'hover:bg-gray-100'} rounded-full`}
            onClick={toggleTheme}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className={`p-2 ${isDarkMode ? 'hover:bg-spotify-light-black text-spotify-light-text' : 'hover:bg-gray-100'} rounded-full`}
            onClick={onOpenSettings}
          >
            <Settings size={20} />
          </button>
          <div className="flex -space-x-2">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces" 
              className={`w-8 h-8 rounded-full border-2 ${isDarkMode ? 'border-spotify-dark-base' : 'border-gray-200'}`} 
              alt="Team member 1"
            />
            <img 
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=faces" 
              className={`w-8 h-8 rounded-full border-2 ${isDarkMode ? 'border-spotify-dark-base' : 'border-gray-200'}`} 
              alt="Team member 2"
            />
            <button className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} flex items-center justify-center`}>
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'email' ? (
          <EmailEditor isDarkMode={isDarkMode} />
        ) : activeTab === 'tasks' ? (
          <TaskBoard isDarkMode={isDarkMode} />
        ) : (
          <DocumentView activeTab={activeTab} isDarkMode={isDarkMode} />
        )}
      </div>
    </div>
  );
}