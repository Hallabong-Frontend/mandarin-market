import { useState } from 'react';
import NotificationPanel from '../NotificationPanel';
import { HeaderWrapper, HeaderSpacer, LogoText, RightButton, RightButtons, HeartIcon, SearchIcon } from './styles';
import { useScrollHide } from './useScrollHide';

const FeedHeader = ({ logo, onSearch }) => {
  const hidden = useScrollHide();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <HeaderWrapper $hidden={hidden}>
        <LogoText>{logo}</LogoText>
        <RightButtons>
          <RightButton onClick={() => setShowNotifications(true)} aria-label="알림">
            <HeartIcon />
          </RightButton>
          <RightButton onClick={onSearch} aria-label="검색">
            <SearchIcon />
          </RightButton>
        </RightButtons>
      </HeaderWrapper>
      <HeaderSpacer />
      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
};

export default FeedHeader;
