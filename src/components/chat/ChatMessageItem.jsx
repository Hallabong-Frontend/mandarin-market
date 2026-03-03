import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { toggleReaction } from '../../firebase/chat';
import { formatMsgTime, getMsgDateKey, formatMsgDate } from '../../utils/chatFormat';
import { STICKER_MAP } from './EmojiPicker';
import Avatar from '../common/Avatar';

const REACTION_TYPES = [{ key: 'heart' }, { key: 'thumbs_up' }, { key: 'star' }];

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
  align-items: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};
  gap: 8px;
  width: 100%;
  flex-direction: ${({ $isMine }) => ($isMine ? 'row-reverse' : 'row')};
`;

const Bubble = styled.div`
  max-width: ${({ $isMine }) => ($isMine ? '60%' : '100%')};
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

const BubbleColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  max-width: 60%;
`;

const BubbleRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 4px;
`;

const SenderName = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray500};
  padding-left: 2px;
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

const MessageItemContainer = styled.div`
  ${({ $isSearchActive, theme }) =>
    $isSearchActive
      ? `
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
    border-radius: ${theme.borderRadius.base};
  `
      : ''}
`;

const ChatMessageItem = ({
  msg,
  prevMsg,
  nextMsg,
  isMine,
  bubbleColor,
  otherBubbleColor,
  editingId,
  editText,
  setEditText,
  onConfirmEdit,
  onContextMenu,
  chatInfo,
  user,
  reactionSrcMap,
  chatId,
  isSearchActive = false,
}) => {
  const navigate = useNavigate();

  const currentDateKey = getMsgDateKey(msg.createdAt);
  const prevDateKey = prevMsg ? getMsgDateKey(prevMsg.createdAt) : '';
  const showDateDivider = !prevMsg || currentDateKey !== prevDateKey;

  const currentTime = formatMsgTime(msg.createdAt);
  const prevTime = prevMsg ? formatMsgTime(prevMsg.createdAt) : '';
  const nextDateKey = nextMsg ? getMsgDateKey(nextMsg.createdAt) : '';
  const nextTime = nextMsg ? formatMsgTime(nextMsg.createdAt) : '';
  const showTime =
    !nextMsg || nextDateKey !== currentDateKey || nextMsg.senderId !== msg.senderId || nextTime !== currentTime;

  const showName =
    !prevMsg || prevMsg.senderId !== msg.senderId || prevDateKey !== currentDateKey || prevTime !== currentTime;

  const hasAnyReaction = REACTION_TYPES.some(({ key }) => (msg.reactions?.[key]?.length || 0) > 0);

  return (
    <MessageItemContainer data-message-id={msg.id} $isSearchActive={isSearchActive}>
      {showDateDivider && (
        <DateDivider>
          <DateDividerText>{formatMsgDate(msg.createdAt)}</DateDividerText>
        </DateDivider>
      )}

      <MessageWrapper $isMine={isMine}>
        <MessageRow $isMine={isMine}>
          {!isMine && (
            <Avatar
              src={chatInfo?.participantInfo?.[msg.senderId]?.image}
              alt="상대방"
              size="32px"
              onClick={() => navigate(`/profile/${msg.senderId}`)}
            />
          )}
          {!isMine ? (
            <BubbleColumn>
              {showName && (
                <SenderName>
                  {chatInfo?.nicknames?.[user?.accountname]?.[msg.senderId] ||
                    chatInfo?.participantInfo?.[msg.senderId]?.username}
                </SenderName>
              )}
              <BubbleRow>
                {msg.stickerKey ? (
                  <StickerImg
                    src={STICKER_MAP[msg.stickerKey]}
                    alt="스티커"
                    onContextMenu={(e) => onContextMenu(e, msg, isMine)}
                  />
                ) : msg.imageUrl ? (
                  <ChatImage src={msg.imageUrl} alt="채팅 이미지" />
                ) : (
                  <Bubble
                    $isMine={isMine}
                    $otherBubbleColor={otherBubbleColor}
                    onContextMenu={(e) => onContextMenu(e, msg, isMine)}
                  >
                    {msg.text}
                  </Bubble>
                )}
                {showTime && <ChatTime>{currentTime}</ChatTime>}
              </BubbleRow>
            </BubbleColumn>
          ) : msg.stickerKey ? (
            <StickerImg
              src={STICKER_MAP[msg.stickerKey]}
              alt="스티커"
              onContextMenu={(e) => onContextMenu(e, msg, isMine)}
            />
          ) : msg.imageUrl ? (
            <ChatImage src={msg.imageUrl} alt="채팅 이미지" />
          ) : editingId === msg.id ? (
            <EditWrapper>
              <EditInput
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' || e.shiftKey) return;
                  e.preventDefault();
                  onConfirmEdit(msg);
                }}
              />
              <EditConfirmBtn onMouseDown={(e) => e.preventDefault()} onClick={() => onConfirmEdit(msg)}>
                완료
              </EditConfirmBtn>
            </EditWrapper>
          ) : (
            <Bubble
              $isMine={isMine}
              $bubbleColor={bubbleColor}
              $otherBubbleColor={otherBubbleColor}
              onContextMenu={(e) => onContextMenu(e, msg, isMine)}
            >
              {msg.text}
            </Bubble>
          )}
          {isMine && showTime && <ChatTime>{currentTime}</ChatTime>}
        </MessageRow>

        {hasAnyReaction && (
          <ReactionBar $isMine={isMine}>
            {REACTION_TYPES.filter(({ key }) => (msg.reactions?.[key]?.length || 0) > 0).map(({ key }) => {
              const src = reactionSrcMap[key];
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
            })}
          </ReactionBar>
        )}
      </MessageWrapper>
    </MessageItemContainer>
  );
};

export default ChatMessageItem;
