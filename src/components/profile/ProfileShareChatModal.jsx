import styled from 'styled-components';
import Avatar from '../common/Avatar';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  justify-content: center;
  align-items: flex-end;
`;

const Sheet = styled.div`
  width: 100%;
  max-width: 390px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px 16px 0 0;
  padding: 10px 0 16px;
  max-height: 70vh;
  overflow: hidden;
`;

const Handle = styled.div`
  width: 46px;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => theme.colors.gray200};
  margin: 0 auto 14px;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
  padding: 0 16px 12px;
`;

const List = styled.div`
  overflow-y: auto;
  max-height: calc(70vh - 70px);
`;

const Item = styled.button`
  width: 100%;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.colors.gray100};
  }
`;

const Name = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.black};
`;

const EmptyText = styled.p`
  padding: 18px 16px;
  color: ${({ theme }) => theme.colors.gray400};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const ProfileShareChatModal = ({ isOpen, onClose, chats = [], isLoading = false, onSelect }) => {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Sheet onClick={(e) => e.stopPropagation()}>
        <Handle />
        <Title>누구에게 공유할까요?</Title>
        <List>
          {isLoading ? (
            <EmptyText>채팅방을 불러오는 중입니다.</EmptyText>
          ) : chats.length === 0 ? (
            <EmptyText>공유할 채팅방이 없습니다.</EmptyText>
          ) : (
            chats.map((chat) => (
              <Item
                key={chat.id}
                onClick={() => {
                  onSelect?.(chat);
                }}
              >
                <Avatar src={chat.image} alt={chat.title} />
                <Name>{chat.title}</Name>
              </Item>
            ))
          )}
        </List>
      </Sheet>
    </Overlay>
  );
};

export default ProfileShareChatModal;
