import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import styled from 'styled-components';
import AlertModal from '../../components/common/AlertModal';
import BottomModal from '../../components/common/BottomModal';
import Header from '../../components/common/Header';
import ImageIcon from '../../assets/icons/icon-image.svg?react';
import HeartIcon from '../../assets/icons/icon-heart.svg?react';
import EmojiIcon from '../../assets/icons/icon-emoji.svg?react';
import EmojiPicker, { STICKER_MAP } from '../../components/chat/EmojiPicker';
import heartFillSrc from '../../assets/emoji/icon_heart_fill.svg';
import thumbsUpSrc from '../../assets/emoji/icon_thumbs_up_fill.png';
import starSrc from '../../assets/emoji/icon_star.png';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import {
  subscribeToMessages,
  sendTextMessage,
  sendImageMessage,
  sendStickerMessage,
  toggleReaction,
  markAsRead,
  editMessage,
  deleteMessage,
  deleteChat,
  saveChatTheme,
} from '../../firebase/chat';
import { uploadImage } from '../../api/auth';
import { getImageUrl } from '../../utils/format';
import Avatar from '../../components/common/Avatar';
import ChatThemePanel, { BG_COLORS, BUBBLE_COLORS } from './ChatThemePanel';
import InviteUserModal from '../../components/chat/InviteUserModal';

const REACTION_TYPES = [
  { key: 'heart', src: heartFillSrc },
  { key: 'thumbs_up', src: thumbsUpSrc },
  { key: 'star', src: starSrc },
];

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

const DateDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 4px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.border};
  }
`;

const DateDividerText = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray400};
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  padding: 4px 10px;
`;

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};
`;

const MessageRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
  flex-direction: ${({ $isMine }) => ($isMine ? 'row-reverse' : 'row')};
`;

const Bubble = styled.div`
  max-width: 60%;
  padding: 10px 14px;
  border-radius: ${({ $isMine }) => ($isMine ? '16px 0 16px 16px' : '0 16px 16px 16px')};
  background-color: ${({ $isMine, $bubbleColor, $otherBubbleColor, theme }) =>
    $isMine ? $bubbleColor || theme.colors.primary : $otherBubbleColor || theme.colors.white};
  color: ${({ $isMine, $otherBubbleColor, theme }) =>
    $isMine || $otherBubbleColor ? theme.colors.white : theme.colors.black};
  font-size: ${({ theme }) => theme.fonts.size.base};
  line-height: 1.5;
  word-break: break-word;
`;

const ChatTime = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray400};
`;

const ChatImage = styled.img`
  max-width: 200px;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  object-fit: cover;
`;

const StickerImg = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
`;

const InputArea = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 390px;
  background-color: ${({ theme }) => theme.colors.white};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  padding: 10px 16px;
  gap: 8px;
`;

const ImageInputBtn = styled.button`
  width: 36px;
  height: 36px;
  background-color: ${({ theme }) => theme.colors.gray200};
  border: none;
  outline: none;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
`;

const EmojiBtn = styled.button`
  width: 36px;
  height: 36px;
  background-color: ${({ $active, theme }) => ($active ? theme.colors.gray300 : theme.colors.gray200)};
  border: none;
  outline: none;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.1s;
`;

const TextInput = styled.input`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.gray100};
  border: none;
  outline: none;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  padding: 8px 16px;
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.black};

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray300};
  }
`;

const SendButton = styled.button`
  border: none;
  outline: none;
  background: transparent;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ disabled, theme }) => (disabled ? theme.colors.gray300 : theme.colors.primary)};
`;

const ContextMenu = styled.ul`
  position: fixed;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  box-shadow: ${({ theme }) => theme.shadows.base};
  z-index: 250;
  list-style: none;
  padding: 4px 0;
  min-width: 120px;
`;

const ContextMenuItem = styled.li`
  padding: 10px 16px;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  cursor: pointer;
  text-align: center;
  color: ${({ $danger, theme }) => ($danger ? theme.colors.error : theme.colors.text)};
  &:hover {
    background: ${({ theme }) => theme.colors.gray100};
  }
`;

const ReactionRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ReactionBtn = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: ${({ $active, theme }) => ($active ? theme.colors.gray200 : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: ${({ theme }) => theme.colors.gray100};
  }

  img {
    width: 22px;
    height: 22px;
    object-fit: contain;
  }
`;

const EditWrapper = styled.div`
  position: relative;
  max-width: 60%;
`;

const EditInput = styled.input`
  width: 100%;
  padding: 10px 52px 10px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fonts.size.base};
  outline: none;
  box-sizing: border-box;
`;

const HeartReaction = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};
  padding: ${({ $isMine }) => ($isMine ? '4px 8px 0 0' : '4px 0 0 40px')};
`;

const HeartBubble = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: #e53935;
  border: none;
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.shadows.base};

  svg {
    width: 10px;
    height: 10px;
    path {
      fill: #ffffff;
      stroke: #ffffff;
    }
  }
`;

const ReactionBar = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 60%;
  padding: ${({ $isMine }) => ($isMine ? '4px 8px 0 0' : '4px 0 0 40px')};
`;

const ReactionPill = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  padding: 2px 6px;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.08);
  cursor: pointer;

  img {
    width: 14px;
    height: 14px;
    object-fit: contain;
  }

  span {
    font-size: 11px;
    color: ${({ theme }) => theme.colors.gray500};
  }
`;

const EditConfirmBtn = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px 8px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  cursor: pointer;
`;

const formatMsgTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const getMsgDateKey = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatMsgDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
};

const ChatRoom = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileRef = useRef(null);
  const bottomRef = useRef(null);
  const contextMenuRef = useRef(null);
  const inputContextRef = useRef({ selectionStart: 0, selectionEnd: 0 });

  const [chatInfo, setChatInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  useEffect(() => {
    if (!showEmojiPicker) return;
    const handleClick = () => setShowEmojiPicker(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [showEmojiPicker]);

  useLayoutEffect(() => {
    if (!contextMenu.show || !contextMenuRef.current || !contextMenu.anchorRect) return;
    const menu = contextMenuRef.current;
    const { width, height } = menu.getBoundingClientRect();
    const { anchorRect } = contextMenu;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x, y;

    if (contextMenu.type === 'input') {
      x = anchorRect.left;
      y = anchorRect.top - height;
    } else if (contextMenu.isMine) {
      x = anchorRect.left - width;
      y = anchorRect.top;
    } else {
      x = anchorRect.right;
      y = anchorRect.top;
    }

    if (x + width > vw) x = vw - width - 8;
    if (y + height > vh) y = vh - height - 8;
    if (x < 0) x = 8;
    if (y < 0) y = 8;

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
  }, [contextMenu.show, contextMenu.anchorRect, contextMenu.type, contextMenu.isMine]);

  const otherParticipant = (() => {
    if (!chatInfo || !user?.accountname) return null;
    const otherAccountname = chatInfo.participants?.find((p) => p !== user.accountname);
    const info = chatInfo.participantInfo?.[otherAccountname] || { username: '', image: '' };
    return { ...info, accountname: otherAccountname };
  })();

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isSending) return;
    setInputText('');
    setIsSending(true);
    try {
      await sendTextMessage(chatId, user.accountname, text);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSending(true);
    try {
      await sendImageMessage(chatId, user.accountname, file);
    } finally {
      setIsSending(false);
      e.target.value = '';
    }
  };

  const handleStickerSend = async (stickerKey) => {
    setShowEmojiPicker(false);
    if (isSending) return;
    setIsSending(true);
    try {
      await sendStickerMessage(chatId, user.accountname, stickerKey);
    } finally {
      setIsSending(false);
    }
  };

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

  const handleEditSubmit = async (e, msg) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    await confirmEdit(msg);
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

  const handleInputContextMenu = (e) => {
    e.preventDefault();
    inputContextRef.current = {
      selectionStart: e.target.selectionStart,
      selectionEnd: e.target.selectionEnd,
    };
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      show: true,
      anchorRect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
      messageId: null,
      isMine: false,
      text: '',
      type: 'input',
      reactions: {},
    });
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      const { selectionStart, selectionEnd } = inputContextRef.current;
      setInputText((prev) => prev.slice(0, selectionStart) + clipText + prev.slice(selectionEnd));
    } catch {
      // 클립보드 권한 없을 경우 무시
    }
    setContextMenu((prev) => ({ ...prev, show: false }));
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
          {messages.map((msg, index) => {
            const isMine = msg.senderId === user?.accountname;
            const currentDateKey = getMsgDateKey(msg.createdAt);
            const prevDateKey = index > 0 ? getMsgDateKey(messages[index - 1].createdAt) : '';
            const showDateDivider = index === 0 || currentDateKey !== prevDateKey;
            const currentTime = formatMsgTime(msg.createdAt);
            const nextMsg = messages[index + 1];
            const nextDateKey = nextMsg ? getMsgDateKey(nextMsg.createdAt) : '';
            const nextTime = nextMsg ? formatMsgTime(nextMsg.createdAt) : '';
            const showTime =
              !nextMsg ||
              nextDateKey !== currentDateKey ||
              nextMsg.senderId !== msg.senderId ||
              nextTime !== currentTime;

            const hasAnyReaction = REACTION_TYPES.some(({ key }) => (msg.reactions?.[key]?.length || 0) > 0);

            return (
              <div key={msg.id}>
                {showDateDivider && (
                  <DateDivider>
                    <DateDividerText>{formatMsgDate(msg.createdAt)}</DateDividerText>
                  </DateDivider>
                )}

                <MessageWrapper $isMine={isMine}>
                  <MessageRow $isMine={isMine}>
                    {!isMine && (
                      <Avatar
                        src={chatInfo?.participantInfo?.[msg.senderId]?.image || otherParticipant?.image}
                        alt="상대방"
                        size="32px"
                        onClick={() => navigate(`/profile/${msg.senderId}`)}
                      />
                    )}
                    {msg.stickerKey ? (
                      <StickerImg
                        src={STICKER_MAP[msg.stickerKey]}
                        alt="스티커"
                        onContextMenu={(e) => handleContextMenu(e, msg, isMine)}
                      />
                    ) : msg.imageUrl ? (
                      <ChatImage src={msg.imageUrl} alt="채팅 이미지" />
                    ) : editingId === msg.id ? (
                      <EditWrapper>
                        <EditInput
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => handleEditSubmit(e, msg)}
                        />
                        <EditConfirmBtn onMouseDown={(e) => e.preventDefault()} onClick={() => confirmEdit(msg)}>
                          완료
                        </EditConfirmBtn>
                      </EditWrapper>
                    ) : (
                      <Bubble
                        $isMine={isMine}
                        $bubbleColor={bubbleColor}
                        $otherBubbleColor={otherBubbleColor}
                        onContextMenu={(e) => handleContextMenu(e, msg, isMine)}
                      >
                        {msg.text}
                      </Bubble>
                    )}
                    {showTime && <ChatTime>{currentTime}</ChatTime>}
                  </MessageRow>

                  {hasAnyReaction && (
                    <ReactionBar $isMine={isMine}>
                      {REACTION_TYPES.filter(({ key }) => (msg.reactions?.[key]?.length || 0) > 0).map(
                        ({ key, src }) => {
                          const hasReacted = msg.reactions[key]?.includes(user.accountname) || false;
                          return (
                            <ReactionPill
                              key={key}
                              onClick={() => toggleReaction(chatId, msg.id, user.accountname, key, hasReacted)}
                            >
                              <img src={src} alt={key} />
                              <span>{msg.reactions[key].length}</span>
                            </ReactionPill>
                          );
                        },
                      )}
                    </ReactionBar>
                  )}
                </MessageWrapper>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </MessageList>
      </Wrapper>

      <EmojiPicker isOpen={showEmojiPicker} onSelect={handleStickerSend} />

      <InputArea>
        <ImageInputBtn onClick={() => fileRef.current?.click()} disabled={isSending}>
          <ImageIcon width="22" height="22" />
        </ImageInputBtn>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
        <EmojiBtn
          $active={showEmojiPicker}
          onClick={(e) => {
            e.stopPropagation();
            setShowEmojiPicker((prev) => !prev);
          }}
          disabled={isSending}
        >
          <EmojiIcon width="22" height="22" color="white" />
        </EmojiBtn>
        <TextInput
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          onContextMenu={handleInputContextMenu}
          onFocus={() => setShowEmojiPicker(false)}
          placeholder="메시지 입력하기..."
        />
        <SendButton onClick={handleSend} disabled={!inputText.trim() || isSending}>
          전송
        </SendButton>
      </InputArea>

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

      {contextMenu.show && (
        <ContextMenu ref={contextMenuRef} style={{ top: 0, left: 0 }} onClick={(e) => e.stopPropagation()}>
          {contextMenu.type === 'input' ? (
            <ContextMenuItem onClick={handlePaste}>붙여넣기</ContextMenuItem>
          ) : (
            <>
              <ReactionRow>
                {REACTION_TYPES.map(({ key, src }) => {
                  const hasReacted = contextMenu.reactions?.[key]?.includes(user.accountname) || false;
                  return (
                    <ReactionBtn key={key} $active={hasReacted} onClick={() => handleReaction(key)}>
                      <img src={src} alt={key} />
                    </ReactionBtn>
                  );
                })}
              </ReactionRow>
              {contextMenu.isMine ? (
                <>
                  {contextMenu.text && <ContextMenuItem onClick={handleEditStart}>수정</ContextMenuItem>}
                  <ContextMenuItem $danger onClick={handleDelete}>
                    삭제
                  </ContextMenuItem>
                </>
              ) : (
                <>
                  {contextMenu.text && <ContextMenuItem onClick={handleCopy}>복사</ContextMenuItem>}
                  <ContextMenuItem $danger onClick={handleReport}>
                    신고
                  </ContextMenuItem>
                </>
              )}
            </>
          )}
        </ContextMenu>
      )}
    </>
  );
};

export default ChatRoom;
