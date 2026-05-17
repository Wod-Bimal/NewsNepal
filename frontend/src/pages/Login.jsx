import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import styled from 'styled-components';

const LoginContainer = styled.div`
  max-width: 400px;
  margin: 60px auto;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #E1E8ED;
`;

const Title = styled.h1`
  text-align: center;
  color: #14171A;
  margin-bottom: 30px;
  font-size: 28px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #14171A;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #1DA1F2;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #1DA1F2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 20px;

  &:hover {
    background: #1991DB;
  }

  &:disabled {
    background: #AAB8C2;
    cursor: not-allowed;
  }
`;

const LinkText = styled.p`
  text-align: center;
  color: #657786;

  a {
    color: #1DA1F2;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  background: #FDF2F8;
  color: #E0245E;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #FCE7F3;
`;

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error?.error || 'Login failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <LoginContainer>
      <Title>Welcome to NewsNepal</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="username">Username</Label>
          <Input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </Form>

      <LinkText>
        Don't have an account? <Link to="/register">Sign up</Link>
      </LinkText>
    </LoginContainer>
  );
};

export default Login;