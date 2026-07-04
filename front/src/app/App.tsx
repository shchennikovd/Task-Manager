import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useState, useEffect } from 'react';
import { authService } from './auth';
import { AuthScreen } from './components/AuthScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    void authService.initialize().finally(() => setIsInitializing(false));
    const unsubscribe = authService.subscribe(() => {
      setIsAuthenticated(authService.isAuthenticated());
    });
    return unsubscribe;
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-400">
        Загрузка...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return <RouterProvider router={router} />;
}