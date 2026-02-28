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
  transform: ${({ $swiped }) => ($swiped ? 'translateX(-80px)' : 'translateX(0)')};
  transition: transform 0.2s ease;
  touch-action: pan-y;
  position: relative;
  z-index: 1;

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray100};
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 80px;
  background-color: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  border: none;
  outline: none;
  transform: ${({ $swiped }) => ($swiped ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform 0.2s ease;
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

const ChatUsername = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.black};
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

const ChatList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [swipedChatId, setSwipedChatId] = useState(null);
  const [deletingChatId, setDeletingChatId] = useState(null);
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

  // 안읽은 메시지 여부: 마지막 발신자가 나이고, 내 readAt이 lastMessageAt보다 이전이면 unread
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
      didSwipe.current = true;
    } else if (dx > 20) {
      setSwipedChatId(null);
      didSwipe.current = true;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingChatId) return;
    await deleteChat(deletingChatId);
    setDeletingChatId(null);
    setSwipedChatId(null);
  };

  const modalItems = [{ label: '설정', onClick: () => {} }];

  const filteredChats = chats.filter((chat) => {
    if (!searchKeyword) return true;
    const other = getOtherParticipant(chat);
    return other.username?.toLowerCase().includes(searchKeyword.toLowerCase());
  });

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
            const isSwiped = swipedChatId === chat.id;
            return (
              <ChatItemContainer key={chat.id}>
                <DeleteButton
                  $swiped={isSwiped}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingChatId(chat.id);
                  }}
                >
                  삭제
                </DeleteButton>
                <ChatItemEl
                  $swiped={isSwiped}
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp(chat.id)}
                  onClick={() => {
                    if (didSwipe.current) {
                      didSwipe.current = false;
                      return;
                    }
                    if (isSwiped) {
                      setSwipedChatId(null);
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
                      <ChatUsername>{other.username}</ChatUsername>
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
        isOpen={!!deletingChatId}
        title="채팅방 삭제"
        description="채팅방을 삭제하면 대화 내용이 모두 사라집니다."
        confirmText="삭제"
        danger
        onCancel={() => setDeletingChatId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default ChatList;
