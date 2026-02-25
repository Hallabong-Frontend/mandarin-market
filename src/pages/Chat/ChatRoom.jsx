import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BottomModal from '../../components/common/BottomModal';
import Header from '../../components/common/Header';

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
  align-items: ${({ $isMine }) => $isMine ? 'flex-end' : 'flex-start'};
`;

const MessageRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex-direction: ${({ $isMine }) => $isMine ? 'row-reverse' : 'row'};
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
  border-radius: ${({ $isMine }) => $isMine ? '16px 0 16px 16px' : '0 16px 16px 16px'};
  background-color: ${({ $isMine, theme }) => $isMine ? theme.colors.primary : theme.colors.white};
  color: ${({ $isMine, theme }) => $isMine ? theme.colors.white : theme.colors.black};
  font-size: ${({ theme }) => theme.fonts.size.base};
  line-height: 1.5;
  word-break: break-word;
`;

const ChatTime = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray400};
`;

const SeenLabel = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray400};
  margin-top: 4px;
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
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TextInput = styled.input`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.gray100};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  padding: 8px 16px;
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.black};

  &::placeholder { color: ${({ theme }) => theme.colors.gray300}; }
`;

const SendButton = styled.button`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ disabled, theme }) => disabled ? theme.colors.gray300 : theme.colors.primary};
`;

const ImageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="#767676" strokeWidth="2"/>
    <circle cx="8.5" cy="8.5" r="1.5" stroke="#767676" strokeWidth="1.5"/>
    <path d="M21 15L16 10L5 21" stroke="#767676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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

const ChatRoom = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [inputText, setInputText] = useState('');
  const [showModal, setShowModal] = useState(false);

  const isActive = inputText.trim();

  const modalItems = [
    { label: '채팅방 나가기', danger: true, onClick: () => navigate(-1) },
  ];

  return (
    <>
      <Wrapper>
        <Header
          type="back-title-more"
          title="애월읍 위니브 감귤농장"
          titleLeft
          onMore={() => setShowModal(true)}
        />

        <MessageList>
          {DUMMY_MESSAGES.map((msg) => (
            <MessageWrapper key={msg.id} $isMine={msg.isMine}>
              <MessageRow $isMine={msg.isMine}>
                {!msg.isMine && (
                  <OtherAvatar
                    src={msg.avatar || 'https://dev.wenivops.co.kr/services/mandarin/Ellipse.png'}
                    alt="상대방"
                  />
                )}
                <div>
                  {msg.image ? (
                    <ChatImage src={msg.image} alt="채팅 이미지" />
                  ) : (
                    <Bubble $isMine={msg.isMine}>{msg.text}</Bubble>
                  )}
                </div>
                <ChatTime>{msg.time}</ChatTime>
              </MessageRow>
              {msg.isMine && msg.seen && (
                <SeenLabel>내 말했어요</SeenLabel>
              )}
            </MessageWrapper>
          ))}
        </MessageList>
      </Wrapper>

      <InputArea>
        <ImageInputBtn onClick={() => fileRef.current?.click()}>
          <ImageIcon />
        </ImageInputBtn>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} />
        <TextInput
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="메시지 입력하기..."
        />
        <SendButton disabled={!isActive}>전송</SendButton>
      </InputArea>

      <BottomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        items={modalItems}
      />
    </>
  );
};

export default ChatRoom;
