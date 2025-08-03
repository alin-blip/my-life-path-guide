
import React from 'react';
import { Layout } from '@/components/Layout';
import { Chat as ChatComponent } from '@/components/Chat';

const ChatPage = () => {
  return (
    <Layout>
      <div className="h-[calc(100vh-100px)]">
        <ChatComponent />
      </div>
    </Layout>
  );
};

export default ChatPage;
