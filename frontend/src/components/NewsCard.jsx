import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import { newsService, commentService } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaHeart, FaRetweet, FaComment, FaTrash, FaPaperPlane } from 'react-icons/fa';

const NewsContainer = styled.div`
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  transition: box-shadow 0.3s ease;
  cursor: pointer;
  &:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
`;

const NewsHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const Avatar = styled.img`
  width: 48px; height: 48px; border-radius: 50%; object-fit: cover; margin-right: 12px;
`;

const UserInfo = styled.div`flex: 1;`;

const Username = styled.span`font-weight: 600; color: #14171A; margin-right: 8px;`;

const Topic = styled.span`
  background: ${props => props.color || '#1DA1F2'}; color: white; padding: 4px 8px;
  border-radius: 12px; font-size: 12px; font-weight: 600; margin-left: 8px;
`;

const Timestamp = styled.span`color: #657786; font-size: 14px;`;

const NewsContent = styled.div`margin-bottom: 16px; line-height: 1.5; color: #14171A;`;

const NewsImage = styled.img`width: 100%; max-width: 500px; border-radius: 8px; margin-top: 12px;`;

const NewsActions = styled.div`
  display: flex; align-items: center; gap: 20px; padding-top: 12px; border-top: 1px solid #F7F9FA;
`;

const ActionButton = styled.button`
  display: flex; align-items: center; gap: 6px; background: none; border: none;
  color: ${props => props.active ? '#E0245E' : '#657786'}; cursor: pointer; font-size: 14px; font-weight: 600;
  transition: color 0.3s ease;
  &:hover { color: ${props => props.active ? '#C71E5A' : '#1DA1F2'}; }
`;

const DeleteButton = styled.button`
  background: none; border: none; color: #E0245E; cursor: pointer; padding: 4px; border-radius: 4px;
  &:hover { background-color: #FDF2F8; }
`;

const CommentsSection = styled.div`
  margin-top: 16px; padding-top: 16px; border-top: 1px solid #E1E8ED;
`;

const CommentItem = styled.div`
  display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #F7F9FA;
`;

const CommentAvatar = styled.img`
  width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0;
`;

const CommentBody = styled.div`flex: 1;`;

const CommentAuthor = styled.div`font-weight: 600; font-size: 14px; color: #14171A;`;

const CommentText = styled.div`font-size: 14px; color: #14171A; margin: 4px 0; line-height: 1.4;`;

const CommentMeta = styled.div`display: flex; gap: 12px; font-size: 12px; color: #657786;`;

const CommentForm = styled.form`
  display: flex; gap: 12px; margin-top: 12px; align-items: flex-end;
`;

const CommentInput = styled.textarea`
  flex: 1; border: 1px solid #E1E8ED; border-radius: 8px; padding: 10px; font-size: 14px;
  resize: none; font-family: inherit; min-height: 44px; outline: none;
  &:focus { border-color: #1DA1F2; }
`;

const CommentButton = styled.button`
  background: #1DA1F2; color: white; border: none; border-radius: 8px; padding: 10px 16px;
  cursor: pointer; font-size: 14px; &:disabled { background: #AAB8C2; }
`;

const NewsCard = ({ newsItem, onUpdate }) => {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [localComments, setLocalComments] = useState(newsItem.comments || []);

  const formatDate = (ts) => {
    const diff = Math.floor((new Date() - new Date(ts)) / 3600000);
    if (diff < 1) return 'Just now';
    if (diff < 24) return `${diff}h`;
    if (diff < 168) return `${Math.floor(diff / 24)}d`;
    return new Date(ts).toLocaleDateString();
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button, textarea, input')) return;
    navigate(`/news/${newsItem.id}`);
  };

  const handleLike = async () => {
    if (!isAuthenticated || isLiking) return;
    setIsLiking(true);
    try { await newsService.likeNews(newsItem.id); onUpdate(); } catch {}
    finally { setIsLiking(false); }
  };

  const handleShare = async () => {
    if (!isAuthenticated || isSharing) return;
    setIsSharing(true);
    try { await newsService.shareNews(newsItem.id); onUpdate(); } catch {}
    finally { setIsSharing(false); }
  };

  const handleDelete = async () => {
    if (!isAuthenticated || user?.id !== newsItem.author.id) return;
    if (!window.confirm('Delete this news post?')) return;
    try { await newsService.deleteNews(newsItem.id); showSuccess('News post deleted'); onUpdate(); }
    catch { showError('Failed to delete'); }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await commentService.createComment(newsItem.id, { content: commentText });
      setLocalComments(prev => [...prev, res.data]);
      setCommentText('');
      showSuccess('Comment added');
    } catch { showError('Failed to add comment'); }
    finally { setSubmittingComment(false); }
  };

  const handleCommentLike = async (commentId) => {
    if (!isAuthenticated) return;
    try {
      const res = await commentService.likeComment(commentId);
      setLocalComments(prev => prev.map(c =>
        c.id === commentId ? { ...c, is_liked: res.data.liked, like_count: res.data.like_count } : c
      ));
    } catch {}
  };

  const handleCommentDelete = async (commentId) => {
    try { await commentService.deleteComment(commentId); setLocalComments(prev => prev.filter(c => c.id !== commentId)); }
    catch { showError('Failed to delete comment'); }
  };

  return (
    <NewsContainer onClick={handleCardClick}>
      <NewsHeader>
        <Avatar src={newsItem.author.profile_picture || '/default-avatar.svg'} alt={newsItem.author.username} />
        <UserInfo>
          <Username>{newsItem.author.username}</Username>
          {newsItem.topic && <Topic color={newsItem.topic.color}>{newsItem.topic.name}</Topic>}
        </UserInfo>
        <Timestamp>{formatDate(newsItem.created_at)}</Timestamp>
        {isAuthenticated && user?.id === newsItem.author.id && (
          <DeleteButton onClick={handleDelete} title="Delete"><FaTrash size={14} /></DeleteButton>
        )}
      </NewsHeader>

      <NewsContent>{newsItem.content}</NewsContent>

      {newsItem.image && <NewsImage src={newsItem.image} alt="" />}

      <NewsActions>
        <ActionButton active={newsItem.is_liked} onClick={handleLike} disabled={isLiking}>
          <FaHeart /> {newsItem.like_count}
        </ActionButton>
        <ActionButton active={newsItem.is_shared} onClick={handleShare} disabled={isSharing}>
          <FaRetweet /> {newsItem.share_count}
        </ActionButton>
        <ActionButton onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}>
          <FaComment /> {newsItem.comment_count || localComments.length}
        </ActionButton>
      </NewsActions>

      {showComments && (
        <CommentsSection>
          {localComments.map(c => (
            <CommentItem key={c.id}>
              <CommentAvatar src={c.author.profile_picture || '/default-avatar.svg'} alt={c.author.username} />
              <CommentBody>
                <CommentAuthor>{c.author.username}</CommentAuthor>
                <CommentText>{c.content}</CommentText>
                <CommentMeta>
                  <span>{formatDate(c.created_at)}</span>
                  <button onClick={() => handleCommentLike(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.is_liked ? '#E0245E' : '#657786', fontWeight: 600, padding: 0 }}>
                    {c.like_count} {c.is_liked ? 'Liked' : 'Like'}
                  </button>
                  {isAuthenticated && user?.id === c.author.id && (
                    <button onClick={() => handleCommentDelete(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E0245E', padding: 0 }}>Delete</button>
                  )}
                </CommentMeta>
              </CommentBody>
            </CommentItem>
          ))}
          {isAuthenticated ? (
            <CommentForm onSubmit={handleCommentSubmit}>
              <CommentInput value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment..." maxLength={500} />
              <CommentButton type="submit" disabled={!commentText.trim() || submittingComment}>
                <FaPaperPlane />
              </CommentButton>
            </CommentForm>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px', color: '#657786', fontSize: '14px' }}>
              <a href="/login" style={{ color: '#1DA1F2' }}>Log in</a> to comment
            </div>
          )}
        </CommentsSection>
      )}
    </NewsContainer>
  );
};

export default NewsCard;
