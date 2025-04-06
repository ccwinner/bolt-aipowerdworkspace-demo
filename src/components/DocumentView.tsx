import React from 'react';
import { useDocumentStore } from '../store/documentStore';
import { useRoadmapStore } from '../store/roadmapStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MDEditor from '@uiw/react-md-editor';
import { Eye, Edit2 } from 'lucide-react';

interface DocumentViewProps {
  activeTab: string;
  isDarkMode: boolean;
}

export function DocumentView({ activeTab, isDarkMode }: DocumentViewProps) {
  const { documentContent, setDocumentContent, isEditMode: isDocEditMode, setEditMode: setDocEditMode } = useDocumentStore();
  const { roadmapContent, setRoadmapContent, isEditMode: isRoadmapEditMode, setEditMode: setRoadmapEditMode } = useRoadmapStore();

  // Enhanced content handling
  const content = activeTab === 'document' 
    ? documentContent || '' 
    : activeTab === 'roadmap' 
      ? roadmapContent || '' 
      : '';

  // Determine content type for styling
  const isRoadmap = activeTab === 'roadmap';

  const isEditMode = activeTab === 'document' ? isDocEditMode : activeTab === 'roadmap' ? isRoadmapEditMode : false;
  const setEditMode = activeTab === 'document' ? setDocEditMode : activeTab === 'roadmap' ? setRoadmapEditMode : () => {};
  const setContent = (newContent: string) => {
    if (activeTab === 'document') {
      setDocumentContent(newContent);
    } else if (activeTab === 'roadmap') {
      setRoadmapContent(newContent);
    }
  };

  if (content.trim() === '') {
    return (
      <div className={`h-full flex items-center justify-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {activeTab === 'document' && 'Create a new PRD document to get started'}
        {activeTab === 'roadmap' && 'Generate a project timeline to get started'}
        {activeTab !== 'document' && activeTab !== 'roadmap' && 'Select a document or create a new one to get started'}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setEditMode(!isEditMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-spotify-light-black hover:bg-spotify-lightest-black text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {isEditMode ? (
              <>
                <Eye size={18} />
                <span>Preview</span>
              </>
            ) : (
              <>
                <Edit2 size={18} />
                <span>Edit</span>
              </>
            )}
          </button>
        </div>

        <div className={`${isDarkMode ? 'bg-[#202124]' : 'bg-white'} rounded-lg shadow-lg`}>
          {isEditMode ? (
            <div data-color-mode={isDarkMode ? 'dark' : 'light'}>
              <MDEditor
                value={content}
                onChange={(value) => setContent(value ?? '')}
                preview="edit"
                height={600}
                className="w-full"
                hideToolbar={false}
                textareaProps={{
                  placeholder: 'Start writing your document...',
                }}
              />
            </div>
          ) : (
            <div className={`p-8 prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto ${
              isDarkMode ? 'text-white prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white' : ''
            } ${isRoadmap ? 'roadmap-content' : ''}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}