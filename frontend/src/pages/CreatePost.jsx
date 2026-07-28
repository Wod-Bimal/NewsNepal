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

const CreatePost = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <BackLink onClick={() => navigate(-1)}>← Back</BackLink>
      <NewsForm onNewsCreated={() => navigate('/feed')} />
    </Container>
  );
};

export default CreatePost;
