import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BottomTabNav from '../../components/common/BottomTabNav';
import BottomModal from '../../components/common/BottomModal';
import Header from '../../components/common/Header';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../context/AuthContext';
import { subscribeToChats, deleteChat } from '../../firebase/chat';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import AlertModal from '../../components/common/AlertModal';
import PinIcon from '../../assets/icons/icon-pin.svg?react';
import PinFilledIcon from '../../assets/icons/icon-pin-filled.svg?react';

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.white};
  padding-bottom: 70px;
`;

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
    $bg === 'error'
      ? theme.colors.error
      : $bg === 'primary'
      ? theme.colors.primary
      : theme.colors.gray400};
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

// Firestore Timestamp → "HH:MM" 또는 "M.D" 포맷
const formatChatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return `${date.getMonth() + 1}.${date.getDate()}`;
};

const alertConfig = {
  delete: {
    title: '채팅방 삭제',
    description: '채팅방을 삭제하면 대화 내용이 모두 사라집니다.',
    confirmText: '삭제',
  },
  block: {
    title: '사용자 차단',
    description: '차단하면 해당 사용자와의 채팅이 목록에서 숨겨집니다.',
    confirmText: '차단',
  },
  report: {
    title: '채팅 신고',
    description: '신고된 내용은 관리자가 검토합니다.',
    confirmText: '신고',
  },
};

const ChatList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [swipedChatId, setSwipedChatId] = useState(null);
  const [pinSwipedChatId, setPinSwipedChatId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // { type, chatId }
  const [pinnedChatIds, setPinnedChatIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pinnedChats')) || [];
    } catch {
      return [];
    }
  });
  const [blockedChatIds, setBlockedChatIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('blockedChats')) || [];
    } catch {
      return [];
    }
  });
  const touchStartX = useRef(null);
  const didSwipe = useRef(false);

  const [isSearching, setIsSearching] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    if (!user?.accountname) return;
    const unsubscribe = subscribeToChats(user.accountname, (data) => {
      setChats(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user?.accountname]);

  // 상대방 참여자 정보 추출
  const getOtherParticipant = (chat) => {
    const otherAccountname = chat.participants?.find((p) => p !== user.accountname);
    return chat.participantInfo?.[otherAccountname] || { username: otherAccountname, image: '' };
  };

  // 안읽은 메시지 여부
  const isUnread = (chat) => {
    if (!chat.lastMessage || chat.lastSenderId === user.accountname) return false;
    const myReadAt = chat.readAt?.[user.accountname];
    if (!myReadAt) return true;
    return (chat.lastMessageAt?.toMillis() || 0) > myReadAt.toMillis();
  };

  const handlePointerDown = (e) => {
    touchStartX.current = e.clientX;
    didSwipe.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (chatId) => (e) => {
    if (touchStartX.current === null) return;
    const dx = e.clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -50) {
      setSwipedChatId(chatId);
      setPinSwipedChatId(null);
      didSwipe.current = true;
    } else if (dx > 50) {
      setPinSwipedChatId(chatId);
      setSwipedChatId(null);
      didSwipe.current = true;
    } else if (Math.abs(dx) > 10) {
      setSwipedChatId(null);
      setPinSwipedChatId(null);
      didSwipe.current = true;
    }
  };

  const togglePin = (chatId) => {
    setPinnedChatIds((prev) => {
      const next = prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [...prev, chatId];
      localStorage.setItem('pinnedChats', JSON.stringify(next));
      return next;
    });
    setPinSwipedChatId(null);
  };

  const handleAlertConfirm = async () => {
    if (!pendingAction) return;
    const { type, chatId } = pendingAction;

    if (type === 'delete') {
      await deleteChat(chatId);
      setPinnedChatIds((prev) => {
        const next = prev.filter((id) => id !== chatId);
        localStorage.setItem('pinnedChats', JSON.stringify(next));
        return next;
      });
    } else if (type === 'block') {
      setBlockedChatIds((prev) => {
        const next = [...prev, chatId];
        localStorage.setItem('blockedChats', JSON.stringify(next));
        return next;
      });
    }
    // report: 로컬 처리만 (백엔드 사용자 신고 API 없음)

    setPendingAction(null);
    setSwipedChatId(null);
  };

  const displayChats = chats
    .filter((chat) => !blockedChatIds.includes(chat.id))
    .sort((a, b) => {
      const aPinned = pinnedChatIds.includes(a.id) ? 1 : 0;
      const bPinned = pinnedChatIds.includes(b.id) ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      return (b.lastMessageAt?.toMillis() || 0) - (a.lastMessageAt?.toMillis() || 0);
    });

  const modalItems = [{ label: '설정', onClick: () => {} }];

  const filteredChats = displayChats.filter((chat) => {
    if (!searchKeyword) return true;
    const other = getOtherParticipant(chat);
    return other.username?.toLowerCase().includes(searchKeyword.toLowerCase());
  });

  const renderHighlight = (text) => {
    if (!searchKeyword || !text) return text;
    const parts = text.split(new RegExp(`(${searchKeyword})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchKeyword.toLowerCase() ? <SearchKeyword key={i}>{part}</SearchKeyword> : part,
    );
  };

  return (
    <>
      <Wrapper>
        {isSearching ? (
          <Header
            type="search-input"
            keyword={searchKeyword}
            onKeywordChange={(e) => setSearchKeyword(e.target.value)}
            searchPlaceholder="사용자 이름 검색"
            alwaysVisible
            onBack={() => {
              setIsSearching(false);
              setSearchKeyword('');
            }}
          />
        ) : (
          <Header
            type="back-search-more"
            onSearch={() => setIsSearching(true)}
            onMore={() => setShowModal(true)}
            alwaysVisible
          />
        )}

        {isLoading ? (
          <Spinner padding="40vh 0" />
        ) : filteredChats.length === 0 ? (
          <EmptyState
            text={searchKeyword ? '검색 결과가 없습니다.' : '채팅 내역이 없습니다.'}
            padding="60px 0"
            fontSize="sm"
            color="gray300"
          />
        ) : (
          filteredChats.map((chat) => {
            const other = getOtherParticipant(chat);
            const isLeftSwiped = swipedChatId === chat.id;
            const isRightSwiped = pinSwipedChatId === chat.id;
            const isPinned = pinnedChatIds.includes(chat.id);
            return (
              <ChatItemContainer key={chat.id}>
                <PinButtonWrap $swiped={isRightSwiped}>
                  <PinButton
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(chat.id);
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
                      setPendingAction({ type: 'report', chatId: chat.id });
                    }}
                  >
                    신고
                  </ActionBtn>
                  <ActionBtn
                    $bg="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingAction({ type: 'block', chatId: chat.id });
                    }}
                  >
                    차단
                  </ActionBtn>
                  <ActionBtn
                    $bg="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingAction({ type: 'delete', chatId: chat.id });
                    }}
                  >
                    삭제
                  </ActionBtn>
                </RightActions>

                <ChatItemEl
                  $leftSwiped={isLeftSwiped}
                  $rightSwiped={isRightSwiped}
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp(chat.id)}
                  onClick={() => {
                    if (didSwipe.current) {
                      didSwipe.current = false;
                      return;
                    }
                    if (isLeftSwiped) {
                      setSwipedChatId(null);
                      return;
                    }
                    if (isRightSwiped) {
                      setPinSwipedChatId(null);
                      return;
                    }
                    navigate(`/chat/${chat.id}`);
                  }}
                >
                  <AvatarWrapper>
                    <Avatar src={other.image} alt={other.username} />
                    {isUnread(chat) && <UnreadDot />}
                  </AvatarWrapper>
                  <ChatInfo>
                    <ChatTop>
                      <ChatUsernameRow>
                        <ChatUsername>{renderHighlight(other.username)}</ChatUsername>
                        {isPinned && <PinIconInline />}
                      </ChatUsernameRow>
                      <ChatTime>{formatChatTime(chat.lastMessageAt)}</ChatTime>
                    </ChatTop>
                    <ChatLastMsg>{chat.lastMessage || '채팅을 시작해보세요.'}</ChatLastMsg>
                  </ChatInfo>
                </ChatItemEl>
              </ChatItemContainer>
            );
          })
        )}
      </Wrapper>

      <BottomTabNav />

      <BottomModal isOpen={showModal} onClose={() => setShowModal(false)} items={modalItems} />

      <AlertModal
        isOpen={!!pendingAction}
        title={alertConfig[pendingAction?.type]?.title}
        description={alertConfig[pendingAction?.type]?.description}
        confirmText={alertConfig[pendingAction?.type]?.confirmText}
        danger
        onCancel={() => setPendingAction(null)}
        onConfirm={handleAlertConfirm}
      />
    </>
  );
};

export default ChatList;
