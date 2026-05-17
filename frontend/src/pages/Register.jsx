import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import styled from 'styled-components';

const RegisterContainer = styled.div`
  max-width: 400px;
  margin: 40px auto;
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

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    bio: '',
    location: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
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

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    const result = await register(formData);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error?.error || 'Registration failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <RegisterContainer>
      <Title>Join NewsNepal</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="username">Username *</Label>
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
          <Label htmlFor="email">Email *</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="first_name">First Name</Label>
          <Input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password *</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="8"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password_confirm">Confirm Password *</Label>
          <Input
            type="password"
            id="password_confirm"
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="bio">Bio</Label>
          <Input
            type="text"
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="location">Location</Label>
          <Input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Your location in Nepal..."
          />
        </FormGroup>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </Form>

      <LinkText>
        Already have an account? <Link to="/login">Login</Link>
      </LinkText>
    </RegisterContainer>
  );
};

export default Register;