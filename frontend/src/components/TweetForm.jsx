import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { newsService, topicService } from '../services/api.js';
import styled from 'styled-components';
import { FaImage, FaTimes } from 'react-icons/fa';

const FormContainer = styled.div`
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
`;

const FormTitle = styled.h3`
  color: #14171A;
  font-size: 18px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const TextArea = styled.textarea`
  width: 100%;
  border: none;
  outline: none;
  font-size: 18px;
  line-height: 1.5;
  resize: none;
  min-height: 100px;
  font-family: inherit;
  margin-bottom: 16px;

  &::placeholder {
    color: #657786;
  }
`;

const ImagePreview = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-width: 300px;
  border-radius: 8px;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FileInput = styled.input`
  display: none;
`;

const FileButton = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1DA1F2;
  cursor: pointer;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 20px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #F7F9FA;
  }
`;

const SubmitButton = styled.button`
  background: #1DA1F2;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background: #1991DB;
  }

  &:disabled {
    background: #AAB8C2;
    cursor: not-allowed;
  }
`;

const TopicSelect = styled.select`
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 16px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: #1DA1F2;
  }
`;

const TweetForm = ({ onTweetCreated }) => {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topics, setTopics] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await topicService.getTopics();
      setTopics(response.data);
    } catch {
      // Topics dropdown is optional; fail silently
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await newsService.createNews({
        content,
        image,
        topic: selectedTopic || undefined,
      });
      
      setContent('');
      setImage(null);
      setImagePreview(null);
      setSelectedTopic('');
      
      if (onTweetCreated) {
        onTweetCreated();
      }
    } catch {
      // News creation failed; form state is preserved for retry
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <FormContainer>
      <FormHeader>
        <Avatar 
          src={user?.profile_picture || '/default-avatar.png'} 
          alt={user?.username}
        />
        <FormTitle>Share a news update</FormTitle>
      </FormHeader>

      <Form onSubmit={handleSubmit}>
        <TopicSelect 
          value={selectedTopic} 
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          <option value="">Select a topic (optional)</option>
          {topics.map(topic => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))}
        </TopicSelect>

        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share news about Nepal..."
          maxLength={500}
        />

        {imagePreview && (
          <ImagePreview>
            <PreviewImage src={imagePreview} alt="Preview" />
            <RemoveImageButton onClick={removeImage}>
              <FaTimes />
            </RemoveImageButton>
          </ImagePreview>
        )}

        <FormActions>
          <div>
            <FileInput
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
            />
            <FileButton htmlFor="image-upload">
              <FaImage />
              {image ? 'Change Image' : 'Add Image'}
            </FileButton>
          </div>

          <SubmitButton 
            type="submit" 
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post News'}
          </SubmitButton>
        </FormActions>
      </Form>
    </FormContainer>
  );
};

export default TweetForm;