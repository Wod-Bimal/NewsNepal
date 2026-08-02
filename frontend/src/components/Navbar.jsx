import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import styled from 'styled-components';

const Nav = styled.nav`
  background: white;
  border-bottom: 1px solid #E1E8ED;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  color: #1DA1F2;
  text-decoration: none;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const NavLink = styled(Link)`
  color: #14171A;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 20px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #F7F9FA;
  }
`;

const Button = styled.button`
  background: ${props => props.primary ? '#1DA1F2' : 'transparent'};
  color: ${props => props.primary ? 'white' : '#1DA1F2'};
  border: ${props => props.primary ? 'none' : '1px solid #1DA1F2'};
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.primary ? '#1991DB' : '#F7F9FA'};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const Username = styled.span`
  font-weight: 600;
  color: #14171A;
`;

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { showSuccess } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const handleLogout = async () => {
    await logout();
    showSuccess('Logged out');
    navigate('/');
  };

  return (
    <Nav>
      <NavContainer>
        <Logo to={isAuthenticated ? "/feed" : "/"}>NewsNepal</Logo>
        
        <NavLinks>
          {isLanding && !isAuthenticated ? (
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/about">About Us</NavLink>
              <NavLink to="/login">Login</NavLink>
              <Button primary as={Link} to="/register">Sign Up</Button>
            </>
          ) : isAuthenticated ? (
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/about">About Us</NavLink>
              <NavLink to="/feed">Feed</NavLink>
              <NavLink to="/create">Add Post</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <UserInfo>
                {user?.profile_picture && (
                  <Avatar 
                    src={user.profile_picture} 
                    alt={user.username}
                  />
                )}
                <Username>{user?.username}</Username>
                <Button onClick={handleLogout}>Logout</Button>
              </UserInfo>
            </>
          ) : (
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/about">About Us</NavLink>
              <NavLink to="/login">Login</NavLink>
              <Button primary as={Link} to="/register">Sign Up</Button>
            </>
          )}
        </NavLinks>
      </NavContainer>
    </Nav>
  );
};

export default Navbar;
