import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { userService } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';

const Overlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); display: flex; align-items: center;
  justify-content: center; z-index: 1000;
`;

const Modal = styled.div`
  background: white; border-radius: 16px; width: 90%; max-width: 420px;
  max-height: 70vh; overflow: hidden; display: flex; flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex; border-bottom: 1px solid #E1E8ED;
`;

const ModalTab = styled.button`
  flex: 1; padding: 14px; background: none; border: none;
  border-bottom: 3px solid ${p => p.$active ? '#14171A' : 'transparent'};
  color: ${p => p.$active ? '#14171A' : '#657786'};
  font-weight: ${p => p.$active ? '700' : '500'}; font-size: 14px;
  cursor: pointer; transition: all 0.2s;
`;

const CloseButton = styled.button`
  position: absolute; top: 12px; right: 12px;
  background: none; border: none; cursor: pointer; color: #657786;
  font-size: 18px; padding: 4px; z-index: 1;
  &:hover { color: #14171A; }
`;

const List = styled.div`
  overflow-y: auto; flex: 1;
`;

const UserRow = styled.div`
  display: flex; align-items: center; padding: 10px 16px;
  transition: background 0.15s;
  &:hover { background: #F7F9FA; }
`;

const Avatar = styled.img`
  width: 40px; height: 40px; border-radius: 50%; object-fit: cover;
  margin-right: 12px; cursor: pointer; flex-shrink: 0;
`;

const AvatarPlaceholder = styled.div`
  width: 40px; height: 40px; border-radius: 50%; background: #E1E8ED;
  display: flex; align-items: center; justify-content: center;
  margin-right: 12px; color: #657786; font-weight: 700; font-size: 16px;
  cursor: pointer; flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1; min-width: 0; cursor: pointer;
`;

const Username = styled.div`
  font-weight: 600; font-size: 14px; color: #14171A;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;

const FullName = styled.div`
  font-size: 12px; color: #657786;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;

const FollowBtn = styled.button`
  padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 13px;
  cursor: pointer; flex-shrink: 0; border: 1px solid
  ${p => p.$isFollowing ? '#E1E8ED' : p.$followBack ? '#059669' : '#1DA1F2'};
  background: ${p => p.$isFollowing ? 'transparent' : p.$followBack ? '#059669' : '#1DA1F2'};
  color: ${p => (p.$isFollowing || p.$followBack) ? (p.$followBack && !p.$isFollowing ? 'white' : '#14171A') : 'white'};
  transition: all 0.2s;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Empty = styled.div`
  padding: 40px 20px; text-align: center; color: #657786; font-size: 14px;
`;

const LoadingText = styled.div`
  padding: 40px 20px; text-align: center; color: #657786; font-size: 14px;
`;

const FollowListModal = ({ userId, initialTab = 'followers', onClose, onUpdate }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { showError } = useNotification();
  const [tab, setTab] = useState(initialTab);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchFollowers = useCallback(async () => {
    try {
      const res = await userService.getFollowers(userId);
      setFollowers(res.data || []);
    } catch { /* ignore */ }
  }, [userId]);

  const fetchFollowing = useCallback(async () => {
    try {
      const res = await userService.getFollowing(userId);
      setFollowing(res.data || []);
    } catch { /* ignore */ }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchFollowers(), fetchFollowing()]).then(() => setLoading(false));
  }, [fetchFollowers, fetchFollowing]);

  const handleFollowToggle = async (targetId, isCurrentlyFollowing) => {
    setActionLoading(targetId);
    try {
      if (isCurrentlyFollowing) {
        await userService.unfollow(targetId);
      } else {
        await userService.follow(targetId);
      }
      await Promise.all([fetchFollowers(), fetchFollowing()]);
      if (onUpdate) onUpdate();
    } catch {
      showError('Action failed');
    }
    setActionLoading(null);
  };

  const goToProfile = (uid) => {
    onClose();
    navigate(`/users/${uid}`);
  };

  const users = tab === 'followers' ? followers : following;
  const isOwn = currentUser?.id === parseInt(userId);

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <div style={{ position: 'relative' }}>
          <CloseButton onClick={onClose}><FaTimes /></CloseButton>
          <ModalHeader>
            <ModalTab $active={tab === 'followers'} onClick={() => setTab('followers')}>
              Followers ({followers.length})
            </ModalTab>
            <ModalTab $active={tab === 'following'} onClick={() => setTab('following')}>
              Following ({following.length})
            </ModalTab>
          </ModalHeader>
        </div>

        <List>
          {loading ? (
            <LoadingText>Loading...</LoadingText>
          ) : users.length === 0 ? (
            <Empty>
              {tab === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
            </Empty>
          ) : (
            users.map(u => (
              <UserRow key={u.id}>
                {u.profile_picture ? (
                  <Avatar src={u.profile_picture} alt="" onClick={() => goToProfile(u.id)} />
                ) : (
                  <AvatarPlaceholder onClick={() => goToProfile(u.id)}>
                    {u.username[0].toUpperCase()}
                  </AvatarPlaceholder>
                )}
                <UserInfo onClick={() => goToProfile(u.id)}>
                  <Username>{u.username}</Username>
                  {(u.first_name || u.last_name) && (
                    <FullName>{u.first_name} {u.last_name}</FullName>
                  )}
                </UserInfo>
                {currentUser?.id !== u.id && (
                  <FollowBtn
                    $isFollowing={u.is_following}
                    $followBack={tab === 'followers' && u.is_followed_by && !u.is_following}
                    onClick={() => handleFollowToggle(u.id, u.is_following)}
                    disabled={actionLoading === u.id}
                  >
                    {u.is_following ? 'Following' : tab === 'followers' && u.is_followed_by ? 'Follow Back' : 'Follow'}
                  </FollowBtn>
                )}
              </UserRow>
            ))
          )}
        </List>
      </Modal>
    </Overlay>
  );
};

export default FollowListModal;
