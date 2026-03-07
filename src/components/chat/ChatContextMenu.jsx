import styled from 'styled-components';

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

const REACTION_TYPES = [
  { key: 'heart' },
  { key: 'thumbs_up' },
  { key: 'star' },
];

const ChatContextMenu = ({
  contextMenu,
  contextMenuRef,
  user,
  reactionSrcMap,
  onReaction,
  onEditStart,
  onDelete,
  onCopy,
  onReport,
}) => {
  if (!contextMenu.show) return null;

  return (
    <ContextMenu ref={contextMenuRef} style={{ top: 0, left: 0 }} onClick={(e) => e.stopPropagation()}>
      <ReactionRow>
        {REACTION_TYPES.map(({ key }) => {
          const src = reactionSrcMap[key];
          const hasReacted = contextMenu.reactions?.[key]?.includes(user.accountname) || false;
          return (
            <ReactionBtn key={key} $active={hasReacted} onClick={() => onReaction(key)}>
              <img src={src} alt={key} />
            </ReactionBtn>
          );
        })}
      </ReactionRow>
      {contextMenu.isMine ? (
        <>
          {contextMenu.text && <ContextMenuItem onClick={onEditStart}>수정</ContextMenuItem>}
          <ContextMenuItem $danger onClick={onDelete}>
            삭제
          </ContextMenuItem>
        </>
      ) : (
        <>
          {contextMenu.text && <ContextMenuItem onClick={onCopy}>복사</ContextMenuItem>}
          <ContextMenuItem $danger onClick={onReport}>
            신고
          </ContextMenuItem>
        </>
      )}
    </ContextMenu>
  );
};

export default ChatContextMenu;
