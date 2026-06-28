
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Plus, Search, MessagesSquare, User, Users } from 'lucide-react';

type MessageType = {
  text: string;
  sender: 'user' | 'other';
  timestamp: Date;
};

type Channel = {
  id: string;
  name: string;
  isPrivate: boolean;
};

type DirectMessage = {
  id: string;
  username: string;
  lastMessage?: string;
  lastMessageDate?: Date;
  isOnline: boolean;
};

export const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([
    {
      text: 'Welcome to CEO Mind OS! How can I help you today?',
      sender: 'other',
      timestamp: new Date(),
    }
  ]);
  const [activeView, setActiveView] = useState<'messages' | 'channels' | 'dms'>('messages');
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

  // Sample data
  const channels: Channel[] = [
    { id: '1', name: 'General', isPrivate: false },
    { id: '2', name: 'Master Mind Group', isPrivate: true },
    { id: '3', name: 'Daily Stack', isPrivate: false },
  ];

  const directMessages: DirectMessage[] = [
    { id: '1', username: 'Trevor Dunbar', lastMessage: 'Hey, how are you doing?', lastMessageDate: new Date(Date.now() - 86400000 * 16), isOnline: true },
    { id: '2', username: 'David Carr', lastMessage: 'Thanks for your message!', lastMessageDate: new Date(Date.now() - 86400000 * 30), isOnline: false },
    { id: '3', username: 'Tim Coulter', lastMessage: 'Let me know when you complete the task', lastMessageDate: new Date(Date.now() - 86400000 * 5), isOnline: true },
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Add user message
    const newMessages = [
      ...messages,
      {
        text: message,
        sender: 'user' as const,
        timestamp: new Date(),
      },
    ];
    
    setMessages(newMessages);
    setMessage('');
    
    // Simulate response (in a real app, this would be from an API)
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: 'Thanks for your message! This is a demo response.',
          sender: 'other' as const,
          timestamp: new Date(),
        },
      ]);
    }, 1000);
  };

  const toggleCreateMenu = () => {
    setIsCreateMenuOpen(!isCreateMenuOpen);
  };

  const formatMessageDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      return `${Math.floor(diffDays / 30)} months ago`;
    }
  };

  return (
    <div className="flex h-full max-w-7xl mx-auto">
      {/* Sidebar */}
      <div className="w-72 bg-secondary border-r border-border/30 flex flex-col h-full">
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chat</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-muted/50 hover:bg-muted"
              onClick={toggleCreateMenu}
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            {/* Create menu popup */}
            {isCreateMenuOpen && (
              <div className="absolute top-24 right-8 bg-secondary border border-border/50 shadow-lg rounded-md p-2 w-48 z-10">
                <div className="p-2 hover:bg-muted/30 rounded-md cursor-pointer flex items-center gap-2">
                  <MessagesSquare className="h-4 w-4" />
                  <span>Create a Channel</span>
                </div>
                <div className="p-2 hover:bg-muted/30 rounded-md cursor-pointer flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Create a Segment</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <div className="flex space-x-2">
              <button 
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeView === 'messages' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/30'}`}
                onClick={() => setActiveView('messages')}
              >
                Messages
              </button>
              <button 
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeView === 'channels' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/30'}`}
                onClick={() => setActiveView('channels')}
              >
                Channels
              </button>
              <button 
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeView === 'dms' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/30'}`}
                onClick={() => setActiveView('dms')}
              >
                DMs
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-9 bg-muted/30 border-border/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeView === 'channels' && (
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">CHANNELS</h3>
              {channels.map(channel => (
                <div key={channel.id} className="flex items-center px-2 py-1.5 rounded-md hover:bg-muted/30 cursor-pointer">
                  <div className="flex items-center">
                    <MessagesSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{channel.name}</span>
                  </div>
                  {channel.isPrivate && (
                    <div className="ml-2 bg-muted/50 text-xs px-1.5 py-0.5 rounded">
                      Private
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {activeView === 'dms' && (
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">DIRECT MESSAGES</h3>
              {directMessages.map(dm => (
                <div key={dm.id} className="flex items-center px-2 py-1.5 rounded-md hover:bg-muted/30 cursor-pointer">
                  <div className="relative mr-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    {dm.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-secondary"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium truncate">{dm.username}</span>
                      {dm.lastMessageDate && (
                        <span className="text-xs text-muted-foreground">
                          {formatMessageDate(dm.lastMessageDate)}
                        </span>
                      )}
                    </div>
                    {dm.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">{dm.lastMessage}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeView === 'messages' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">THREADS</h3>
                <div className="px-2 py-1.5 rounded-md hover:bg-muted/30 cursor-pointer">
                  <span className="text-sm">All Threads</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">DIRECT MESSAGES</h3>
                {directMessages.map(dm => (
                  <div key={dm.id} className="flex items-center px-2 py-1.5 rounded-md hover:bg-muted/30 cursor-pointer">
                    <div className="relative mr-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      {dm.isOnline && (
                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-secondary"></div>
                      )}
                    </div>
                    <span className="text-sm">{dm.username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        <div className="p-4 border-b border-border/30">
          <h2 className="text-lg font-semibold">General</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 ${
                  msg.sender === 'user'
                    ? 'bubble-user'
                    : 'bubble-ai pl-5'
                }`}
              >
                <div className="text-sm">{msg.text}</div>
                <div className="text-xs text-right mt-1 opacity-70">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              onKeyDown={(e) => {
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (e.key === 'Enter' && !isMobile) {
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
