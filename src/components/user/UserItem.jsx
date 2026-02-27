import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { followUser, unfollowUser } from '../../api/user';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
`;

const Info = styled.div`
  flex: 1;
  cursor: pointer;
`;

const Username = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.black};
`;

const AccountId = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray400};
  margin-top: 2px;
`;

const Intro = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray400};
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
`;

const FollowButton = styled.button`
  padding: 6px 16px;
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

const SearchKeyword = styled.span`
  color: ${({ theme }) => theme.colors.primary};
`;

const UserItem = ({ userData, keyword = '' }) => {
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const [following, setFollowing] = useState(userData.isfollow);

  const isMe = me?.accountname === userData.accountname;

  const handleFollow = async (e) => {
    e.stopPropagation();
    try {
      if (following) {
        await unfollowUser(userData.accountname);
        setFollowing(false);
      } else {
        await followUser(userData.accountname);
        setFollowing(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoProfile = () => {
    navigate(`/profile/${userData.accountname}`);
  };

  // 검색 키워드 하이라이트
  const renderHighlight = (text) => {
    if (!keyword || !text) return text;
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() ? <SearchKeyword key={i}>{part}</SearchKeyword> : part,
    );
  };

  return (
    <Item>
      <Avatar src={userData.image} alt={userData.username} size="50px" onClick={handleGoProfile} />
      <Info onClick={handleGoProfile}>
        <Username>{renderHighlight(userData.username)}</Username>
        <AccountId>@{renderHighlight(userData.accountname)}</AccountId>
        {userData.intro && <Intro>{userData.intro}</Intro>}
      </Info>
      {!isMe && (
        <FollowButton $following={following} onClick={handleFollow}>
          {following ? '취소' : '팔로우'}
        </FollowButton>
      )}
    </Item>
  );
};

export default UserItem;
