import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1DA1F2 0%, #0D8BD9 100%);
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 60px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
`;

const Logo = styled.h1`
  font-size: 48px;
  color: #1DA1F2;
  margin-bottom: 8px;
`;

const Tagline = styled.h2`
  font-size: 24px;
  color: #14171A;
  margin-bottom: 12px;
`;

const Description = styled.p`
  color: #657786;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 32px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PrimaryButton = styled(Link)`
  background: #1DA1F2;
  color: white;
  padding: 14px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 16px;
  text-decoration: none;
  transition: background 0.2s;
  &:hover { background: #1991DB; }
`;

const SecondaryButton = styled(Link)`
  background: transparent;
  color: #1DA1F2;
  padding: 14px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 16px;
  text-decoration: none;
  border: 1px solid #1DA1F2;
  transition: all 0.2s;
  &:hover { background: #F7F9FA; }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  color: #657786;
  font-size: 14px;
  &::before, &::after { content: ''; flex: 1; height: 1px; background: #E1E8ED; }
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid #E1E8ED;
`;

const Feature = styled.div``;

const FeatureIcon = styled.div`
  font-size: 28px;
  margin-bottom: 8px;
`;

const FeatureText = styled.div`
  font-size: 13px;
  color: #657786;
  font-weight: 600;
`;

const Landing = () => {
  return (
    <Container>
      <Card>
        <Logo>📰 NewsNepal</Logo>
        <Tagline>Nepal's Unfiltered News Hub</Tagline>
        <Description>
          See what's really happening in Nepal. Follow topics that matter, 
          share news from every side, and decide for yourself.
        </Description>
        <ButtonGroup>
          <PrimaryButton to="/register">Create Account</PrimaryButton>
          <Divider>or</Divider>
          <SecondaryButton to="/login">Sign In</SecondaryButton>
        </ButtonGroup>
        <Features>
          <Feature>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureText>Trending News</FeatureText>
          </Feature>
          <Feature>
            <FeatureIcon>🏷️</FeatureIcon>
            <FeatureText>By Topic</FeatureText>
          </Feature>
          <Feature>
            <FeatureIcon>🔍</FeatureIcon>
            <FeatureText>Bias Check</FeatureText>
          </Feature>
        </Features>
      </Card>
    </Container>
  );
};

export default Landing;
