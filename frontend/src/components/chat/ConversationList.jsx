import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { formatMessageTime } from '../../utils/chatHelpers.js';
import { FaUsers, FaUser } from 'react-icons/fa';

const List = styled.div`
  border-right: 1px solid #E1E8ED;
  background: white;
  overflow-y: auto;
  height: 100%;
`;

const Header = styled.div`
  padding: 16px;
  border-bottom: 1px solid #E1E8ED;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #14171A;
  margin: 0;
`;

const NewChatButton = styled.button`
  background: #1DA1F2;
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.2s;
  &:hover { background: #1991DB; }
`;

const ConversationItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #F7F9FA;
  background: ${props => props.$active ? '#F0F8FF' : 'transparent'};
  transition: background 0.2s;
  &:hover { background: ${props => props.$active ? '#F0F8FF' : '#F7F9FA'}; }
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
  flex-shrink: 0;
`;

const AvatarPlaceholder = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #E1E8ED;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  color: #657786;
`;

const ConvInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ConvName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #14171A;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LastMessage = styled.div`
  font-size: 13px;
  color: #657786;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
`;

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 8px;
`;

const Time = styled.div`
  font-size: 11px;
  color: #657786;
`;

const UnreadBadge = styled.div`
  background: #1DA1F2;
  color: white;
  font-size: 11px;
  font-weight: 600;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
`;

const Empty = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #657786;
  font-size: 14px;
`;

const ConversationList = ({ conversations, activeId, onSelect, loading }) => {
  if (loading) {
    return (
      <List>
        <Header><Title>Messages</Title></Header>
        <Empty>Loading conversations...</Empty>
      </List>
    );
  }

  return (
    <List>
      <Header>
        <Title>Messages</Title>
      </Header>
      {conversations.length === 0 ? (
        <Empty>
          No conversations yet.<br />
          Start a new one from a user's profile.
        </Empty>
      ) : (
        conversations.map(conv => (
          <ConversationItem
            key={conv.id}
            $active={activeId === conv.id}
            onClick={() => onSelect(conv.id)}
          >
            {conv.is_group ? (
              <AvatarPlaceholder><FaUsers size={20} /></AvatarPlaceholder>
            ) : conv.other_user?.profile_picture ? (
              <Avatar src={conv.other_user.profile_picture} alt="" />
            ) : (
              <AvatarPlaceholder><FaUser size={20} /></AvatarPlaceholder>
            )}
            <ConvInfo>
              <ConvName>
                {conv.is_group ? conv.title || 'Group Chat' : conv.other_user?.username || 'Unknown'}
              </ConvName>
              {conv.last_message ? (
                <LastMessage>
                  {conv.last_message.author.username}: {conv.last_message.content || 'Shared an article'}
                </LastMessage>
              ) : (
                <LastMessage>No messages yet</LastMessage>
              )}
            </ConvInfo>
            <Meta>
              {conv.last_message && (
                <Time>{formatMessageTime(conv.last_message.created_at)}</Time>
              )}
              {conv.unread_count > 0 && (
                <UnreadBadge>{conv.unread_count}</UnreadBadge>
              )}
            </Meta>
          </ConversationItem>
        ))
      )}
    </List>
  );
};

export default ConversationList;
