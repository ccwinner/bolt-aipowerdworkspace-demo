import React, { useState } from 'react';
import { useTaskProgressStore } from '../store/taskProgressStore';
import { MessageType } from '../types/messageTypes';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AITasksProps {
  isDarkMode: boolean;
}

// Export the component as default
export default function AITasks({ isDarkMode }: AITasksProps) {
  const [showAll, setShowAll] = useState(false);
  const tasks = useTaskProgressStore((state) => 
    state.tasks
      .filter(task => 
        [MessageType.ROADMAP, MessageType.DOCUMENT, MessageType.EMAIL].includes(task.type)
      )
      .sort((a, b) => b.timestamp - a.timestamp)
  );

  const visibleTasks = showAll ? tasks : tasks.slice(0, 5);
  const hasMoreTasks = tasks.length > 5;

  return (
    <div className="mb-6">
      <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>AI Tasks</h3>
      <div className="space-y-3 min-h-[100px]">
        {tasks.length === 0 && (
          <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-center py-4`}>
            No tasks yet. Try creating a document or roadmap.
          </div>
        )}
        {visibleTasks.map((task) => (
          <div key={task.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-3`}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm">{task.name}</div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{task.progress}%</div>
            </div>
            <div className={`h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
              <div 
                className={`h-full transition-all duration-300 ease-in-out ${
                  task.status === 'completed' 
                    ? 'bg-green-500' 
                    : task.status === 'in-progress' 
                      ? 'bg-blue-500' 
                      : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}
                style={{width: `${task.progress}%`}}
              />
            </div>
            {task.status === 'completed' && (
              <div className="text-xs text-green-500 mt-1">Done</div>
            )}
            {task.status === 'in-progress' && (
              <div className="text-xs text-blue-500 mt-1">Processing...</div>
            )}
          </div>
        ))}
      </div>
      {hasMoreTasks && (
        <button
          onClick={() => setShowAll(!showAll)}
          className={`w-full mt-3 px-4 py-2 text-sm flex items-center justify-center space-x-2 rounded-lg
            ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <span>{showAll ? 'Show Less' : 'Check More'}</span>
          {showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
    </div>
  );
}