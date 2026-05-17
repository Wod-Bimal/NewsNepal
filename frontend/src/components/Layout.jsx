import React from 'react';
import styled from 'styled-components';
import Navbar from './Navbar.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: #f7f9fa;
`;

const MainContent = styled.main`
  min-height: calc(100vh - 60px);
  padding-top: 0;
`;

const Layout = ({ children }) => {
  return (
    <ErrorBoundary>
      <LayoutContainer>
        <Navbar />
        <MainContent>
          {children}
        </MainContent>
      </LayoutContainer>
    </ErrorBoundary>
  );
};

export default Layout;