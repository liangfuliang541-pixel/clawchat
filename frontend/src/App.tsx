import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { authApi } from './lib/api';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';

function AppRoutes() {
  const { user, isLoading, setUser, logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('clawchat_token');
    if (!token) {
      useAuthStore.getState().setLoading(false);
      return;
    }
    authApi
      .getProfile()
      .then((u) => setUser(u))
      .catch(() => logout())
      .finally(() => useAuthStore.getState().setLoading(false));
  }, [setUser, logout]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/chat" replace /> : <LoginPage />} />
      <Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
