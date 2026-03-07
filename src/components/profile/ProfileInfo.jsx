import { useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar';
import ChatIcon from '../../assets/icons/icon-message-circle.svg?react';
import ShareIcon from '../../assets/icons/icon-share.svg?react';
import styled from 'styled-components';

const ProfileSection = styled.div`
  padding: 24px 16px 16px;
`;

const UserInfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-bottom: 16px;
`;

const StatItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
`;

const StatNumber = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
`;

const StatLabel = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray400};
`;

const UserDetails = styled.div`
  text-align: center;
  margin-bottom: 16px;
`;

const Username = styled.h2`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 4px;
`;

const AccountId = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray400};
  margin-bottom: 8px;
`;

const Intro = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray500};
  line-height: 1.5;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
`;

const IconActionBtn = styled.button.attrs({ type: 'button' })`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.white};
  transition: background-color 0.2s;
  cursor: pointer;
  position: relative;
  z-index: 1;
  pointer-events: auto;

  svg {
    pointer-events: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray100};
  }
`;

const FollowButton = styled.button.attrs({ type: 'button' })`
  padding: 8px 28px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  transition: ${({ theme }) => theme.transitions.base};

  ${({ $following, theme }) =>
    $following
      ? `
      background-color: ${theme.colors.white};
      color: ${theme.colors.gray400};
      border: 1px solid ${theme.colors.gray200};
    `
      : `
      background-color: ${theme.colors.primary};
      color: ${theme.colors.white};
      border: 1px solid ${theme.colors.primary};
    `}
`;

const EditButton = styled.button.attrs({ type: 'button' })`
  padding: 8px 24px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.gray500};
  background: ${({ theme }) => theme.colors.white};
  transition: ${({ theme }) => theme.transitions.base};
  &:hover {
    background-color: ${({ theme }) => theme.colors.gray100};
  }
`;

const ProfileInfo = ({ profile, isMyProfile, following, handleFollow, handleChat, handleShare }) => {
  const navigate = useNavigate();

  return (
    <ProfileSection>
      <UserInfoRow>
        <StatItem onClick={() => navigate(`/profile/${profile.accountname}/follower`)}>
          <StatNumber>{profile.followerCount}</StatNumber>
          <StatLabel>followers</StatLabel>
        </StatItem>

        <Avatar src={profile.image} alt={profile.username} size="80px" border />

        <StatItem onClick={() => navigate(`/profile/${profile.accountname}/following`)}>
          <StatNumber>{profile.followingCount}</StatNumber>
          <StatLabel>followings</StatLabel>
        </StatItem>
      </UserInfoRow>

      <UserDetails>
        <Username>{profile.username}</Username>
        <AccountId>@ {profile.accountname}</AccountId>
        {profile.intro && <Intro>{profile.intro}</Intro>}
      </UserDetails>

      {isMyProfile ? (
        <ActionButtons>
          <EditButton onClick={() => navigate('/profile/edit')}>프로필 수정</EditButton>
          <EditButton onClick={() => navigate('/product/register')}>상품 등록</EditButton>
        </ActionButtons>
      ) : (
        <ActionButtons>
          <IconActionBtn onClick={handleChat}>
            <ChatIcon />
          </IconActionBtn>
          <FollowButton $following={following} onClick={handleFollow}>
            {following ? '언팔로우' : '팔로우'}
          </FollowButton>
          <IconActionBtn onClick={handleShare}>
            <ShareIcon />
          </IconActionBtn>
        </ActionButtons>
      )}
    </ProfileSection>
  );
};

export default ProfileInfo;
