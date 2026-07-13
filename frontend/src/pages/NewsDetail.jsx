import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import { newsService, commentService } from '../services/api.js';
import styled from 'styled-components';
import { FaHeart, FaRetweet, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';

const Container = styled.div`max-width: 700px; margin: 0 auto; padding: 20px;`;

const BackBtn = styled.button`
  background: none; border: none; color: #1DA1F2; cursor: pointer; font-size: 16px;
  font-weight: 600; padding: 8px 0; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
`;

const Card = styled.div`background: white; border-radius: 12px; padding: 32px; border: 1px solid #E1E8ED;`;

const Header = styled.div`display: flex; align-items: center; margin-bottom: 16px;`;

const Avatar = styled.img`width: 48px; height: 48px; border-radius: 50%; object-fit: cover; margin-right: 12px;`;

const Title = styled.h1`font-size: 24px; color: #14171A; margin-bottom: 8px;`;

const Meta = styled.div`color: #657786; font-size: 14px; margin-bottom: 16px;`;

const Content = styled.p`font-size: 16px; line-height: 1.7; color: #14171A; margin-bottom: 20px;`;

const Image = styled.img`width: 100%; border-radius: 8px; margin-bottom: 20px;`;

const Actions = styled.div`
  display: flex; gap: 20px; padding: 16px 0; border-top: 1px solid #E1E8ED; margin-bottom: 24px;
`;

const ActionBtn = styled.button`
  display: flex; align-items: center; gap: 8px; background: none; border: none;
  color: ${props => props.active ? '#E0245E' : '#657786'}; cursor: pointer; font-size: 15px; font-weight: 600;
`;

const SectionTitle = styled.h3`font-size: 18px; color: #14171A; margin-bottom: 16px;`;

const CommentItem = styled.div`display: flex; gap: 12px; padding: 16px 0; border-bottom: 1px solid #F7F9FA;`;

const CommentAvatar = styled.img`width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0;`;

const CommentForm = styled.form`display: flex; gap: 12px; margin-bottom: 20px; align-items: flex-end;`;

const CommentInput = styled.textarea`
  flex: 1; border: 1px solid #E1E8ED; border-radius: 8px; padding: 10px; font-size: 14px;
  resize: none; font-family: inherit; min-height: 44px; outline: none;
  &:focus { border-color: #1DA1F2; }
`;

const CommentBtn = styled.button`
  background: #1DA1F2; color: white; border: none; border-radius: 8px; padding: 10px 16px;
  cursor: pointer; &:disabled { background: #AAB8C2; }
`;

const Loading = styled.div`text-align: center; padding: 60px; color: #657786;`;

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    loadNews();
  }, [id]);

  const loadNews = async () => {
    try {
      const res = await newsService.getNewsItem(id);
      setNews(res.data);
      setComments(res.data.comments || []);
    } catch { showError('Failed to load news'); navigate('/feed'); }
    finally { setLoading(false); }
  };

  const handleLike = async () => {
    if (!isAuthenticated) return;
    try { const res = await newsService.likeNews(news.id); setNews({ ...news, is_liked: res.data.liked, like_count: res.data.like_count }); }
    catch {}
  };

  const handleShare = async () => {
    if (!isAuthenticated) return;
    try { const res = await newsService.shareNews(news.id); setNews({ ...news, is_shared: res.data.shared, share_count: res.data.share_count }); }
    catch {}
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await commentService.createComment(news.id, { content: commentText });
      setComments(prev => [...prev, res.data]);
      setCommentText('');
      showSuccess('Comment added');
    } catch { showError('Failed to add comment'); }
    finally { setSubmitting(false); }
  };

  const handleCommentLike = async (commentId) => {
    if (!isAuthenticated) return;
    try {
      const res = await commentService.likeComment(commentId);
      setComments(prev => prev.map(c =>
        c.id === commentId ? { ...c, is_liked: res.data.liked, like_count: res.data.like_count } : c
      ));
    } catch {}
  };

  if (loading) return <Container><Loading>Loading news...</Loading></Container>;
  if (!news) return null;

  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <Container>
      <BackBtn onClick={() => navigate(-1)}><FaArrowLeft /> Back</BackBtn>
      <Card>
        <Header>
          <Avatar src={news.author.profile_picture || '/default-avatar.svg'} alt={news.author.username} />
          <div>
            <div style={{ fontWeight: 600, color: '#14171A' }}>{news.author.username}</div>
            {news.topic && <span style={{ background: news.topic.color, color: 'white', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{news.topic.name}</span>}
          </div>
        </Header>
        {news.title && <Title>{news.title}</Title>}
        {news.summary && <Meta>{news.summary}</Meta>}
        {news.image && <Image src={news.image} alt="" />}
        <Content>{news.content}</Content>
        <Meta>Published {formatDate(news.published_at || news.created_at)}</Meta>

        <Actions>
          <ActionBtn active={news.is_liked} onClick={handleLike}><FaHeart /> {news.like_count}</ActionBtn>
          <ActionBtn active={news.is_shared} onClick={handleShare}><FaRetweet /> {news.share_count}</ActionBtn>
        </Actions>

        <SectionTitle>Comments ({comments.length})</SectionTitle>

        {isAuthenticated ? (
          <CommentForm onSubmit={handleCommentSubmit}>
            <CommentInput value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment..." maxLength={500} />
            <CommentBtn type="submit" disabled={!commentText.trim() || submitting}><FaPaperPlane /></CommentBtn>
          </CommentForm>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px', color: '#657786', marginBottom: 16 }}><a href="/login" style={{ color: '#1DA1F2' }}>Log in</a> to comment</div>
        )}

        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#657786' }}>No comments yet. Be the first!</div>
        ) : comments.map(c => (
          <CommentItem key={c.id}>
            <CommentAvatar src={c.author.profile_picture || '/default-avatar.svg'} alt={c.author.username} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#14171A' }}>{c.author.username}</div>
              <div style={{ fontSize: 14, color: '#14171A', margin: '4px 0', lineHeight: 1.4 }}>{c.content}</div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#657786' }}>
                <span>{new Date(c.created_at).toLocaleDateString()}</span>
                <button onClick={() => handleCommentLike(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.is_liked ? '#E0245E' : '#657786', fontWeight: 600, padding: 0 }}>
                  {c.like_count} {c.is_liked ? 'Liked' : 'Like'}
                </button>
              </div>
            </div>
          </CommentItem>
        ))}
      </Card>
    </Container>
  );
};

export default NewsDetail;
