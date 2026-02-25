import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BottomTabNav from '../../components/common/BottomTabNav';
import BottomModal from '../../components/common/BottomModal';
import Header from '../../components/common/Header';
import { useState } from 'react';

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.white};
  padding-bottom: 70px;
`;

const ChatItemEl = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover { background-color: ${({ theme }) => theme.colors.gray100}; }
`;

const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.gray100};
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

const DUMMY_CHATS = [
  {
    id: 1,
    username: '애월읍 위니브 감귤농장',
    lastMessage: '이번에 정정 언제하맨마씀?',
    time: '2020.10.25',
    unread: true,
    avatar: 'https://dev.wenivops.co.kr/services/mandarin/Ellipse.png',
  },
  {
    id: 2,
    username: '제주감귤마을',
    lastMessage: '깊은 어둠의 존재감, 롤스로이스 뉴 블랙 배지...',
    time: '2020.10.25',
    unread: true,
    avatar: 'https://dev.wenivops.co.kr/services/mandarin/Ellipse.png',
  },
  {
    id: 3,
    username: '누구네 농장 친환경 한라봉',
    lastMessage: '내 차는 내가 평가한다. 오픈 이벤트에 참여 하...',
    time: '2020.10.25',
    unread: false,
    avatar: 'https://dev.wenivops.co.kr/services/mandarin/Ellipse.png',
  },
];

const ChatList = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const modalItems = [
    { label: '설정', onClick: () => {} },
  ];

  return (
    <>
      <Wrapper>
        <Header type="back-more" onMore={() => setShowModal(true)} />

        {DUMMY_CHATS.map((chat) => (
          <ChatItemEl key={chat.id} onClick={() => navigate(`/chat/${chat.id}`)}>
            <AvatarWrapper>
              <Avatar src={chat.avatar} alt={chat.username} />
              {chat.unread && <UnreadDot />}
            </AvatarWrapper>
            <ChatInfo>
              <ChatTop>
                <ChatUsername>{chat.username}</ChatUsername>
                <ChatTime>{chat.time}</ChatTime>
              </ChatTop>
              <ChatLastMsg>{chat.lastMessage}</ChatLastMsg>
            </ChatInfo>
          </ChatItemEl>
        ))}
      </Wrapper>

      <BottomTabNav />

      <BottomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        items={modalItems}
      />
    </>
  );
};

export default ChatList;
