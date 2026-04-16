import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ConversationSidebar } from '../components/ConversationSidebar';
import { ChatArea } from '../components/ChatArea';

export default function ChatPage() {
  const navigate = useNavigate();
  const { user, isLoading, logout } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <ConversationSidebar onLogout={handleLogout} username={user.username} />
      <ChatArea />
    </div>
  );
}
