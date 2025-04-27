import { useNavigate } from 'react-router-dom';
import { useLoading } from '@/contexts/LoadingContext';

export const useNavigation = () => {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();

  const navigateWithLoading = (path: string, options?: { delay?: number }) => {
    const delay = options?.delay || 300; // Default 300ms loading delay for better UX
    
    startLoading();
    
    setTimeout(() => {
      navigate(path);
      setTimeout(() => {
        stopLoading();
      }, 100); // Small additional delay to ensure component mount
    }, delay);
  };

  return { navigateWithLoading, navigate };
}; 