import React from 'react';
import styled from 'styled-components';
import NewsForm from '../components/NewsForm.jsx';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`max-width: 700px; margin: 0 auto; padding: 20px;`;

const BackLink = styled.button`
  background: none; border: none; color: #1DA1F2; font-size: 14px; font-weight: 600;
  cursor: pointer; margin-bottom: 16px; padding: 0;
  &:hover { text-decoration: underline; }
`;

const Title = styled.h1`
  color: #14171A; font-size: 24px; margin-bottom: 20px;
`;

const CreatePost = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <BackLink onClick={() => navigate(-1)}>← Back</BackLink>
      <Title>Create a Post</Title>
      <NewsForm onNewsCreated={() => navigate('/feed')} />
    </Container>
  );
};

export default CreatePost;
