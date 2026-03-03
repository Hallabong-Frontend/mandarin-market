import styled from 'styled-components';
import Avatar from '../common/Avatar';
import PinIcon from '../../assets/icons/icon-pin.svg?react';
import PinFilledIcon from '../../assets/icons/icon-pin-filled.svg?react';
import { formatChatTime } from '../../utils/chatFormat';

const ChatItemContainer = styled.div`
  position: relative;
  overflow: hidden;
`;

const ChatItemEl = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.white};
  transform: ${({ $leftSwiped, $rightSwiped }) =>
    $leftSwiped ? 'translateX(-216px)' : $rightSwiped ? 'translateX(72px)' : 'translateX(0)'};
  transition: transform 0.2s ease;
  touch-action: pan-y;
  position: relative;
  z-index: 1;

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray100};
  }
`;

const RightActions = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 216px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  overflow: hidden;
  transform: ${({ $swiped }) => ($swiped ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform 0.2s ease;
`;

const ActionBtn = styled.button`
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  background-color: ${({ $bg, theme }) =>
    $bg === 'error' ? theme.colors.error : $bg === 'primary' ? theme.colors.primary : theme.colors.gray400};
  cursor: pointer;
`;

const PinButtonWrap = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${({ $swiped }) => ($swiped ? 'translateX(0)' : 'translateX(-100%)')};
  transition: transform 0.2s ease;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const PinButton = styled.button`
  background: none;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const GroupAvatarWrap = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.gray200};
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 5px;
  align-items: center;
  align-content: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
`;

const ExtraCountBadge = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.gray400};
  color: white;
  font-size: 8px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const UnreadDot = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 12px;
  height: 12px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.white};
`;

const ChatInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

const ChatTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const ChatUsernameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ChatUsername = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.black};
`;

const MemberCountText = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.gray500};
  line-height: 1;
  transform: translateY(1px);
`;

const PinIconInline = styled(PinFilledIcon)`
  width: 12px;
  height: 12px;
  color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;

const ChatTime = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray300};
`;

const ChatLastMsg = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray400};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const SearchKeyword = styled.span`
  color: ${({ theme }) => theme.colors.primary};
`;

const renderHighlight = (text, searchKeyword) => {
  if (!searchKeyword || !text) return text;
  const parts = text.split(new RegExp(`(${searchKeyword})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === searchKeyword.toLowerCase() ? <SearchKeyword key={i}>{part}</SearchKeyword> : part,
  );
};

const ChatListItem = ({
  chat,
  isLeftSwiped,
  isRightSwiped,
  isPinned,
  isUnread,
  chatTitle,
  chatImage,
  searchKeyword,
  onPinToggle,
  onAction,
  onNavigate,
  onPointerDown,
  onPointerUp,
}) => {
  return (
    <ChatItemContainer>
      <PinButtonWrap $swiped={isRightSwiped}>
        <PinButton
          onClick={(e) => {
            e.stopPropagation();
            onPinToggle(chat.id);
          }}
        >
          {isPinned ? <PinFilledIcon /> : <PinIcon />}
        </PinButton>
      </PinButtonWrap>

      <RightActions $swiped={isLeftSwiped}>
        <ActionBtn
          $bg="gray"
          onClick={(e) => {
            e.stopPropagation();
            onAction('report', chat.id);
          }}
        >
          신고
        </ActionBtn>
        <ActionBtn
          $bg="primary"
          onClick={(e) => {
            e.stopPropagation();
            onAction('block', chat.id);
          }}
        >
          차단
        </ActionBtn>
        <ActionBtn
          $bg="error"
          onClick={(e) => {
            e.stopPropagation();
            onAction('delete', chat.id);
          }}
        >
          삭제
        </ActionBtn>
      </RightActions>

      <ChatItemEl
        $leftSwiped={isLeftSwiped}
        $rightSwiped={isRightSwiped}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onClick={onNavigate}
      >
        <AvatarWrapper>
          {chat.isGroupChat ? (
            <GroupAvatarWrap>
              {(() => {
                const MAX = 4;
                const participants = chat.participants || [];
                const participantInfo = chat.participantInfo || {};
                const total = participants.length;
                const showItems = total <= MAX ? participants : participants.slice(0, MAX - 1);
                const extraCount = total > MAX ? total - (MAX - 1) : 0;
                return (
                  <>
                    {showItems.map((accountname) => (
                      <Avatar key={accountname} src={participantInfo[accountname]?.image} size="18px" />
                    ))}
                    {extraCount > 0 && <ExtraCountBadge>+{extraCount}</ExtraCountBadge>}
                  </>
                );
              })()}
            </GroupAvatarWrap>
          ) : (
            <Avatar src={chatImage} alt={chatTitle} />
          )}
          {isUnread && <UnreadDot />}
        </AvatarWrapper>
        <ChatInfo>
          <ChatTop>
            <ChatUsernameRow>
              <ChatUsername>{renderHighlight(chatTitle, searchKeyword)}</ChatUsername>
              {chat.isGroupChat && <MemberCountText>{chat.participants?.length || 0}</MemberCountText>}
              {isPinned && <PinIconInline />}
            </ChatUsernameRow>
            <ChatTime>{formatChatTime(chat.lastMessageAt)}</ChatTime>
          </ChatTop>
          <ChatLastMsg>{chat.lastMessage || '채팅을 시작해보세요.'}</ChatLastMsg>
        </ChatInfo>
      </ChatItemEl>
    </ChatItemContainer>
  );
};

export default ChatListItem;
