import { useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar';
import ChatIcon from '../../assets/icons/icon-message-circle.svg?react';
import ShareIcon from '../../assets/icons/icon-share.svg?react';
import {
  ProfileSection,
  UserInfoRow,
  StatItem,
  StatNumber,
  StatLabel,
  UserDetails,
  Username,
  AccountId,
  Intro,
  ActionButtons,
  IconActionBtn,
  FollowButton,
  EditButton,
} from '../../pages/Profile/Profile';

const ProfileInfo = ({ profile, isMyProfile, following, handleFollow, handleChat }) => {
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
          <IconActionBtn>
            <ShareIcon />
          </IconActionBtn>
        </ActionButtons>
      )}
    </ProfileSection>
  );
};

export default ProfileInfo;
