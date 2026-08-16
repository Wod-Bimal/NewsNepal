import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaSearch, FaUserPlus, FaUsers } from 'react-icons/fa';
import { conversationService } from '../../services/api.js';
import { useNotification } from '../../contexts/NotificationContext.jsx';

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 440px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #E1E8ED;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #14171A;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #657786;
  font-size: 18px;
  padding: 4px;
  &:hover { color: #14171A; }
`;

const SearchContainer = styled.div`
  padding: 12px 20px;
  border-bottom: 1px solid #E1E8ED;
`;

const SearchInput = styled.input`
  width: 100%;
  border: 1px solid #E1E8ED;
  border-radius: 20px;
  padding: 10px 16px 10px 36px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
  &:focus { border-color: #1DA1F2; }
`;

const SearchWrapper = styled.div`
  position: relative;
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #657786;
`;

const GroupToggle = styled.div`
  padding: 8px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #F7F9FA;
`;

const ToggleLabel = styled.label`
  font-size: 13px;
  color: #657786;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const UserList = styled.div`
  overflow-y: auto;
  flex: 1;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  transition: background 0.2s;
  background: ${props => props.$selected ? '#F0F8FF' : 'transparent'};
  &:hover { background: #F7F9FA; }
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
`;

const AvatarPlaceholder = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #E1E8ED;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #657786;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #14171A;
`;

const FullName = styled.div`
  font-size: 12px;
  color: #657786;
`;

const Check = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${props => props.$checked ? '#1DA1F2' : '#E1E8ED'};
  background: ${props => props.$checked ? '#1DA1F2' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
`;

const Footer = styled.div`
  padding: 12px 20px;
  border-top: 1px solid #E1E8ED;
`;

const StartButton = styled.button`
  width: 100%;
  background: #1DA1F2;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #1991DB; }
  &:disabled { background: #AAB8C2; cursor: not-allowed; }
`;

const Empty = styled.div`
  padding: 30px;
  text-align: center;
  color: #657786;
  font-size: 14px;
`;

const NewConversationModal = ({ onClose, onCreated }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const { showError } = useNotification();

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.length < 2) {
      setUsers([]);
      return;
    }
    setSearching(true);
    try {
      const res = await conversationService.searchUsers(q);
      setUsers(res.data);
    } catch {
      setUsers([]);
    }
    setSearching(false);
  };

  const toggleUser = (userId) => {
    setSelected(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (selected.length === 0) return;
    setCreating(true);
    try {
      const data = {
        participant_ids: selected,
        is_group: isGroup,
        title: isGroup ? groupName : '',
      };
      const res = await conversationService.createConversation(data);
      onCreated(res.data);
      onClose();
    } catch {
      showError('Failed to create conversation');
    }
    setCreating(false);
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>New Conversation</ModalTitle>
          <CloseButton onClick={onClose}><FaTimes /></CloseButton>
        </ModalHeader>

        <SearchContainer>
          <SearchWrapper>
            <SearchIcon />
            <SearchInput
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search users..."
              autoFocus
            />
          </SearchWrapper>
        </SearchContainer>

        <GroupToggle>
          <ToggleLabel>
            <input
              type="checkbox"
              checked={isGroup}
              onChange={e => setIsGroup(e.target.checked)}
            />
            <FaUsers /> Group chat
          </ToggleLabel>
          {isGroup && (
            <input
              type="text"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="Group name"
              style={{ flex: 1, padding: '6px 10px', border: '1px solid #E1E8ED', borderRadius: 8, fontSize: 13 }}
            />
          )}
        </GroupToggle>

        <UserList>
          {query.length < 2 ? (
            <Empty>Search for users to start chatting</Empty>
          ) : searching ? (
            <Empty>Searching...</Empty>
          ) : users.length === 0 ? (
            <Empty>No users found</Empty>
          ) : (
            users.map(u => (
              <UserItem
                key={u.id}
                $selected={selected.includes(u.id)}
                onClick={() => toggleUser(u.id)}
              >
                {u.profile_picture ? (
                  <Avatar src={u.profile_picture} alt="" />
                ) : (
                  <AvatarPlaceholder><FaUserPlus size={14} /></AvatarPlaceholder>
                )}
                <UserInfo>
                  <Username>{u.username}</Username>
                  <FullName>{u.first_name} {u.last_name}</FullName>
                </UserInfo>
                <Check $checked={selected.includes(u.id)}>
                  {selected.includes(u.id) && '✓'}
                </Check>
              </UserItem>
            ))
          )}
        </UserList>

        {selected.length > 0 && (
          <Footer>
            <StartButton onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating...' : `Start Conversation (${selected.length})`}
            </StartButton>
          </Footer>
        )}
      </Modal>
    </Overlay>
  );
};

export default NewConversationModal;
