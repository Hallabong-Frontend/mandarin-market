import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.gray300};

  svg path, svg circle, svg rect {
    stroke: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.gray300};
  }
`;

const NavLabel = styled.span`
  font-size: 10px;
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
`;

const PostButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  height: 100%;
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.gray300};

  svg path {
    fill: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.gray300};
    stroke: none;
  }
`;

const HomeIcon = () => <HomeIconSvg width="24" height="24" />;
const ChatIcon = () => <ChatIconSvg width="24" height="24" />;
const PostIcon = () => <PostIconSvg width="24" height="24" />;
const ProfileIcon = () => <ProfileIconSvg width="24" height="24" />;

const BottomTabNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const tabs = [
    { label: '홈', path: '/feed', icon: HomeIcon },
    { label: '채팅', path: '/chat', icon: ChatIcon },
    { label: '게시글', path: '/post/create', icon: PostIcon, isPost: true },
    { label: '프로필', path: `/profile/${user?.accountname}`, icon: ProfileIcon },
  ];

  const isActive = (path) => {
    if (path === '/feed') return location.pathname === '/feed' || location.pathname === '/';
    if (path.startsWith('/profile/')) return location.pathname.startsWith('/profile/');
    return location.pathname === path;
  };

  return (
    <NavWrapper>
      {tabs.map((tab) => {
        const active = isActive(tab.path);
        const Icon = tab.icon;
        return (
          <NavItem key={tab.label} $active={active} onClick={() => navigate(tab.path)}>
            <Icon active={active} />
            <NavLabel>{tab.label}</NavLabel>
          </NavItem>
        );
      })}
    </NavWrapper>
  );
};

export default BottomTabNav;
