import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import ConversationList from '../components/chat/ConversationList.jsx';
import MessageList from '../components/chat/MessageBubble.jsx';
import ChatInput from '../components/chat/ChatInput.jsx';
import NewConversationModal from '../components/chat/NewConversationModal.jsx';
import { useWebSocket } from '../hooks/useWebSocket.js';
import { conversationService } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';

const Page = styled.div`
  display: flex;
  height: calc(100vh - 60px);
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-left: 1px solid #E1E8ED;
  border-right: 1px solid #E1E8ED;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 340px;
  flex-shrink: 0;
  border-right: 1px solid #E1E8ED;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
    display: ${props => props.$show ? 'flex' : 'none'};
  }
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (max-width: 768px) {
    display: ${props => props.$show ? 'flex' : 'none'};
    width: 100%;
  }
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #E1E8ED;
  background: white;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #1DA1F2;
  font-size: 18px;
  padding: 4px 8px 4px 0;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const ChatAvatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
`;

const ChatAvatarPlaceholder = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #E1E8ED;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #657786;
`;

const ChatName = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #14171A;
`;

const ChatStatus = styled.div`
  font-size: 12px;
  color: #657786;
`;

const TypingText = styled.div`
  font-size: 12px;
  color: #1DA1F2;
  font-style: italic;
  padding: 4px 16px 0;
  min-height: 20px;
`;

const EmptyChat = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #657786;
  font-size: 16px;
  text-align: center;
  padding: 40px;
`;

const Messages = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const wsUrl = activeConv ? `/ws/chat/${activeConv.id}/` : null;
  const { isConnected, lastMessage, sendMessage, sendTyping, markRead } = useWebSocket(wsUrl);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await conversationService.getConversations();
      setConversations(res.data.results || res.data || []);
    } catch {
      showError('Failed to load conversations');
    }
    setLoadingConvs(false);
  }, [showError]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const userId = searchParams.get('userId');
    const sharedNewsId = searchParams.get('share');
    if (userId && !id) {
      const startConversation = async () => {
        try {
          const res = await conversationService.createConversation({
            participant_ids: [parseInt(userId)],
            is_group: false,
          });
          const conv = res.data;
          navigate(`/messages/${conv.id}`, { replace: true });
        } catch {
          showError('Failed to start conversation');
        }
      };
      startConversation();
    }
  }, [searchParams, id, navigate, showError]);

  useEffect(() => {
    if (id) {
      const conv = conversations.find(c => c.id === parseInt(id));
      if (conv) {
        selectConversation(conv.id);
      }
    }
  }, [id, conversations]);

  const selectConversation = async (convId) => {
    if (activeConv?.id === convId) return;
    setLoadingMessages(true);
    setTypingUser(null);
    try {
      const res = await conversationService.getConversation(convId);
      const convData = res.data;
      setActiveConv(convData);
      setMessages(convData.messages || []);
      conversationService.markRead(convId).catch(() => {});
      markRead();
      if (isMobile) {
        navigate(`/messages/${convId}`, { replace: true });
      }
    } catch {
      showError('Failed to load conversation');
    }
    setLoadingMessages(false);
  };

  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'message' && lastMessage.message) {
      const msg = lastMessage.message;
      if (msg.conversation === activeConv?.id || (activeConv && msg.author?.id !== user?.id)) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        if (msg.author?.id !== user?.id) {
          markRead();
          fetchConversations();
        }
      }
      if (msg.author?.id !== user?.id) {
        fetchConversations();
      }
    } else if (lastMessage.type === 'typing') {
      if (lastMessage.is_typing) {
        setTypingUser(lastMessage.user);
      } else {
        setTypingUser(null);
      }
    }
  }, [lastMessage, activeConv, user, markRead, fetchConversations]);

  const handleSend = (content) => {
    sendMessage({ type: 'message', content });
  };

  const handleTyping = (isTyping) => {
    sendTyping(isTyping);
  };

  const handleNewConversation = (conv) => {
    fetchConversations();
    if (conv.id) {
      selectConversation(conv.id);
    }
  };

  const otherUser = activeConv?.other_user;

  return (
    <Page>
      <Sidebar $show={!isMobile || !activeConv}>
        <ConversationList
          conversations={conversations}
          activeId={activeConv?.id}
          onSelect={selectConversation}
          loading={loadingConvs}
        />
      </Sidebar>

      <ChatArea $show={!isMobile || !!activeConv}>
        {!activeConv ? (
          <EmptyChat>Select a conversation or start a new one</EmptyChat>
        ) : (
          <>
            <ChatHeader>
              {isMobile && (
                <BackButton onClick={() => {
                  setActiveConv(null);
                  navigate('/messages');
                }}>
                  <FaArrowLeft />
                </BackButton>
              )}
              {otherUser?.profile_picture ? (
                <ChatAvatar src={otherUser.profile_picture} alt="" />
              ) : (
                <ChatAvatarPlaceholder>
                  {(otherUser?.username || '?')[0].toUpperCase()}
                </ChatAvatarPlaceholder>
              )}
              <div>
                <ChatName>
                  {activeConv.is_group ? activeConv.title || 'Group Chat' : otherUser?.username || 'Unknown'}
                </ChatName>
                <ChatStatus>
                  {activeConv.is_group
                    ? `${activeConv.participants?.length || 0} members`
                    : isConnected ? 'Online' : 'Offline'}
                </ChatStatus>
              </div>
            </ChatHeader>

            {loadingMessages ? (
              <EmptyChat>Loading messages...</EmptyChat>
            ) : (
              <MessageList messages={messages} currentUserId={user?.id} />
            )}

            <TypingText>
              {typingUser ? `${typingUser} is typing...` : ''}
            </TypingText>

            <ChatInput
              onSend={handleSend}
              onTyping={handleTyping}
              disabled={!isConnected}
            />
          </>
        )}
      </ChatArea>

      {showNewModal && (
        <NewConversationModal
          onClose={() => setShowNewModal(false)}
          onCreated={handleNewConversation}
        />
      )}
    </Page>
  );
};

export default Messages;
