import React from 'react';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export function SettingsModal({ isOpen, onClose, isDarkMode }: SettingsModalProps) {
  if (!isOpen) return null;

  const settings = [
    {
      title: 'Editor Settings',
      options: ['Font Size', 'Line Height', 'Tab Size', 'Word Wrap']
    },
    {
      title: 'Meeting Settings',
      options: ['Auto Recording', 'Background Blur', 'Meeting Chat']
    },
    {
      title: 'Chat Settings',
      options: ['Message Sound', 'Desktop Notifications', 'Chat History']
    },
    {
      title: 'Style Settings',
      options: ['Theme', 'Font Family', 'Color Scheme', 'Layout']
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-spotify-dark-base' : 'bg-white'} rounded-xl w-[600px] max-h-[80vh] overflow-y-auto`}>
        <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-spotify-light-black' : 'border-gray-200'}`}>
          <h2 className="text-xl font-bold text-spotify-white-text">Settings</h2>
          <button onClick={onClose} className={`p-2 ${isDarkMode ? 'hover:bg-spotify-light-black' : 'hover:bg-gray-100'} rounded-full`}>
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {settings.map((section) => (
            <div key={section.title} className="mb-8 last:mb-0">
              <h3 className="text-lg font-medium mb-4">{section.title}</h3>
              <div className="space-y-4">
                {section.options.map((option) => (
                  <div key={option} className="flex items-center justify-between">
                    <span className={isDarkMode ? 'text-spotify-light-text' : 'text-gray-700'}>{option}</span>
                    <button className="spotify-button text-sm">
                      Customize
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}