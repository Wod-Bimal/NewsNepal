import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import { FaEnvelope, FaBars, FaTimes } from 'react-icons/fa';
import styled from 'styled-components';
import NotificationsBell from './NotificationsBell.jsx';

const Nav = styled.nav`
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid #e5e9e4;
  backdrop-filter: blur(16px);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const NavContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 68px;
`;

const Logo = styled(Link)`
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.8px;
  color: #16704f;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: #10583e;
  }
`;

const Hamburger = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  color: #17241f;
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
    top: 68px;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    box-shadow: 0 16px 30px rgba(23, 36, 31, 0.08);
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
  color: #42534a;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 20px;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: #f0f5f1;
    color: #16704f;
  }

  @media (max-width: 768px) {
    padding: 14px 20px;
    border-radius: 10px;
    font-size: 16px;
    margin: 2px 12px;
  }
`;

const Button = styled.button`
  background: ${props => props.$primary ? '#16704f' : 'transparent'};
  color: ${props => props.$primary ? 'white' : '#16704f'};
  border: ${props => props.$primary ? 'none' : '1px solid #c8dacf'};
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background: ${props => props.$primary ? '#10583e' : '#f0f5f1'};
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 14px 20px;
    border-radius: 999px;
    font-size: 16px;
    text-align: center;
    margin: 6px 20px;
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
    border-top: 1px solid #e5e9e4;
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
    border-top: 1px solid #e5e9e4;
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
    background: rgba(19, 34, 27, 0.34);
    z-index: 98;
  }
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 12px;
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

        <RightGroup>
          <NavLinks $open={mobileOpen}>
            {renderLinks()}
          </NavLinks>

          <RightControls>
            {isAuthenticated && <NotificationsBell />}
            <Hamburger onClick={() => setMobileOpen(prev => !prev)}>
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </Hamburger>
          </RightControls>
        </RightGroup>
      </NavContainer>
      <MobileOverlay $open={mobileOpen} onClick={() => setMobileOpen(false)} />
    </Nav>
  );
};

export default Navbar;
