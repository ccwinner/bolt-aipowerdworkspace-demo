// This file provides a type-safe way to access environment variables
export const config = {
  DEEPSEEK_API_KEY: import.meta.env.VITE_DEEPSEEK_API_KEY || ''
};