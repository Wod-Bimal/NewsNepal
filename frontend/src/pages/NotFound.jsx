import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const Container = styled.div`
  max-width: 500px;
  margin: 60px auto;
  padding: 20px;
  text-align: center;
`;

const Code = styled.div`
  font-size: 96px;
  font-weight: 800;
  color: #1DA1F2;
  line-height: 1;
`;

const Title = styled.h1`
  font-size: 28px;
  margin: 12px 0 8px;
  color: #14171a;
`;

const Subtitle = styled.p`
  color: #657786;
  margin-bottom: 28px;
  font-size: 16px;
`;

const HomeBtn = styled(Link)`
  display: inline-block;
  background: #1DA1F2;
  color: #fff;
  padding: 12px 28px;
  border-radius: 9999px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;

  &:hover {
    background: #1a91da;
  }
`;

const NotFound = () => {
  useDocumentTitle('Page Not Found');
  return (
    <Container>
      <Code>404</Code>
      <Title>Page Not Found</Title>
      <Subtitle>The page you're looking for doesn't exist or may have been moved.</Subtitle>
      <HomeBtn to="/feed">Back to Feed</HomeBtn>
    </Container>
  );
};

export default NotFound;