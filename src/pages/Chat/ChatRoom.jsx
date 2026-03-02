import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import styled from 'styled-components';
import AlertModal from '../../components/common/AlertModal';
import BottomModal from '../../components/common/BottomModal';
import Header from '../../components/common/Header';
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
  deleteChat,
  saveChatTheme,
} from '../../firebase/chat';
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
  padding-bottom: 72px;
`;

const MessageList = styled.div`
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  const [bgColor, setBgColor] = useState(BG_COLORS[0].value);
  const [bubbleColor, setBubbleColor] = useState(BUBBLE_COLORS[0].value);
  const [otherBubbleColor, setOtherBubbleColor] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [themeReady, setThemeReady] = useState(false);
  const [isBgImageUploading, setIsBgImageUploading] = useState(false);
  const themeInitialized = useRef(false);
  const isInitialLoad = useRef(true);

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
    if (isInitialLoad.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' });
      isInitialLoad.current = false;
    } else {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!contextMenu.show) return;
    const handleClick = () => setContextMenu((prev) => ({ ...prev, show: false }));
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [contextMenu.show]);

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
    const { messageId, reactions } = contextMenu;
    const hasReacted = reactions[reactionType]?.includes(user.accountname) || false;
    setContextMenu((prev) => ({ ...prev, show: false }));
    await toggleReaction(chatId, messageId, user.accountname, reactionType, hasReacted);
  };

  const handleReport = () => {
    setContextMenu((prev) => ({ ...prev, show: false }));
    setShowReportAlert(true);
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
      : []),
    {
      label: '채팅방 나가기',
      danger: true,
      onClick: () => setShowDeleteChatAlert(true),
    },
  ];

  return (
    <>
      <Wrapper $bgColor={bgColor} $bgImage={bgImage}>
        <Header
          type="back-title-more"
          title={chatInfo?.isGroupChat ? chatInfo?.groupTitle : otherParticipant?.username || ''}
          titleLeft
          onMore={() => setShowModal(true)}
          alwaysVisible
        />

        <MessageList style={{ visibility: themeReady ? 'visible' : 'hidden' }}>
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
            />
          ))}
          <div ref={bottomRef} />
        </MessageList>
      </Wrapper>

      <ChatInputBar chatId={chatId} senderAccountname={user?.accountname} />

      <BottomModal isOpen={showModal} onClose={() => setShowModal(false)} items={modalItems} />

      <AlertModal
        isOpen={showDeleteChatAlert}
        title="채팅방을 나가시겠습니까?"
        description="채팅방의 모든 메시지가 삭제됩니다."
        confirmText="나가기"
        danger
        onCancel={() => setShowDeleteChatAlert(false)}
        onConfirm={async () => {
          await deleteChat(chatId);
          navigate('/chat');
        }}
      />

      <AlertModal
        isOpen={showDeleteMsgAlert}
        title="메시지를 삭제할까요?"
        description="삭제된 메시지는 복구할 수 없습니다."
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
