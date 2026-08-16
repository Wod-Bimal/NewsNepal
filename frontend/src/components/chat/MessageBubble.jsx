import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { formatMessageTime, shouldShowDateSeparator, formatMessageDate } from '../../utils/chatHelpers.js';
import { FaNewspaper } from 'react-icons/fa';

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  margin-bottom: 4px;
  padding: 0 16px;
`;

const AuthorName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #657786;
  margin-bottom: 2px;
  margin-left: 4px;
`;

const Bubble = styled.div`
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  background: ${props => props.$isOwn ? '#1DA1F2' : '#E1E8ED'};
  color: ${props => props.$isOwn ? 'white' : '#14171A'};
  border-bottom-right-radius: ${props => props.$isOwn ? '4px' : '16px'};
  border-bottom-left-radius: ${props => props.$isOwn ? '16px' : '4px'};
`;

const Time = styled.div`
  font-size: 11px;
  color: #657786;
  margin-top: 2px;
  margin-left: 4px;
`;

const DateSeparator = styled.div`
  text-align: center;
  padding: 12px 0;
  font-size: 12px;
  color: #657786;
  font-weight: 600;
`;

const DateSeparatorLine = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
`;

const DateLine = styled.div`
  flex: 1;
  height: 1px;
  background: #E1E8ED;
`;

const NewsCard = styled.div`
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 12px;
  padding: 10px;
  margin-top: 6px;
  max-width: 280px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  &:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
`;

const NewsCardTitle = styled.div`
  font-weight: 600;
  font-size: 13px;
  color: #14171A;
  margin-bottom: 4px;
`;

const NewsCardSummary = styled.div`
  font-size: 12px;
  color: #657786;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NewsCardIcon = styled(FaNewspaper)`
  color: #1DA1F2;
  margin-right: 4px;
`;

const MessageBubble = ({ message, isOwn, showAuthor }) => {
  return (
    <MessageWrapper $isOwn={isOwn}>
      {showAuthor && <AuthorName>{message.author.username}</AuthorName>}
      <Bubble $isOwn={isOwn}>{message.content}</Bubble>
      {message.shared_news && (
        <a
          href={`/news/${message.shared_news.id || message.shared_news}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          <NewsCard>
            <NewsCardTitle>
              <NewsCardIcon /> Shared Article
            </NewsCardTitle>
            {message.shared_news.title && (
              <NewsCardSummary>{message.shared_news.title}</NewsCardSummary>
            )}
          </NewsCard>
        </a>
      )}
      <Time>{formatMessageTime(message.created_at)}</Time>
    </MessageWrapper>
  );
};

const TypingBubble = styled.div`
  padding: 8px 14px;
  background: #E1E8ED;
  border-radius: 16px;
  font-size: 13px;
  color: #657786;
  font-style: italic;
  margin-left: 16px;
`;

const MessageList = ({ messages, currentUserId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const reversed = [...messages].reverse();

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingTop: 8, paddingBottom: 8 }}>
      {reversed.map((msg, idx) => {
        const prevMsg = reversed[idx - 1];
        const showDate = shouldShowDateSeparator(msg, prevMsg);
        const showAuthor = !prevMsg || prevMsg.author.id !== msg.author.id || showDate;

        return (
          <React.Fragment key={msg.id || idx}>
            {showDate && (
              <DateSeparator>
                <DateSeparatorLine>
                  <DateLine />
                  <span>{formatMessageDate(msg.created_at)}</span>
                  <DateLine />
                </DateSeparatorLine>
              </DateSeparator>
            )}
            <MessageBubble
              message={msg}
              isOwn={msg.author.id === currentUserId}
              showAuthor={showAuthor}
            />
          </React.Fragment>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export { MessageBubble, MessageList, TypingBubble };
export default MessageList;
