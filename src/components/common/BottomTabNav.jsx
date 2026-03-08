import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscribeToChats } from '../../firebase/chat';
import HomeIconSvg from '../../assets/icons/icon-home.svg?react';
import ChatIconSvg from '../../assets/icons/icon-message-circle-bold.svg?react';
import PostIconSvg from '../../assets/icons/icon-edit.svg?react';
import ProfileIconSvg from '../../assets/icons/icon-user.svg?react';

const NavWrapper = styled.nav`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 390px;
  height: 60px;
  background-color: ${({ theme }) => theme.colors.white};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: ${({ theme }) => theme.zIndex.tabNav};
`;

const NavItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  height: 100%;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.gray300)};

  svg path,
  svg circle,
  svg rect {
    stroke: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.gray300)};
  }
`;

const NavLabel = styled.span`
  font-size: 10px;
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
`;

const IconWrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

const UnreadDot = styled.div`
  position: absolute;
  top: 0;
  right: -2px;
  width: 10px;
  height: 10px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  border: 1.5px solid ${({ theme }) => theme.colors.white};
`;

const HomeIcon = () => <HomeIconSvg width="24" height="24" />;
const ChatIcon = ({ hasUnread }) => (
  <IconWrapper>
    <ChatIconSvg width="24" height="24" />
    {hasUnread && <UnreadDot />}
  </IconWrapper>
);
const PostIcon = () => <PostIconSvg width="24" height="24" />;
const ProfileIcon = () => <ProfileIconSvg width="24" height="24" />;

/**
 * 하단 고정 탭 네비게이션. 현재 경로에 따라 활성 탭을 강조하고, 읽지 않은 채팅이 있으면 점을 표시한다.
 *
 * @returns {JSX.Element}
 */
const BottomTabNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!user?.accountname) return;
    const unsubscribe = subscribeToChats(user.accountname, (chats) => {
      const unread = chats.some((chat) => {
        if (!chat.lastMessage || chat.lastSenderId === user.accountname) return false;
        const myReadAt = chat.readAt?.[user.accountname];
        if (!myReadAt) return true;
        return (chat.lastMessageAt?.toMillis() || 0) > myReadAt.toMillis();
      });
      setHasUnread(unread);
    });
    return () => unsubscribe();
  }, [user?.accountname]);

  /**
   * 현재 경로가 해당 탭과 일치하는지 확인한다.
   *
   * @param {string} path - 탭 경로
   * @returns {boolean}
   */
  const isActive = (path) => {
    if (path === '/feed') return location.pathname === '/feed' || location.pathname === '/';
    if (path.startsWith('/profile/')) return location.pathname.startsWith('/profile/');
    return location.pathname === path;
  };

  return (
    <NavWrapper>
      <NavItem $active={isActive('/feed')} onClick={() => navigate('/feed')}>
        <HomeIcon />
        <NavLabel>홈</NavLabel>
      </NavItem>
      <NavItem $active={isActive('/chat')} onClick={() => navigate('/chat')}>
        <ChatIcon hasUnread={hasUnread} />
        <NavLabel>채팅</NavLabel>
      </NavItem>
      <NavItem $active={isActive('/post/create')} onClick={() => navigate('/post/create')}>
        <PostIcon />
        <NavLabel>게시글</NavLabel>
      </NavItem>
      <NavItem
        $active={isActive(`/profile/${user?.accountname}`)}
        onClick={() => navigate(`/profile/${user?.accountname}`)}
      >
        <ProfileIcon />
        <NavLabel>프로필</NavLabel>
      </NavItem>
    </NavWrapper>
  );
};

export default BottomTabNav;
