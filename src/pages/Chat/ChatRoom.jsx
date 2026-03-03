import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import styled from 'styled-components';
import AlertModal from '../../components/common/AlertModal';
import BottomModal from '../../components/common/BottomModal';
import Header from '../../components/common/Header';
import ArrowLeftIconSvg from '../../assets/icons/icon-arrow-left.svg?react';
import heartFillSrc from '../../assets/emoji/icon_heart_fill.svg';
import thumbsUpSrc from '../../assets/emoji/icon_thumbs_up_fill.png';
import starSrc from '../../assets/emoji/icon_star.png';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import {
  subscribeToMessages,
  toggleReaction,
  markAsRead,
  editMessage,
  deleteMessage,
  leaveChat,
  saveChatTheme,
  setNickname,
  updateChatTitle,
} from '../../firebase/chat';
import NicknameModal from '../../components/chat/NicknameModal';
import { uploadImage } from '../../api/auth';
import { getImageUrl } from '../../utils/format';
import ChatThemePanel, { BG_COLORS, BUBBLE_COLORS } from './ChatThemePanel';
import InviteUserModal from '../../components/chat/InviteUserModal';
import GroupMembersPanel from '../../components/chat/GroupMembersPanel';
import ChatMessageItem from '../../components/chat/ChatMessageItem';
import ChatInputBar from '../../components/chat/ChatInputBar';
import ChatContextMenu from '../../components/chat/ChatContextMenu';

const REACTION_SRC_MAP = {
  heart: heartFillSrc,
  thumbs_up: thumbsUpSrc,
  star: starSrc,
};

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ $bgColor, $bgImage }) => ($bgImage ? 'transparent' : $bgColor || '#F2F2F2')};
  background-image: ${({ $bgImage }) => ($bgImage ? `url(${$bgImage})` : 'none')};
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  padding-bottom: 56px;
`;

const MessageList = styled.div`
  flex: 1;
  padding: 16px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ScrollDownButtonArea = styled.div`
  position: fixed;
  bottom: 72px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 390px;
  padding: 0 16px;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
  z-index: ${({ theme }) => theme.zIndex.header};
`;

const ScrollDownButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray500};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
  pointer-events: auto;
`;

const NewMessageAlert = styled.button`
  position: fixed;
  bottom: 72px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 6px 20px rgba(242, 110, 34, 0.3);
  z-index: ${({ theme }) => theme.zIndex.header};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  pointer-events: auto;
  white-space: nowrap;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translate(-50%, 15px);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }

  &:hover {
    background-color: #d15d1b;
  }
`;

const ScrollDownIcon = styled(ArrowLeftIconSvg)`
  width: 18px;
  height: 18px;
  transform: rotate(-90deg);

  path {
    stroke: ${({ theme }) => theme.colors.gray500};
  }
`;

const TopPanel = styled.div`
  position: fixed;
  top: 48px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 390px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  z-index: ${({ theme }) => theme.zIndex.header};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TopInput = styled.input`
  flex: 1;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: 0 10px;
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const TopBtn = styled.button`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray500};
`;

const TitleInline = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const MemberCountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.gray500};
  line-height: normal;
  vertical-align: middle;
  transform: translateY(2px);
`;

const ChatRoom = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const bottomRef = useRef(null);
  const contextMenuRef = useRef(null);

  const [chatInfo, setChatInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    show: false,
    anchorRect: null,
    messageId: null,
    isMine: false,
    text: '',
    type: 'message',
    reactions: {},
  });
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const [showDeleteChatAlert, setShowDeleteChatAlert] = useState(false);
  const [showDeleteMsgAlert, setShowDeleteMsgAlert] = useState(false);
  const [showReportAlert, setShowReportAlert] = useState(false);
  const [showBgPanel, setShowBgPanel] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);

  const [bgColor, setBgColor] = useState(BG_COLORS[0].value);
  const [bubbleColor, setBubbleColor] = useState(BUBBLE_COLORS[0].value);
  const [otherBubbleColor, setOtherBubbleColor] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [themeReady, setThemeReady] = useState(false);
  const [isBgImageUploading, setIsBgImageUploading] = useState(false);

  const [showScrollDownButton, setShowScrollDownButton] = useState(false);
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);

  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchMatchIds, setSearchMatchIds] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const [showRenamePanel, setShowRenamePanel] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const themeInitialized = useRef(false);
  const isInitialLoad = useRef(true);
  const prevMsgsLength = useRef(0);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'chats', chatId), (snap) => {
      if (snap.exists()) setChatInfo(snap.data());
    });
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    if (!chatInfo || !user?.accountname || themeInitialized.current) return;
    const saved = chatInfo.themes?.[user.accountname];
    if (saved?.bgColor) setBgColor(saved.bgColor);
    if (saved?.bubbleColor) setBubbleColor(saved.bubbleColor);
    if (saved?.otherBubbleColor) setOtherBubbleColor(saved.otherBubbleColor);
    if (saved?.bgImage) setBgImage(saved.bgImage);
    themeInitialized.current = true;
    setThemeReady(true);
  }, [chatInfo, user?.accountname]);

  useEffect(() => {
    const unsub = subscribeToMessages(chatId, setMessages);
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    if (user?.accountname) {
      markAsRead(chatId, user.accountname);
    }
  }, [chatId, user?.accountname]);

  useLayoutEffect(() => {
    if (messages.length === 0) return;

    const isNewMessage = messages.length > prevMsgsLength.current;
    const lastMessage = messages[messages.length - 1];
    const isMine = lastMessage?.senderId === user?.accountname;

    if (isInitialLoad.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' });
      isInitialLoad.current = false;
    } else if (isNewMessage) {
      if (!showScrollDownButton || isMine) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShowNewMessageAlert(false);
      } else {
        setShowNewMessageAlert(true);
      }
    }

    prevMsgsLength.current = messages.length;
  }, [messages, user?.accountname, showScrollDownButton]);

  useEffect(() => {
    const updateScrollButton = () => {
      if (!bottomRef.current) return;
      const bottomTop = bottomRef.current.getBoundingClientRect().top;
      const isNearBottom = bottomTop <= window.innerHeight - 72 + 24;
      setShowScrollDownButton(!isNearBottom);

      if (isNearBottom) {
        setShowNewMessageAlert(false);
      }
    };

    updateScrollButton();
    window.addEventListener('scroll', updateScrollButton, { passive: true });
    window.addEventListener('resize', updateScrollButton);
    return () => {
      window.removeEventListener('scroll', updateScrollButton);
      window.removeEventListener('resize', updateScrollButton);
    };
  }, [messages, themeReady]);

  useEffect(() => {
    if (!contextMenu.show) return;
    const handleClick = () => setContextMenu((prev) => ({ ...prev, show: false }));
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [contextMenu.show]);

  useEffect(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      setSearchMatchIds([]);
      setCurrentMatchIndex(0);
      return;
    }
    const matched = messages
      .filter((m) => (m.text || '').toLowerCase().includes(keyword))
      .map((m) => m.id);
    setSearchMatchIds(matched);
    setCurrentMatchIndex(0);
  }, [searchKeyword, messages]);

  const scrollToMessageById = (messageId) => {
    if (!messageId) return;
    const el = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const goToNextMatch = () => {
    if (!searchMatchIds.length) return;
    const next = (currentMatchIndex + 1) % searchMatchIds.length;
    setCurrentMatchIndex(next);
    scrollToMessageById(searchMatchIds[next]);
  };

  const goToPrevMatch = () => {
    if (!searchMatchIds.length) return;
    const prev = (currentMatchIndex - 1 + searchMatchIds.length) % searchMatchIds.length;
    setCurrentMatchIndex(prev);
    scrollToMessageById(searchMatchIds[prev]);
  };

  useLayoutEffect(() => {
    if (!contextMenu.show || !contextMenuRef.current || !contextMenu.anchorRect) return;
    const menu = contextMenuRef.current;
    const { width, height } = menu.getBoundingClientRect();
    const { anchorRect } = contextMenu;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x = contextMenu.isMine ? anchorRect.left - width : anchorRect.right;
    let y = anchorRect.top;

    if (x + width > vw) x = vw - width - 8;
    if (y + height > vh) y = vh - height - 8;
    if (x < 0) x = 8;
    if (y < 0) y = 8;

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
  }, [contextMenu.show, contextMenu.anchorRect, contextMenu.isMine]);

  const otherParticipant = (() => {
    if (!chatInfo || !user?.accountname) return null;
    const otherAccountname = chatInfo.participants?.find((p) => p !== user.accountname);
    const info = chatInfo.participantInfo?.[otherAccountname] || { username: '', image: '' };
    return { ...info, accountname: otherAccountname };
  })();

  const handleContextMenu = (e, msg, isMine) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      show: true,
      anchorRect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
      messageId: msg.id,
      isMine,
      text: msg.text,
      type: 'message',
      reactions: msg.reactions || {},
    });
  };

  const handleEditStart = () => {
    setEditingId(contextMenu.messageId);
    setEditText(contextMenu.text);
    setContextMenu((prev) => ({ ...prev, show: false }));
  };

  const confirmEdit = async (msg) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    await editMessage(chatId, msg.id, trimmed);
    setEditingId(null);
  };

  const handleDelete = () => {
    setContextMenu((prev) => ({ ...prev, show: false }));
    setShowDeleteMsgAlert(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(contextMenu.text);
    setContextMenu((prev) => ({ ...prev, show: false }));
  };

  const handleReaction = async (reactionType) => {
    if (!user?.accountname) return;
    const { messageId, reactions } = contextMenu;
    const hasReacted = reactions[reactionType]?.includes(user.accountname) || false;
    setContextMenu((prev) => ({ ...prev, show: false }));
    await toggleReaction(chatId, messageId, user.accountname, reactionType, hasReacted);
  };

  const handleReport = () => {
    setContextMenu((prev) => ({ ...prev, show: false }));
    setShowReportAlert(true);
  };

  const handleOpenRename = () => {
    if (!chatInfo?.isGroupChat) return;
    setShowSearchPanel(false);
    setRenameValue(chatInfo?.groupTitle || '');
    setShowModal(false);
    requestAnimationFrame(() => {
      setShowRenamePanel(true);
    });
  };

  const handleSaveRename = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    if (trimmed === (chatInfo?.groupTitle || '').trim()) {
      setShowRenamePanel(false);
      return;
    }
    await updateChatTitle(chatId, trimmed);
    setShowRenamePanel(false);
  };

  const handleOpenSearch = () => {
    setShowModal(false);
    setShowRenamePanel(false);
    setShowSearchPanel(true);
  };

  const handleBgImageChange = async (file) => {
    if (!file) {
      setBgImage(null);
      saveChatTheme(chatId, user.accountname, { bgColor, bubbleColor, otherBubbleColor, bgImage: null });
      return;
    }
    setIsBgImageUploading(true);
    try {
      const info = await uploadImage(file);
      const url = getImageUrl(info.filename);
      setBgImage(url);
      saveChatTheme(chatId, user.accountname, { bgColor, bubbleColor, otherBubbleColor, bgImage: url });
    } finally {
      setIsBgImageUploading(false);
    }
  };

  const modalItems = [
    ...(chatInfo?.isGroupChat
      ? [
          {
            label: '채팅방 이름 수정',
            onClick: handleOpenRename,
          },
        ]
      : []),
    {
      label: '테마 설정',
      onClick: () => {
        setShowModal(false);
        setShowBgPanel(true);
      },
    },
    ...(chatInfo?.isGroupChat
      ? [
          {
            label: '구성원 보기',
            onClick: () => {
              setShowModal(false);
              setShowMembersPanel(true);
            },
          },
          {
            label: '초대하기',
            onClick: () => {
              setShowModal(false);
              setShowInviteModal(true);
            },
          },
        ]
      : [
          {
            label: '별명 설정',
            onClick: () => {
              setShowModal(false);
              setShowNicknameModal(true);
            },
          },
        ]),
    {
      label: '채팅방 나가기',
      danger: true,
      onClick: () => setShowDeleteChatAlert(true),
    },
  ];

  const chatTitle = chatInfo?.isGroupChat ? (
    <TitleInline>
      <span>{chatInfo?.groupTitle || ''}</span>
      <MemberCountBadge>{chatInfo?.participants?.length || 0}</MemberCountBadge>
    </TitleInline>
  ) : (
    chatInfo?.nicknames?.[user?.accountname]?.[otherParticipant?.accountname] || otherParticipant?.username || ''
  );

  const topPanelOffset = showSearchPanel || showRenamePanel ? 56 : 16;

  return (
    <>
      <Wrapper $bgColor={bgColor} $bgImage={bgImage}>
        <Header
          type="back-search-more"
          title={chatTitle}
          titleLeft
          onSearch={handleOpenSearch}
          onMore={() => setShowModal(true)}
          alwaysVisible
        />

        {showSearchPanel && (
          <TopPanel>
            <TopInput
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="메시지 검색"
              autoFocus
            />
            <TopBtn onClick={goToPrevMatch}>이전</TopBtn>
            <TopBtn onClick={goToNextMatch}>다음</TopBtn>
            <TopBtn
              onClick={() => {
                setShowSearchPanel(false);
                setSearchKeyword('');
                setSearchMatchIds([]);
                setCurrentMatchIndex(0);
              }}
            >
              닫기
            </TopBtn>
          </TopPanel>
        )}

        {showRenamePanel && (
          <TopPanel>
            <TopInput
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="채팅방 이름"
              maxLength={30}
              autoFocus
            />
            <TopBtn onClick={handleSaveRename}>저장</TopBtn>
            <TopBtn onClick={() => setShowRenamePanel(false)}>취소</TopBtn>
          </TopPanel>
        )}

        <MessageList style={{ visibility: themeReady ? 'visible' : 'hidden', paddingTop: topPanelOffset }}>
          {messages.map((msg, index) => (
            <ChatMessageItem
              key={msg.id}
              msg={msg}
              prevMsg={index > 0 ? messages[index - 1] : null}
              nextMsg={messages[index + 1] || null}
              isMine={msg.senderId === user?.accountname}
              bubbleColor={bubbleColor}
              otherBubbleColor={otherBubbleColor}
              editingId={editingId}
              editText={editText}
              setEditText={setEditText}
              onConfirmEdit={confirmEdit}
              onContextMenu={handleContextMenu}
              chatInfo={chatInfo}
              user={user}
              reactionSrcMap={REACTION_SRC_MAP}
              chatId={chatId}
              isSearchActive={searchMatchIds[currentMatchIndex] === msg.id}
            />
          ))}
          <div ref={bottomRef} />
        </MessageList>
      </Wrapper>

      {showNewMessageAlert && (
        <NewMessageAlert
          onClick={() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            setShowNewMessageAlert(false);
          }}
        >
          새 메시지가 도착했습니다
        </NewMessageAlert>
      )}

      {showScrollDownButton && !showNewMessageAlert && (
        <ScrollDownButtonArea>
          <ScrollDownButton onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            <ScrollDownIcon />
          </ScrollDownButton>
        </ScrollDownButtonArea>
      )}

      <ChatInputBar chatId={chatId} senderAccountname={user?.accountname} />

      <BottomModal isOpen={showModal} onClose={() => setShowModal(false)} items={modalItems} />

      <AlertModal
        isOpen={showDeleteChatAlert}
        title="채팅방을 나가시겠습니까?"
        description={
          chatInfo?.isGroupChat
            ? '그룹 채팅방 구성원에서 제외되며, 더 이상 메시지를 받지 않습니다.'
            : '나간 후에는 채팅 목록에서 숨겨집니다.'
        }
        confirmText="나가기"
        danger
        onCancel={() => setShowDeleteChatAlert(false)}
        onConfirm={async () => {
          await leaveChat(chatId, user.accountname, chatInfo?.isGroupChat);
          navigate('/chat');
        }}
      />

      <AlertModal
        isOpen={showDeleteMsgAlert}
        title="메시지를 삭제할까요?"
        description="삭제한 메시지는 복구할 수 없습니다."
        confirmText="삭제"
        danger
        onCancel={() => setShowDeleteMsgAlert(false)}
        onConfirm={async () => {
          await deleteMessage(chatId, contextMenu.messageId);
          setShowDeleteMsgAlert(false);
        }}
      />

      <AlertModal
        isOpen={showReportAlert}
        title="메시지를 신고할까요?"
        description="신고된 메시지는 관리자가 검토합니다."
        confirmText="신고"
        danger
        onCancel={() => setShowReportAlert(false)}
        onConfirm={() => setShowReportAlert(false)}
      />

      <ChatThemePanel
        isOpen={showBgPanel}
        onClose={() => setShowBgPanel(false)}
        bgColor={bgColor}
        bubbleColor={bubbleColor}
        otherBubbleColor={otherBubbleColor}
        bgImage={bgImage}
        isBgImageUploading={isBgImageUploading}
        onBgColorChange={(color) => {
          setBgColor(color);
          saveChatTheme(chatId, user.accountname, { bgColor: color, bubbleColor, otherBubbleColor, bgImage });
        }}
        onBubbleColorChange={(color) => {
          setBubbleColor(color);
          saveChatTheme(chatId, user.accountname, { bgColor, bubbleColor: color, otherBubbleColor, bgImage });
        }}
        onOtherBubbleColorChange={(color) => {
          setOtherBubbleColor(color);
          saveChatTheme(chatId, user.accountname, { bgColor, bubbleColor, otherBubbleColor: color, bgImage });
        }}
        onBgImageChange={handleBgImageChange}
      />

      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        chatId={chatId}
        existingParticipants={chatInfo?.participants || []}
      />

      <GroupMembersPanel
        isOpen={showMembersPanel}
        onClose={() => setShowMembersPanel(false)}
        chatInfo={chatInfo}
        currentUser={user}
        chatId={chatId}
      />

      <NicknameModal
        key={showNicknameModal ? 'open' : 'closed'}
        isOpen={showNicknameModal}
        onClose={() => setShowNicknameModal(false)}
        targetName={otherParticipant?.username || ''}
        currentNickname={chatInfo?.nicknames?.[user?.accountname]?.[otherParticipant?.accountname] || ''}
        onSave={(nickname) => setNickname(chatId, user.accountname, otherParticipant?.accountname, nickname)}
      />

      <ChatContextMenu
        contextMenu={contextMenu}
        contextMenuRef={contextMenuRef}
        user={user}
        reactionSrcMap={REACTION_SRC_MAP}
        onReaction={handleReaction}
        onEditStart={handleEditStart}
        onDelete={handleDelete}
        onCopy={handleCopy}
        onReport={handleReport}
      />
    </>
  );
};

export default ChatRoom;
