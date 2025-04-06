import React, { useState, useEffect } from 'react';
import { Plus, X, Pencil } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { fetchTasks, addTask, updateTask, deleteTask, Task } from '../lib/supabase/tasks';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface TaskBoardProps {
  isDarkMode: boolean;
}

export function TaskBoard({ isDarkMode }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const fetchInitialTasks = async () => {
      try {
        console.log('Initializing task board...');
        const tasks = await fetchTasks();
        setTasks(tasks);
        console.log('Initial tasks loaded:', tasks.length);
      } catch (err) {
        console.error('Error loading initial tasks:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    const setupRealtimeSubscription = async () => {
      try {
        console.log('Setting up realtime subscription...');
        const channel = supabase
          .channel('tasks_changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'tasks' 
            }, 
            async (payload) => {
              console.log('Realtime event received:', payload.eventType, payload);
              try {
                const tasks = await fetchTasks();
                console.log('Tasks refreshed after realtime event:', tasks.length);
                setTasks(tasks);
              } catch (err) {
                console.error('Error refreshing tasks after realtime event:', err);
                setError('Failed to refresh tasks');
              }
            }
          )
          .subscribe((status) => {
            console.log('Subscription status:', status);
          });

        setSubscription(channel);
        console.log('Realtime subscription established');
      } catch (err) {
        console.error('Error setting up realtime subscription:', err);
        setError('Failed to setup realtime updates');
      }
    };

    fetchInitialTasks();
    setupRealtimeSubscription();

    return () => {
      if (subscription) {
        console.log('Cleaning up realtime subscription');
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleAddTask = async (status: 'todo' | 'in-progress' | 'done') => {
    if (newTaskTitle.trim()) {
      try {
        console.log('Adding new task:', { title: newTaskTitle, status });
        setError(null);
        await addTask({
          title: newTaskTitle,
          description: '',
          status
        });
        setNewTaskTitle('');
        setActiveColumn(null);
        console.log('Task added successfully');
      } catch (err) {
        console.error('Error adding task:', err);
        setError(err instanceof Error ? err.message : 'Failed to create task. Please try again.');
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setDraggedTask(task);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const column = (e.currentTarget as HTMLElement).dataset.columnId;
    if (column) {
      setDragOverColumn(column);
    }
  };

  const handleDrop = async (e: React.DragEvent, status: 'todo' | 'in-progress' | 'done') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    try {
      await updateTask(taskId, { status });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move task');
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-spotify-green' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'done', title: 'Done', color: 'bg-purple-500' }
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-spotify-green" />
      </div>
    );
  }

  return (
    <div className="h-full p-6 bg-spotify-black">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-spotify-white-text">Task Board</h1>
        {error && (
          <div className="text-red-500 bg-red-500/10 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
      
      <div className="flex gap-6 h-[calc(100%-5rem)] overflow-x-auto pb-6">
        {columns.map(column => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 flex flex-col rounded-xl bg-spotify-dark-base"
            data-column-id={column.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id as Task['status'])}
          >
            <div className="p-3 flex items-center justify-between border-b border-spotify-light-black">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-semibold text-spotify-white-text">{column.title}</h3>
                <span className="text-sm text-spotify-light-text">
                  ({tasks.filter(t => t.status === column.id).length})
                </span>
              </div>
              <button
                onClick={() => setActiveColumn(activeColumn === column.id ? null : column.id)}
                className="p-1 hover:bg-spotify-light-black rounded-lg text-spotify-light-text"
              >
                <Plus size={20} />
              </button>
            </div>

            {activeColumn === column.id && (
              <div className="p-3 border-b border-spotify-light-black">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title..."
                  className="w-full px-3 py-2 rounded-lg bg-spotify-light-black text-spotify-white-text placeholder-spotify-light-text focus:outline-none focus:ring-2 focus:ring-spotify-green"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTask(column.id as Task['status']);
                    }
                  }}
                />
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {tasks
                .filter(task => task.status === column.id)
                .map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragEnd={handleDragEnd}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className={`p-3 rounded-lg ${
                      draggedTask?.id === task.id
                        ? 'opacity-50'
                        : dragOverColumn === column.id
                        ? 'translate-y-1'
                        : ''
                    } bg-spotify-light-black hover:bg-spotify-lightest-black cursor-move group transition-all duration-200`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-spotify-white-text font-medium">{task.title}</h4>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1 hover:bg-spotify-lightest-black rounded text-spotify-light-text transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await deleteTask(task.id);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : 'Failed to delete task');
                            }
                          }}
                          className="p-1 hover:bg-spotify-lightest-black rounded text-spotify-light-text transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    {task.description && (
                      <p className="mt-2 text-sm text-spotify-light-text line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-spotify-dark-base rounded-xl w-[500px] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-spotify-white-text">Edit Task</h3>
              <button
                onClick={() => setEditingTask(null)}
                className="p-2 hover:bg-spotify-light-black rounded-full text-spotify-light-text"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-spotify-light-text mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => {
                    const updatedTask = { ...editingTask, title: e.target.value };
                    setEditingTask(updatedTask);                    
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-spotify-light-black text-spotify-white-text placeholder-spotify-light-text focus:outline-none focus:ring-2 focus:ring-spotify-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-spotify-light-text mb-2">
                  Description
                </label>
                <textarea
                  value={editingTask.description}
                  onChange={(e) => {
                    const updatedTask = { ...editingTask, description: e.target.value };
                    setEditingTask(updatedTask);                    
                  }}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-spotify-light-black text-spotify-white-text placeholder-spotify-light-text focus:outline-none focus:ring-2 focus:ring-spotify-green resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    if (editingTask) {
                      try {
                        await updateTask(editingTask.id, {
                          title: editingTask.title,
                          description: editingTask.description
                        });
                        setEditingTask(null);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to update task');
                      }
                    }
                  }}
                  className="spotify-button"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}