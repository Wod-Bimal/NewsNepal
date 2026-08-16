import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { FaArrowLeft, FaNewspaper } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ChatInput from '../components/chat/ChatInput.jsx';
import { MessageList } from '../components/chat/MessageBubble.jsx';
import { useWebSocket } from '../hooks/useWebSocket.js';
import { threadService } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import { formatMessageTime } from '../utils/chatHelpers.js';

const Page = styled.div`
  max-width: 800px;
  margin: 0 auto;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: white;
  border-left: 1px solid #E1E8ED;
  border-right: 1px solid #E1E8ED;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #E1E8ED;
  gap: 12px;
`;

const BackLink = styled(Link)`
  color: #1DA1F2;
  text-decoration: none;
  font-size: 18px;
  padding: 4px;
  display: flex;
  align-items: center;
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #14171A;
`;

const HeaderSubtitle = styled.div`
  font-size: 12px;
  color: #657786;
`;

const NewsBanner = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #F7F9FA;
  border-bottom: 1px solid #E1E8ED;
  text-decoration: none;
  transition: background 0.2s;
  &:hover { background: #EDF2F7; }
`;

const NewsIcon = styled(FaNewspaper)`
  color: #1DA1F2;
  font-size: 16px;
`;

const NewsTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #14171A;
  flex: 1;
`;

const ViewLink = styled.span`
  font-size: 12px;
  color: #1DA1F2;
  font-weight: 600;
`;

const TypingText = styled.div`
  font-size: 12px;
  color: #1DA1F2;
  font-style: italic;
  padding: 4px 16px 0;
  min-height: 20px;
`;

const Empty = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #657786;
  font-size: 14px;
  text-align: center;
`;

const ArticleDiscussion = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showError } = useNotification();

  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState(null);

  const wsUrl = id ? `/ws/thread/${id}/` : null;
  const { isConnected, lastMessage, sendMessage, sendTyping } = useWebSocket(wsUrl);

  const fetchThread = useCallback(async () => {
    try {
      const res = await threadService.getThread(id);
      setThread(res.data);
      setMessages(res.data.messages || []);
    } catch {
      showError('Failed to load discussion');
    }
    setLoading(false);
  }, [id, showError]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'message' && lastMessage.message) {
      const msg = lastMessage.message;
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    } else if (lastMessage.type === 'typing') {
      setTypingUser(lastMessage.is_typing ? lastMessage.user : null);
    }
  }, [lastMessage]);

  const handleSend = (content) => {
    const sent = sendMessage({ type: 'message', content });
    if (sent) {
      threadService.postMessage(id, { content }).then(res => {
        setMessages(prev => {
          if (prev.some(m => m.id === res.data.id)) return prev;
          return [...prev, res.data];
        });
      }).catch(() => {});
    }
  };

  const handleTyping = (isTyping) => {
    sendTyping(isTyping);
  };

  if (loading) {
    return (
      <Page>
        <Empty>Loading discussion...</Empty>
      </Page>
    );
  }

  return (
    <Page>
      <Header>
        <BackLink to={`/news/${id}`}><FaArrowLeft /></BackLink>
        <HeaderInfo>
          <HeaderTitle>Discussion</HeaderTitle>
          <HeaderSubtitle>
            {thread?.message_count || 0} messages
          </HeaderSubtitle>
        </HeaderInfo>
      </Header>

      <NewsBanner to={`/news/${id}`}>
        <NewsIcon />
        <NewsTitle>{thread?.news_title || 'View Article'}</NewsTitle>
        <ViewLink>View →</ViewLink>
      </NewsBanner>

      <MessageList messages={messages} currentUserId={user?.id} />

      <TypingText>
        {typingUser ? `${typingUser} is typing...` : ''}
      </TypingText>

      <ChatInput
        onSend={handleSend}
        onTyping={handleTyping}
        disabled={!isConnected}
      />
    </Page>
  );
};

export default ArticleDiscussion;
