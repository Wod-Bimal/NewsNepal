import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import { FaEnvelope, FaBars, FaTimes } from 'react-icons/fa';
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

const Hamburger = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  color: #14171A;
  cursor: pointer;
  padding: 4px;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 16px 0;
    overflow-y: auto;
    transform: translateX(${p => p.$open ? '0' : '100%'});
    transition: transform 0.25s ease;
    z-index: 99;
  }
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

  @media (max-width: 768px) {
    padding: 14px 20px;
    border-radius: 0;
    font-size: 16px;
  }
`;

const Button = styled.button`
  background: ${props => props.$primary ? '#1DA1F2' : 'transparent'};
  color: ${props => props.$primary ? 'white' : '#1DA1F2'};
  border: ${props => props.$primary ? 'none' : '1px solid #1DA1F2'};
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$primary ? '#1991DB' : '#F7F9FA'};
  }

  @media (max-width: 768px) {
    padding: 14px 20px;
    border-radius: 0;
    font-size: 16px;
    text-align: center;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    border-top: 1px solid #E1E8ED;
    margin-top: 8px;
    padding-top: 8px;
  }
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Username = styled.span`
  font-weight: 600;
  color: #14171A;
  padding: 14px 20px;

  @media (min-width: 769px) {
    padding: 0;
  }
`;

const LogoutButton = styled(Button)`
  @media (max-width: 768px) {
    border-top: 1px solid #E1E8ED;
  }
`;

const MobileOverlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${p => p.$open ? 'block' : 'none'};
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.3);
    z-index: 98;
  }
`;

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { showSuccess } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLanding = location.pathname === '/';

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    showSuccess('Logged out');
    navigate('/');
  };

  const renderLinks = () => {
    if (isLanding && !isAuthenticated) {
      return (
        <>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About Us</NavLink>
          <NavLink to="/login">Login</NavLink>
          <Button $primary as={Link} to="/register">Sign Up</Button>
        </>
      );
    }
    if (isAuthenticated) {
      return (
        <>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About Us</NavLink>
          <NavLink to="/feed">Feed</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/create">Add Post</NavLink>
          <NavLink to="/messages">Messages</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <UserInfo>
            {user?.profile_picture && (
              <Avatar src={user.profile_picture} alt={user.username} />
            )}
            <Username>{user?.username}</Username>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </UserInfo>
        </>
      );
    }
    return (
      <>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About Us</NavLink>
        <NavLink to="/login">Login</NavLink>
        <Button $primary as={Link} to="/register">Sign Up</Button>
      </>
    );
  };

  return (
    <Nav>
      <NavContainer>
        <Logo to={isAuthenticated ? "/feed" : "/"}>NewsNepal</Logo>

        <Hamburger onClick={() => setMobileOpen(prev => !prev)}>
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </Hamburger>

        <NavLinks $open={mobileOpen}>
          {renderLinks()}
        </NavLinks>
      </NavContainer>
      <MobileOverlay $open={mobileOpen} onClick={() => setMobileOpen(false)} />
    </Nav>
  );
};

export default Navbar;
