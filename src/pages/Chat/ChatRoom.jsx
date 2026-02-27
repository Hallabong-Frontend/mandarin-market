import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import styled from 'styled-components';
import BottomModal from '../../components/common/BottomModal';
import Header from '../../components/common/Header';
import ImageIcon from '../../assets/icons/icon-image.svg?react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { subscribeToMessages, sendTextMessage, sendImageMessage, markAsRead } from '../../firebase/chat';
import Avatar from '../../components/common/Avatar';

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.gray100};
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
  justify-content: center;
  margin: 8px 0 4px;
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
  background-color: ${({ $isMine, theme }) => ($isMine ? theme.colors.primary : theme.colors.white)};
  color: ${({ $isMine, theme }) => ($isMine ? theme.colors.white : theme.colors.black)};
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

  const [chatInfo, setChatInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'chats', chatId), (snap) => {
      if (snap.exists()) setChatInfo(snap.data());
    });
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    const unsub = subscribeToMessages(chatId, setMessages);
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    if (user?.accountname) {
      markAsRead(chatId, user.accountname);
    }
  }, [chatId, user?.accountname]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const otherParticipant = (() => {
    if (!chatInfo || !user?.accountname) return null;
    const otherAccountname = chatInfo.participants?.find((p) => p !== user.accountname);
    return chatInfo.participantInfo?.[otherAccountname] || { username: '', image: '' };
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

  const modalItems = [{ label: '채팅방 나가기', danger: true, onClick: () => navigate(-1) }];

  return (
    <>
      <Wrapper>
        <Header
          type="back-title-more"
          title={otherParticipant?.username || ''}
          titleLeft
          onMore={() => setShowModal(true)}
        />

        <MessageList>
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

            return (
              <div key={msg.id}>
                {showDateDivider && (
                  <DateDivider>
                    <DateDividerText>{formatMsgDate(msg.createdAt)}</DateDividerText>
                  </DateDivider>
                )}

                <MessageWrapper $isMine={isMine}>
                  <MessageRow $isMine={isMine}>
                    {!isMine && <Avatar src={otherParticipant?.image} alt="상대방" size="32px" />}
                    {msg.imageUrl ? (
                      <ChatImage src={msg.imageUrl} alt="채팅 이미지" />
                    ) : (
                      <Bubble $isMine={isMine}>{msg.text}</Bubble>
                    )}
                    {showTime && <ChatTime>{currentTime}</ChatTime>}
                  </MessageRow>
                </MessageWrapper>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </MessageList>
      </Wrapper>

      <InputArea>
        <ImageInputBtn onClick={() => fileRef.current?.click()} disabled={isSending}>
          <ImageIcon width="22" height="22" />
        </ImageInputBtn>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
        <TextInput
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지 입력하기..."
        />
        <SendButton onClick={handleSend} disabled={!inputText.trim() || isSending}>
          전송
        </SendButton>
      </InputArea>

      <BottomModal isOpen={showModal} onClose={() => setShowModal(false)} items={modalItems} />
    </>
  );
};

export default ChatRoom;
