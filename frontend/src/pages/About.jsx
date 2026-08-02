import React from 'react';
import styled from 'styled-components';

const Page = styled.div`
  min-height: calc(100vh - 60px);
  padding: 60px 20px;
  background: #F7F9FA;
`;

const Card = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(20, 23, 26, 0.08);
  padding: 40px;
`;

const Title = styled.h1`
  margin: 0 0 16px;
  color: #14171A;
`;

const Text = styled.p`
  font-size: 16px;
  line-height: 1.7;
  color: #657786;
  margin: 0 0 12px;
`;

const About = () => {
  return (
    <Page>
      <Card>
        <Title>About NewsNepal</Title>
        <Text>
          NewsNepal is a community-driven platform for sharing and discovering Nepal-focused news,
          stories, and updates from around the country.
        </Text>
        <Text>
          Our goal is to make it easy for readers and contributors to stay informed, connect with
          local voices, and discuss important events in a simple and welcoming space.
        </Text>
        <Text>
          Whether you are a journalist, a student, or simply someone who cares about what is happening
          in Nepal, NewsNepal brings it all together in one place.
        </Text>
      </Card>
    </Page>
  );
};

export default About;
