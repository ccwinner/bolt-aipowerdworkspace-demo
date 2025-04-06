import React, { Suspense, lazy } from 'react';
import { MoreVertical, File, FileImage, FileText, FolderPlus, LogOut } from 'lucide-react';
import { useTaskProgressStore } from '../store/taskProgressStore';
import { MessageType } from '../types/messageTypes';
import { supabase } from '../supabaseClient';

// Lazy load the AITasks component
const AITasks = lazy(() => import('./AITasks'));

interface ProjectDashboardProps {
  isDarkMode: boolean;
}

export function ProjectDashboard({ isDarkMode }: ProjectDashboardProps) {
  const hasActiveTasks = useTaskProgressStore(
    (state) => state.tasks.some(task => 
      task.type === MessageType.ROADMAP || 
      task.type === MessageType.DOCUMENT ||
      task.type === MessageType.EMAIL
    )
  );

  return (
    <div className={`w-72 border-l ${isDarkMode ? 'border-spotify-light-black' : 'border-gray-200'} p-4 bg-spotify-black`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-spotify-white-text">Project Dashboard</h2>
          <button
            onClick={async () => {
              try {
                const { error } = await supabase.auth.signOut();
                if (error) {
                  console.error('Error signing out:', error);
                }
              } catch (error) {
                console.error('Error during sign out:', error);
              }
            }}
            className={`p-2 ${isDarkMode ? 'hover:bg-spotify-light-black text-spotify-light-text' : 'hover:bg-gray-100'} rounded-full transition-colors duration-200`}
            title="Log out"
          >
            <LogOut size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-spotify-light-text' : 'text-gray-600'} mb-3`}>Team Members</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces" className="w-8 h-8 rounded-full" alt="Team member 1" />
                <div>
                  <div className="text-sm text-spotify-white-text">Sarah Connor</div>
                  <div className={`text-xs ${isDarkMode ? 'text-spotify-light-text' : 'text-gray-600'}`}>Admin</div>
                </div>
              </div>
              <MoreVertical size={16} className={isDarkMode ? 'text-spotify-light-text' : 'text-gray-600'} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=faces" className="w-8 h-8 rounded-full" alt="Team member 2" />
                <div>
                  <div className="text-sm text-spotify-white-text">John Doe</div>
                  <div className={`text-xs ${isDarkMode ? 'text-spotify-light-text' : 'text-gray-600'}`}>Editor</div>
                </div>
              </div>
              <MoreVertical size={16} className={isDarkMode ? 'text-spotify-light-text' : 'text-gray-600'} />
            </div>
          </div>
        </div>

        {hasActiveTasks && (
          <Suspense fallback={
            <div className={`mb-6 p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg`}>
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4`}></div>
                  <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
                  <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-5/6`}></div>
                </div>
              </div>
            </div>
          }>
            <AITasks isDarkMode={isDarkMode} />
          </Suspense>
        )}

        <div>
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-spotify-light-text' : 'text-gray-600'} mb-3`}>Shared Assets</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="spotify-card flex flex-col items-center justify-center">
              <File size={24} className="mb-2" />
              <div className="text-xs text-spotify-white-text">Project Brief</div>
            </div>
            <div className="spotify-card flex flex-col items-center justify-center">
              <FileImage size={24} className="mb-2" />
              <div className="text-xs text-spotify-white-text">Assets</div>
            </div>
            <div className="spotify-card flex flex-col items-center justify-center">
              <FileText size={24} className="mb-2" />
              <div className="text-xs text-spotify-white-text">Documents</div>
            </div>
            <div className="spotify-card flex flex-col items-center justify-center">
              <FolderPlus size={24} className="mb-2" />
              <div className="text-xs text-spotify-white-text">Add New</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}