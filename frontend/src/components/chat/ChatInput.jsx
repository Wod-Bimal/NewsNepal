import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaPaperPlane } from 'react-icons/fa';

const InputContainer = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #E1E8ED;
  background: white;
`;

const Input = styled.input`
  flex: 1;
  border: 1px solid #E1E8ED;
  border-radius: 20px;
  padding: 10px 16px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
  &:focus { border-color: #1DA1F2; }
`;

const SendButton = styled.button`
  background: #1DA1F2;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #1991DB; }
  &:disabled { background: #AAB8C2; cursor: not-allowed; }
`;

const ChatInput = ({ onSend, onTyping, disabled }) => {
  const [text, setText] = useState('');
  const typingTimeout = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
    if (onTyping) onTyping(false);
  };

  const handleChange = (e) => {
    setText(e.target.value);
    if (onTyping) {
      onTyping(true);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => onTyping(false), 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, []);

  return (
    <InputContainer onSubmit={handleSubmit}>
      <Input
        value={text}
        onChange={handleChange}
        placeholder="Type a message..."
        maxLength={2000}
        disabled={disabled}
      />
      <SendButton type="submit" disabled={!text.trim() || disabled}>
        <FaPaperPlane size={16} />
      </SendButton>
    </InputContainer>
  );
};

export default ChatInput;
