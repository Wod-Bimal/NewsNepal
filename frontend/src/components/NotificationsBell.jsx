import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBell, FaHeart, FaComment, FaUserPlus, FaNewspaper, FaEnvelope, FaComments } from 'react-icons/fa';
import { useNotifications } from '../contexts/NotificationsContext.jsx';
import { formatMessageTime } from '../utils/chatHelpers.js';

const BellWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 119;
`;

const BellButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: #14171A;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: #F7F9FA;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  background: #E0245E;
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
`;

const Panel = styled.div`
  position: fixed;
  top: 56px;
  right: 16px;
  width: 360px;
  max-width: calc(100vw - 32px);
  max-height: 70vh;
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);
  z-index: 120;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #E1E8ED;
`;

const PanelTitle = styled.div`
  font-weight: 700;
  font-size: 16px;
  color: #14171A;
`;

const MarkAll = styled.button`
  background: none;
  border: none;
  color: #1DA1F2;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const List = styled.div`
  overflow-y: auto;
`;

const Item = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid #F7F9FA;
  background: ${p => p.$unread ? '#F0F8FF' : 'white'};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #F7F9FA;
  }
`;

const IconWrap = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #EBF5FF;
  color: #1DA1F2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 15px;
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;
`;

const Text = styled.div`
  font-size: 14px;
  color: #14171A;
  line-height: 1.4;
  word-wrap: break-word;

  strong {
    font-weight: 700;
  }
`;

const Meta = styled.div`
  margin-top: 3px;
  font-size: 12px;
  color: #657786;
`;

const Empty = styled.div`
  padding: 36px 20px;
  text-align: center;
  color: #657786;
  font-size: 14px;
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1DA1F2;
  flex-shrink: 0;
  margin-top: 6px;
`;

const TYPE_ICON = {
  follow: <FaUserPlus />,
  like: <FaHeart />,
  comment: <FaComment />,
  post: <FaNewspaper />,
  message: <FaEnvelope />,
  thread_message: <FaComments />,
};

const TYPE_TEXT = {
  follow: 'started following you',
  like: 'liked your post',
  comment: 'commented on your post',
  post: 'shared a new post',
  message: 'sent you a message',
  thread_message: 'posted in the discussion',
};

const NotificationsBell = () => {
  const {
    notifications, unreadCount, isOpen, openPanel, closePanel, markRead, markAllRead,
  } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    closePanel();
  }, [location.pathname, closePanel]);

  const handleClick = (n) => {
    markRead(n.id);
    closePanel();
    if (n.type === 'follow') {
      navigate(`/users/${n.actor?.id}`);
      return;
    }
    if (n.type === 'message' && n.conversation_id) {
      navigate(`/messages/${n.conversation_id}`);
      return;
    }
    if (n.target_news) {
      navigate(`/news/${n.target_news}`);
    }
  };

  const visible = notifications.slice(0, 30);

  return (
    <>
      <BellWrapper>
        <BellButton onClick={openPanel} aria-label="Notifications">
          <FaBell />
          {unreadCount > 0 && <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>}
        </BellButton>
      </BellWrapper>
      {isOpen && (
        <>
          <Backdrop onClick={closePanel} />
          <Panel>
          <PanelHeader>
            <PanelTitle>Notifications</PanelTitle>
            {unreadCount > 0 && <MarkAll onClick={markAllRead}>Mark all read</MarkAll>}
          </PanelHeader>
          <List>
            {visible.length === 0 ? (
              <Empty>No notifications yet</Empty>
            ) : (
              visible.map(n => (
                <Item key={n.id} $unread={!n.is_read} onClick={() => handleClick(n)}>
                  <IconWrap>{TYPE_ICON[n.type] || <FaBell size={14} />}</IconWrap>
                  <Body>
                    <Text>
                      <strong>{n.actor?.username || 'Someone'}</strong>{' '}
                      {TYPE_TEXT[n.type] || n.type}
                      {n.conversation_id ? '' : n.target_news_title ? <> — <span style={{ color: '#657786' }}>{n.target_news_title}</span></> : ''}
                    </Text>
                    <Meta>{formatMessageTime(n.created_at)}</Meta>
                  </Body>
                  {!n.is_read && <Dot />}
                </Item>
              ))
            )}
          </List>
        </Panel>
        </>
      )}
    </>
  );
};

export default NotificationsBell;