import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppRouter } from '../routes/AppRouter';
import { useAuthStore } from '../store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const initAuth = useAuthStore((state) => state.initAuth);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    initAuth();

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [initAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster 
        position={isMobile ? "bottom-center" : "top-right"} 
        richColors 
        toastOptions={{
          style: {
            fontSize: isMobile ? '12px' : '14px',
            padding: isMobile ? '10px 12px' : '14px',
            maxWidth: isMobile ? '300px' : 'none',
            margin: isMobile ? '0 auto 8px auto' : '0',
            borderRadius: '12px',
          }
        }}
      />
    </QueryClientProvider>
  );
}