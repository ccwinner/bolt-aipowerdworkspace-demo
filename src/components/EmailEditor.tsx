import React, { useState } from 'react';
import { useEmailStore } from '../store/emailStore';

interface EmailEditorProps {
  isDarkMode: boolean;
}

export function EmailEditor({ isDarkMode }: EmailEditorProps) {
  const emailTemplate = useEmailStore((state) => state.emailTemplate);
  const [destination, setDestination] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState(emailTemplate || '');

  return (
    <div className="h-full flex flex-col p-6">
      <div className={`max-w-4xl mx-auto w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
        <h2 className="text-2xl font-bold mb-6">Email Editor</h2>
        
        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Destination
            </label>
            <input
              type="email"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="recipient@example.com"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter subject"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              rows={12}
              style={{ resize: 'vertical', minHeight: '200px', maxHeight: '600px' }}
              placeholder="Enter email content"
            />
          </div>

          <div className="flex justify-end">
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}