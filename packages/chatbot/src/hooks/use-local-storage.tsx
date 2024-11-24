import { useState, useEffect } from "react";

function getStorageValue<T>(key: string, defaultValue: T): T {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  // getting stored value
  const saved = localStorage.getItem(key);
  const initial = saved ? JSON.parse(saved) : defaultValue;
  return initial;
}

export const useLocalStorage = <T,>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue<T>(key, defaultValue);
  });

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      // storing input name
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue];
};
