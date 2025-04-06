import { create } from 'zustand';
import { MessageType } from '../types/messageTypes';

export interface Task {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed';
  type: MessageType;
  timestamp: number;
}

const getTaskName = (type: MessageType): string => {
  switch (type) {
    case MessageType.ROADMAP:
      return 'Project Timeline';
    case MessageType.DOCUMENT:
      return 'PRD Document';
    case MessageType.EMAIL:
      return 'Email Template';
    default:
      return 'Processing Task';
  }
};

interface TaskProgressState {
  tasks: Task[];
  updateTaskProgress: (taskId: string, progress: number) => void;
  completeTask: (taskId: string) => void;
  initializeTask: (type: MessageType) => string; // Return taskId
  removeTask: (taskId: string) => void;
  getTaskById: (taskId: string) => Task | undefined;
}

export const useTaskProgressStore = create<TaskProgressState>((set, get) => ({
  tasks: [],
  updateTaskProgress: (taskId, progress) => 
    set((state) => ({
      tasks: state.tasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              progress, 
              status: progress < 100 ? 'in-progress' : 'completed'
            }
          : task
      )
    })),
  completeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map(task =>
        task.id === taskId
          ? { ...task, progress: 100, status: 'completed' }
          : task
      )
    })),
  initializeTask: (type) => {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    set((state) => ({
      tasks: [...state.tasks, {
        id: taskId,
        name: getTaskName(type),
        progress: 0,
        status: 'pending',
        type,
        timestamp: Date.now()
      }]
    }));

    return taskId;
  },
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter(task => task.id !== taskId)
    })),
  getTaskById: (taskId) => {
    return get().tasks.find(task => task.id === taskId);
  }
}));