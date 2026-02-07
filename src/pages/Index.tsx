import { useAuth } from '@/context/AuthContext';
import { LoginForm } from '@/components/chat/LoginForm';
import { ChatLayout } from '@/components/chat/ChatLayout';

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <ChatLayout />;
};

export default Index;
