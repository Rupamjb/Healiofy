
import { useRef } from 'react';

/**
 * A custom hook to create a ref for use with Framer Motion animations
 * This serves as a bridge to migrate from anime.js to framer-motion
 */
export function useAnimeEffect<T extends HTMLElement>() {
  const elementRef = useRef<T>(null);
  return elementRef;
}
