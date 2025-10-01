import { ChatInterface } from '@/components/chatbot/ChatInterface';

export default function ChatbotPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <ChatInterface />
    </div>
  );
}
