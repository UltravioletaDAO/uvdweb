import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { isDebugEnabled } from "./config";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Debug utility - only logs when DEBUG is enabled
export const debugLog = (...args) => {
  if (isDebugEnabled()) {
    console.log(...args);
  }
};

// Alternative debug functions for different log levels
export const debugWarn = (...args) => {
  if (isDebugEnabled()) {
    console.warn(...args);
  }
};

export const debugError = (...args) => {
  if (isDebugEnabled()) {
    console.error(...args);
  }
};
