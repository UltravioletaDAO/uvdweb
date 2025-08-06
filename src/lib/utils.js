import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Debug utility - only logs when DEBUG is enabled
export const debugLog = (...args) => {
  if (process.env.REACT_APP_DEBUG === 'true') {
    console.log(...args);
  }
};

// Alternative debug functions for different log levels
export const debugWarn = (...args) => {
  if (process.env.REACT_APP_DEBUG === 'true') {
    console.warn(...args);
  }
};

export const debugError = (...args) => {
  if (process.env.REACT_APP_DEBUG === 'true') {
    console.error(...args);
  }
}; 