import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import styled from 'styled-components';
import BottomModal from '../../components/common/BottomModal';
import Header from '../../components/common/Header';
<<<<<<< HEAD
import ImageIcon from '../../assets/icons/icon-image.svg?react';
=======
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import {
  subscribeToMessages,
  sendTextMessage,
  sendImageMessage,
  markAsRead,
} from '../../firebase/chat';
import { getImageUrl, DEFAULT_PROFILE_IMAGE } from '../../utils/format';
>>>>>>> dev

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

const OtherAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.gray200};
  flex-shrink: 0;
`;

const Bubble = styled.div`
  max-width: 60%;
  padding: 10px 14px;
  border-radius: ${({ $isMine }) => ($isMine ? '16px 0 16px 16px' : '0 16px 16px 16px')};
  background-color: ${({ $isMine, theme }) =>
    $isMine ? theme.colors.primary : theme.colors.white};
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
  border-radius: ${({ theme }) => theme.borderRadius.round};
  padding: 8px 16px;
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.black};

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray300};
  }
`;

const SendButton = styled.button`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ disabled, theme }) => (disabled ? theme.colors.gray300 : theme.colors.primary)};
`;

<<<<<<< HEAD
const DUMMY_MESSAGES = [
  {
    id: 1,
    isMine: false,
    text: '옷을 인생을 그러므로 없으면 것은 이상은 곧 우리의 위하여, 뿐이다. 이상의 청춘의 뼈 따뜻한 그들의 그와 약동하다. 대고, 못할 넋는 풍부하게 씩는 인생의 인생의 힘입니다.',
    time: '12:37',
    seen: false,
    avatar: 'https://dev.wenivops.co.kr/services/mandarin/Ellipse.png',
  },
  {
    id: 2,
    isMine: true,
    text: '안녕하세요. 감귤 사고싶어요요요요',
    time: '12:41',
    seen: true,
  },
  {
    id: 3,
    isMine: false,
    text: '안녕하세요. 사진이 너무 맛있어요. 한라봉 언제 애월읍 있나요? 기다리고 기다렸어요 댕댕댕댕',
    time: '12:50',
    seen: false,
    image: 'https://dev.wenivops.co.kr/services/mandarin/uploads/1608551784259.jpg',
    avatar: 'https://dev.wenivops.co.kr/services/mandarin/Ellipse.png',
  },
];
=======
const ImageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="#767676" strokeWidth="2" />
    <circle cx="8.5" cy="8.5" r="1.5" stroke="#767676" strokeWidth="1.5" />
    <path
      d="M21 15L16 10L5 21"
      stroke="#767676"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Firestore Timestamp → "HH:MM" 포맷
const formatMsgTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
};
>>>>>>> dev

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

  // 채팅방 문서 구독 (상대방 정보 가져오기)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'chats', chatId), (snap) => {
      if (snap.exists()) setChatInfo(snap.data());
    });
    return () => unsub();
  }, [chatId]);

  // 메시지 실시간 구독
  useEffect(() => {
    const unsub = subscribeToMessages(chatId, setMessages);
    return () => unsub();
  }, [chatId]);

  // 입장 시 읽음 처리
  useEffect(() => {
    if (user?.accountname) {
      markAsRead(chatId, user.accountname);
    }
  }, [chatId, user?.accountname]);

  // 새 메시지 오면 맨 아래로 스크롤
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
          {messages.map((msg) => {
            const isMine = msg.senderId === user?.accountname;
            return (
              <MessageWrapper key={msg.id} $isMine={isMine}>
                <MessageRow $isMine={isMine}>
                  {!isMine && (
                    <OtherAvatar
                      src={getImageUrl(otherParticipant?.image) || DEFAULT_PROFILE_IMAGE}
                      alt="상대방"
                    />
                  )}
                  {msg.imageUrl ? (
                    <ChatImage src={msg.imageUrl} alt="채팅 이미지" />
                  ) : (
                    <Bubble $isMine={isMine}>{msg.text}</Bubble>
                  )}
                  <ChatTime>{formatMsgTime(msg.createdAt)}</ChatTime>
                </MessageRow>
              </MessageWrapper>
            );
          })}
          <div ref={bottomRef} />
        </MessageList>
      </Wrapper>

      <InputArea>
<<<<<<< HEAD
        <ImageInputBtn onClick={() => fileRef.current?.click()}>
          <ImageIcon width="22" height="22" />
=======
        <ImageInputBtn onClick={() => fileRef.current?.click()} disabled={isSending}>
          <ImageIcon />
>>>>>>> dev
        </ImageInputBtn>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
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
