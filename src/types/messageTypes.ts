import { sendChatMessage } from '../utils/deepseek';

export enum MessageType {
  DOCUMENT = 'document',
  ROADMAP = 'roadmap',
  EMAIL = 'email',
  UNKNOWN = 'unknown'
}

export const getMessageType = async (content: string): Promise<MessageType> => {
  const prompt = `Please return me one of the following message types based on my input, the types are: document, roadmap, email, and unknown. The input is ${content}`;
  
  try {
    const response = await sendChatMessage(prompt, MessageType.UNKNOWN, true);
    const type = response.trimmed.toLowerCase();
    
    switch (type) {
      case 'document':
        return MessageType.DOCUMENT;
      case 'roadmap':
        return MessageType.ROADMAP;
      case 'email':
        return MessageType.EMAIL;
      default:
        return MessageType.UNKNOWN;
    }
  } catch (error) {
    console.error('Error getting message type:', error);
    return MessageType.UNKNOWN;
  }
};