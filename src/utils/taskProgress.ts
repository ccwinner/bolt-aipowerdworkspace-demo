import { MessageType } from '../types/messageTypes';
import { useTaskProgressStore } from '../store/taskProgressStore';

interface TaskProgressResult {
  taskId: string | null;
  cleanup: () => void;
}

export const manageTaskProgress = (messageType: MessageType): TaskProgressResult => {
  let taskId: string | null = null;

  const isSpecialType = [MessageType.DOCUMENT, MessageType.ROADMAP, MessageType.EMAIL].includes(messageType);
  
  if (isSpecialType) {
    taskId = useTaskProgressStore.getState().initializeTask(messageType);
    useTaskProgressStore.getState().updateTaskProgress(taskId, 0);
  }

  const cleanup = () => {
    if (taskId) {
      useTaskProgressStore.getState().removeTask(taskId);
    }
  };

  return { taskId, cleanup };
};

export const updateTaskProgress = (taskId: string | null, progress: number) => {
  if (taskId) {
    const task = useTaskProgressStore.getState().getTaskById(taskId);
    if (task && [MessageType.DOCUMENT, MessageType.ROADMAP, MessageType.EMAIL].includes(task.type)) {
      useTaskProgressStore.getState().updateTaskProgress(taskId, progress);
    }
  }
};

export const completeTask = (taskId: string | null) => {
  if (taskId) {
    const task = useTaskProgressStore.getState().getTaskById(taskId);
    if (task && [MessageType.DOCUMENT, MessageType.ROADMAP, MessageType.EMAIL].includes(task.type)) {
      useTaskProgressStore.getState().completeTask(taskId);
    }
  }
};