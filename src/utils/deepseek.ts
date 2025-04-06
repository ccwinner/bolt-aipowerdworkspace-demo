import axios from 'axios';
import { config as envConfig } from '../config/env';
import { MessageType } from '../types/messageTypes';

const MAX_RETRIES = 3;
const INITIAL_TIMEOUT = 30000; // 30 seconds

async function retryWithExponentialBackoff(fn: () => Promise<any>, retries = MAX_RETRIES, timeout = INITIAL_TIMEOUT) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || !axios.isAxiosError(error)) throw error;
    
    console.log(`Retrying request. Attempts remaining: ${retries}`);
    await new Promise(resolve => setTimeout(resolve, timeout));
    
    return retryWithExponentialBackoff(fn, retries - 1, timeout * 2);
  }
}

export const sendChatMessage = async (message: string, messageType: MessageType, isTypeClassification: boolean = false) => {
  try {
    const makeRequest = async () => {
      const config = {
        method: 'post',
        url: 'https://api.deepseek.com/v1/chat/completions',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${envConfig.DEEPSEEK_API_KEY}`
        },
        timeout: INITIAL_TIMEOUT,
        data: {
          messages: [
            {
              content: isTypeClassification 
                ? "Please return one of the following message types based on my input, the types are: document, roadmap, email, and unknown." 
                : "You are a helpful assistant",
              role: "system"
            },
            {
              content: messageType === MessageType.UNKNOWN ? message : `Please return your response in Markdown, the request is:${message}`,
              role: "user"
            }
          ],
          model: "deepseek-chat",
          max_tokens: isTypeClassification ? 20 : 2048,
          temperature: isTypeClassification ? 0 : 1,
          response_format: { type: "text" }
        }
      };

      const response = await axios(config);
      return response.data;
    };

    if (isTypeClassification) {
      const response = await retryWithExponentialBackoff(makeRequest);
      
      if (!response?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from DeepSeek API');
      }
      
      const content = response.choices[0].message.content.trim().toLowerCase();
      const type = content === 'roadmap' ? MessageType.ROADMAP :
                   content === 'document' ? MessageType.DOCUMENT :
                   content === 'email' ? MessageType.EMAIL :
                   MessageType.UNKNOWN;
      
      return {
        full: content,
        trimmed: content,
        type: content === 'roadmap' ? MessageType.ROADMAP :
              content === 'document' ? MessageType.DOCUMENT :
              content === 'email' ? MessageType.EMAIL :
              MessageType.UNKNOWN
      };
    }

    const response = await retryWithExponentialBackoff(makeRequest);

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from DeepSeek API');
    }

    const content = response.choices[0].message.content;

    return { 
      full: content, 
      trimmed: content,
      type: MessageType.UNKNOWN
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('DeepSeek API Error Response:', error.response.data);
        throw new Error(`API Error: ${error.response.data.error?.message || 'Unknown error'}`);
      } else if (error.request) {
        console.error('DeepSeek API No Response:', error.request);
        throw new Error('No response received from DeepSeek API. Please check your internet connection.');
      } else {
        console.error('DeepSeek API Request Setup Error:', error.message);
        throw new Error(`Error setting up request: ${error.message}`);
      }
    } else {
      console.error('DeepSeek API Unknown Error:', error);
      throw new Error('An unexpected error occurred');
    }
  }
};