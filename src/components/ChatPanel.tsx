import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Users, Send, Mic, Paperclip, X, Bug } from 'lucide-react';
import { sendChatMessage } from '../utils/deepseek';
import { manageTaskProgress, updateTaskProgress, completeTask } from '../utils/taskProgress';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageType, getMessageType } from '../types/messageTypes';
import { useDocumentStore } from '../store/documentStore';
import { useRoadmapStore } from '../store/roadmapStore';
import { useEmailStore } from '../store/emailStore';
import { useTaskProgressStore } from '../store/taskProgressStore';

interface ChatPanelProps {
  activeChatTab: string;
  setActiveChatTab: (tab: string) => void;
  isDarkMode: boolean;
  onPRDResponse: (content: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  logs?: string[];
  fullContent?: string;
  taskId?: string;
  type?: MessageType;
}

export function ChatPanel({ activeChatTab, setActiveChatTab, isDarkMode, onPRDResponse }: ChatPanelProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [error, setError] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [showDebugLogs, setShowDebugLogs] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { setDocumentContent } = useDocumentStore();
  const { setRoadmapContent } = useRoadmapStore();
  const { setEmailTemplate } = useEmailStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const unsubscribe = useTaskProgressStore.subscribe((state) => {
      const completedTasks = state.tasks.filter(task => task.status === 'completed');
      
      completedTasks.forEach(task => {
        const message = messages.find(msg => msg.taskId === task.id && msg.fullContent);
        if (!message) return;
        
        switch (task.type) {
          case MessageType.DOCUMENT:
            setDocumentContent(message.fullContent!);
            break;
          case MessageType.ROADMAP:
            setRoadmapContent(message.fullContent!);
            break;
          case MessageType.EMAIL:
            setEmailTemplate(message.fullContent!);
            break;
        }
      });
    });

    return () => unsubscribe();
  }, [messages, setDocumentContent, setRoadmapContent, setEmailTemplate]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleEmailClick = () => {
    handleSendMessage('Provide me a general template for the emailing to colleague');
  };

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || message.trim();
    console.log('Message to send:', messageToSend);
    
    if (!messageToSend) {
      console.log('Empty message detected');
      setError('Please enter a message');
      return;
    }
    
    if (messageToSend && !isLoading) {
      const currentLogs: string[] = [];
      const log = (message: string) => {
        currentLogs.push(`${new Date().toISOString()} - ${message}`);
        setLogs(prev => [...prev, `${new Date().toISOString()} - ${message}`]);
      };

      console.log('Starting message send with:', { messageToSend });
      log(`Starting message send: ${messageToSend}`);
      const currentMessages = [...messages];
      try {
        setIsLoading(true);
        setError('');
        
        console.log('Adding user message to chat');
        log('Adding user message to chat');
        setMessages(prev => [...prev, { 
          role: 'user', 
          content: messageToSend,
          logs: currentLogs
        }]);
        
        // First, get the message type
        console.log(`Requesting message type classification ${messageToSend}`);
        log(`Requesting message type classification for ${messageToSend}`);
        const typeResponse = await sendChatMessage(
          messageToSend,
          MessageType.UNKNOWN,
          true
        );
        
        const messageType = typeResponse.type;
        console.log('Determined message type:', messageType);
        log(`Determined message type: ${messageType}`);

        let taskId: string | null = null;

        if (messageType === MessageType.UNKNOWN) {
          console.log('Handling unknown message type');
          log('Handling unknown message type');
          
          // For unknown type, send the original message to DeepSeek
          const response = await sendChatMessage(messageToSend, messageType);
          console.log('Received API response for unknown type:', response);
          log(`Received API response for unknown type: ${JSON.stringify(response)}`);
          
          const newMessage = { 
            role: 'assistant', 
            content: response.trimmed,
            type: messageType,
            logs: currentLogs
          };
          setMessages(prev => [...prev, newMessage]);
        } else {
          console.log('Processing supported message type:', messageType);
          log(`Processing supported message type: ${messageType}`);
          
          // Initialize task progress management for supported types
          const taskProgress = manageTaskProgress(messageType);
          taskId = taskProgress.taskId;
          
          // For supported types, proceed with the API call
          // const formattedMessage = `Please provide me a template for writing ${messageType} and return it in Markdown`;
          console.log('Sending message:', messageToSend);
          log(`Sending message: ${messageToSend}`);
          const response = await sendChatMessage(messageToSend, messageType);
          console.log('Received API response:', response);
          log(`Received API response: ${JSON.stringify(response)}`);

          // Update task progress incrementally
          updateTaskProgress(taskId, 30);
          updateTaskProgress(taskId, 50);
          updateTaskProgress(taskId, 80);
          
          if (response) {
            if (response.full) {
              const contentToUpdate = response.full;
              console.log('Updating content for type:', messageType, 'Content length:', contentToUpdate.length, `content: `, contentToUpdate);
              log(`Updating content for type: ${messageType}, Content length: ${contentToUpdate.length}`);
              switch (messageType) {
                case MessageType.DOCUMENT:
                  setDocumentContent(contentToUpdate);
                  onPRDResponse(contentToUpdate);
                  break;
                case MessageType.ROADMAP:
                  setRoadmapContent(contentToUpdate);
                  // Auto-switch to roadmap tab for better UX
                  window.dispatchEvent(new CustomEvent('switchTab', { detail: 'roadmap' }));
                  break;
                case MessageType.EMAIL:
                  setEmailTemplate(contentToUpdate);
                  // Auto-switch to email tab for better UX
                  window.dispatchEvent(new CustomEvent('switchTab', { detail: 'email' }));
                  break;
              }
            }
            
            // Complete the task
            completeTask(taskId);

            console.log('Creating new assistant message with:', {
              trimmedLength: response.trimmed.length,
              fullLength: response.full?.length,
              taskId: taskId,
              type: messageType
            });
            const newMessage = { 
              role: 'assistant', 
              content: response.trimmed,
              fullContent: response.full,
              taskId: taskId,
              type: messageType,
              logs: currentLogs
            };
            
            setMessages(prev => [...prev, newMessage]);
            
          }
        }
        
        // Only cleanup task if it was created
        setMessage('');
      } catch (err) {
        if (taskId) {
          const task = useTaskProgressStore.getState().getTaskById(taskId);
          if (task?.status !== 'completed') {
            useTaskProgressStore.getState().removeTask(taskId);
          }
        }
        
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message. Please try again.';
        const errorLog = `${new Date().toISOString()} - Error: ${errorMessage}`;
        currentLogs.push(errorLog);

        console.log('Error details:', {
          name: err instanceof Error ? err.name : 'Unknown',
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
          raw: err
        });
        log(`Error occurred: ${errorMessage}`);
        console.error('Error sending message:', err);
        setError(errorMessage);
        
        // Add error message to chat with logs
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: ${errorMessage}`,
          logs: currentLogs,
          type: MessageType.UNKNOWN
        }]);
      } finally {
        log('Message handling completed');
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderHints = () => (
    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-4 p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'} rounded-lg`}>
      <div className="font-medium mb-2">Try asking:</div>
      <div 
        className="mt-2 text-blue-600 cursor-pointer hover:underline font-medium"
        onClick={() => setMessage('Please show me the latest task status')}
      >
        "Please show me the latest task status"
      </div>
      <div 
        className="mt-2 text-blue-600 cursor-pointer hover:underline font-medium"
        onClick={() => setMessage('Generate a project timeline')}
      >
        "Generate a project timeline"
      </div>
      <div 
        className="mt-2 text-blue-600 cursor-pointer hover:underline font-medium"
        onClick={() => setMessage('Create a new PRD document')}
      >
        "Create a new PRD document"
      </div>
      <div 
        className="mt-2 text-blue-600 cursor-pointer hover:underline font-medium"
        onClick={() => setMessage('Provide me a general template for the emailing to colleague')}
      >
        "Quick entry for sending email to my teammate"
      </div>
    </div>
  );

  return (
    <div className={`w-64 border-r ${isDarkMode ? 'border-spotify-light-black' : 'border-gray-200'} flex flex-col bg-spotify-black`}>
      <div className={`p-4 border-b ${isDarkMode ? 'border-spotify-light-black' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-spotify-white-text">Workspace</span>
          <div className={`flex items-center ${isDarkMode ? 'bg-spotify-light-black' : 'bg-gray-200'} rounded-full px-4 py-1.5 ml-2 text-sm`}>
            <span>Project Alpha</span>
            <span className="ml-2">▼</span>
          </div>
        </div>
      </div>

      <div className={`flex border-b ${isDarkMode ? 'border-spotify-light-black' : 'border-gray-200'}`}>
        <button 
          className={`flex-1 p-3 text-sm ${activeChatTab === 'ai' ? 'bg-spotify-green text-white' : isDarkMode ? 'hover:bg-spotify-light-black text-spotify-light-text' : 'hover:bg-gray-100'}`}
          onClick={() => setActiveChatTab('ai')}
        >
          <div className="flex items-center justify-center space-x-2">
            <MessageSquare size={16} />
            <span>AI Assistant</span>
          </div>
        </button>
        <button 
          className={`flex-1 p-3 text-sm ${activeChatTab === 'team' ? 'bg-spotify-green text-white' : isDarkMode ? 'hover:bg-spotify-light-black text-spotify-light-text' : 'hover:bg-gray-100'}`}
          onClick={() => setActiveChatTab('team')}
        >
          <div className="flex items-center justify-center space-x-2">
            <Users size={16} />
            <span>Team Chat</span>
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg ${
                msg.role === 'user'
                  ? `${isDarkMode ? 'bg-spotify-green' : 'bg-spotify-green/10'} ml-4`
                  : `${isDarkMode ? 'bg-spotify-dark-base' : 'bg-gray-100'} mr-4`
              }`}
            >
              {msg.role === 'user' ? (
                <p className={`text-sm ${isDarkMode ? 'text-white' : msg.role === 'user' ? 'text-blue-900' : 'text-gray-900'}`}>
                  {msg.content}
                  {showDebugLogs && msg.logs && msg.logs.length > 0 && (
                    <div className={`mt-2 text-xs font-mono ${isDarkMode ? 'text-white/80' : 'text-gray-600'} border-t ${isDarkMode ? 'border-white/20' : 'border-gray-600'} pt-2`}>
                      {msg.logs.map((log, i) => (
                        <div key={i} className="whitespace-pre-wrap">{log}</div>
                      ))}
                    </div>
                  )}
                </p>
              ) : (
                <div className={`text-sm prose max-w-none ${
                  isDarkMode 
                    ? 'text-gray-100 prose-headings:text-gray-50 prose-strong:text-white prose-code:text-gray-100 prose-code:bg-gray-800' 
                    : 'prose-gray'
                }`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} mr-4`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Thinking...</p>
            </div>
          )}
        </div>
        {messages.length === 0 && (
          <div className={`text-sm ${isDarkMode ? 'text-spotify-light-text' : 'text-gray-600'} mt-4`}>
            Try asking:
            <div 
              className="mt-2 text-blue-600 cursor-pointer hover:underline font-medium"
              onClick={() => setMessage('Generate a project timeline')}
            >
              "Generate a project timeline"
            </div>
          </div>
        )}
        {renderHints()}
      </div>

      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {error && (
          <div className="mb-2 bg-red-500/10 text-red-600 p-2 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}
        <div className={`flex items-start ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-300'} rounded-lg p-2`}>
          <textarea
            ref={textareaRef}
            placeholder="Type your message..."
            className={`flex-1 bg-transparent outline-none text-sm min-w-0 resize-none ${isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500'}`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            rows={1}
            style={{ minHeight: '24px', maxHeight: '150px' }}
          />
          <div className="flex items-center space-x-1 flex-shrink-0 mt-0.5">
            <button
              onClick={() => setShowDebugLogs(!showDebugLogs)}
              className={`p-2 hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              title={showDebugLogs ? 'Hide Debug Logs' : 'Show Debug Logs'}
            >
              <Bug size={18} className={showDebugLogs ? 'text-spotify-green' : ''} />
            </button>
            <button 
              className={`p-2 hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleSendMessage()}
              disabled={isLoading}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}