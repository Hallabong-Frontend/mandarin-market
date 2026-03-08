import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BottomTabNav from '../../components/common/BottomTabNav';
import BottomModal from '../../components/common/BottomModal';
import Header from '../../components/common/Header';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../context/AuthContext';
import { subscribeToChats, leaveChat } from '../../firebase/chat';
import EmptyState from '../../components/common/EmptyState';
import AlertModal from '../../components/common/AlertModal';
import GroupChatModal from '../../components/chat/GroupChatModal';
import ChatListItem from '../../components/chat/ChatListItem';
import useChatSwipe from '../../hooks/useChatSwipe';

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.white};
  padding-bottom: 70px;
`;

const alertConfig = {
  delete: {
    title: '채팅방 나가기',
    description: '나간 후에는 채팅 목록에서 숨겨집니다.',
    confirmText: '나가기',
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

/**
 * 채팅 목록 페이지. 실시간 구독·고정·차단·검색·그룹채팅 생성을 지원한다.
 *
 * @returns {JSX.Element}
 */
const ChatList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGroupChatModal, setShowGroupChatModal] = useState(false);
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
  const [isSearching, setIsSearching] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const { swipedChatId, setSwipedChatId, pinSwipedChatId, setPinSwipedChatId, didSwipe, handlePointerDown, handlePointerUp } =
    useChatSwipe();

  useEffect(() => {
    if (!user?.accountname) return;
    const unsubscribe = subscribeToChats(user.accountname, (data) => {
      setChats(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user?.accountname]);

  /**
   * 채팅에서 상대방 정보를 반환한다. 닉네임이 있으면 username을 대체한다.
   *
   * @param {Object} chat - 채팅 객체
   * @returns {{ username: string, image: string, accountname: string }}
   */
  const getOtherParticipant = (chat) => {
    const otherAccountname = chat.participants?.find((p) => p !== user.accountname);
    const info = chat.participantInfo?.[otherAccountname] || { username: otherAccountname, image: '' };
    const nickname = chat.nicknames?.[user.accountname]?.[otherAccountname];
    return { ...info, username: nickname || info.username };
  };

  /**
   * 해당 채팅에 읽지 않은 메시지가 있는지 확인한다.
   *
   * @param {Object} chat - 채팅 객체
   * @returns {boolean}
   */
  const isUnread = (chat) => {
    if (!chat.lastMessage || chat.lastSenderId === user.accountname) return false;
    const myReadAt = chat.readAt?.[user.accountname];
    if (!myReadAt) return true;
    return (chat.lastMessageAt?.toMillis() || 0) > myReadAt.toMillis();
  };

  /**
   * 채팅 고정을 토글하고 localStorage에 저장한다.
   *
   * @param {string} chatId - 고정할 채팅 ID
   */
  const togglePin = (chatId) => {
    setPinnedChatIds((prev) => {
      const next = prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [...prev, chatId];
      localStorage.setItem('pinnedChats', JSON.stringify(next));
      return next;
    });
    setPinSwipedChatId(null);
  };

  /**
   * 나가기/차단 알림 확인 시 해당 액션을 실행한다.
   *
   * @returns {Promise<void>}
   */
  const handleAlertConfirm = async () => {
    if (!pendingAction) return;
    const { type, chatId } = pendingAction;

    if (type === 'delete') {
      const chat = chats.find((c) => c.id === chatId);
      await leaveChat(chatId, user.accountname, chat?.isGroupChat);
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

  const filteredChats = displayChats.filter((chat) => {
    if (!searchKeyword) return true;
    const isGroup = chat.isGroupChat;
    const title = isGroup ? chat.groupTitle : getOtherParticipant(chat).username;
    return title?.toLowerCase().includes(searchKeyword.toLowerCase());
  });

  const modalItems = [
    {
      label: '그룹채팅 만들기',
      onClick: () => {
        setShowModal(false);
        setShowGroupChatModal(true);
      },
    },
  ];

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
            const isGroup = chat.isGroupChat;
            const other = getOtherParticipant(chat);
            const chatTitle = isGroup ? chat.groupTitle : other.username;
            const chatImage = isGroup ? chat.groupImage : other.image;

            const isLeftSwiped = swipedChatId === chat.id;
            const isRightSwiped = pinSwipedChatId === chat.id;
            const isPinned = pinnedChatIds.includes(chat.id);

            return (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isLeftSwiped={isLeftSwiped}
                isRightSwiped={isRightSwiped}
                isPinned={isPinned}
                isUnread={isUnread(chat)}
                chatTitle={chatTitle}
                chatImage={chatImage}
                searchKeyword={searchKeyword}
                onPinToggle={togglePin}
                onAction={(type, chatId) => setPendingAction({ type, chatId })}
                onNavigate={() => {
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
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp(chat.id)}
              />
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
      <GroupChatModal isOpen={showGroupChatModal} onClose={() => setShowGroupChatModal(false)} />
    </>
  );
};

export default ChatList;
