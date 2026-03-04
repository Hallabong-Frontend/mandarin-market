import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getChatId, getOrCreateChat, toggleReaction } from '../../firebase/chat';
import { formatMsgTime, getMsgDateKey, formatMsgDate } from '../../utils/chatFormat';
import { STICKER_MAP } from './EmojiPicker';
import Avatar from '../common/Avatar';

const REACTION_TYPES = [{ key: 'heart' }, { key: 'thumbs_up' }, { key: 'star' }];

const DateDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0 14px;

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
  padding: 4px 12px;
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
  white-space: pre-wrap;
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

const SenderName = styled.button.attrs({ type: 'button' })`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray500};
  padding-left: 2px;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  pointer-events: ${({ $clickable }) => ($clickable ? 'auto' : 'none')};
`;

const SystemMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 6px 0;
`;

const SystemMessageText = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray500};
  background-color: ${({ theme }) => theme.colors.gray200};
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
`;

const UserNameLink = styled.span`
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  cursor: pointer;
  &:hover {
    text-decoration: underline;
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

const SharedProfileCard = styled.div`
  width: 220px;
  padding: 14px 12px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
`;

const SharedName = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
`;

const SharedIntro = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray500};
  line-height: 1.4;
  min-height: 18px;
`;

const SharedBtnRow = styled.div`
  width: 100%;
  display: flex;
  gap: 6px;
`;

const SharedActionBtn = styled.button`
  flex: 1;
  height: 30px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ $primary, theme }) => ($primary ? theme.colors.white : theme.colors.gray500)};
  background: ${({ $primary, theme }) => ($primary ? theme.colors.primary : theme.colors.white)};
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
  const sharedProfile = msg.profileShare;
  const canOpenSenderProfile = !!msg?.senderId;

  const handleOpenSharedProfile = () => {
    if (!sharedProfile?.accountname) return;
    navigate(`/profile/${sharedProfile.accountname}`);
  };

  const handleStartDirectChat = async () => {
    if (!user?.accountname || !sharedProfile?.accountname) return;
    const dmChatId = getChatId(user.accountname, sharedProfile.accountname);
    await getOrCreateChat(
      dmChatId,
      {
        accountname: user.accountname,
        username: user.username || chatInfo?.participantInfo?.[user.accountname]?.username || user.accountname,
        image: user.image || '',
      },
      {
        accountname: sharedProfile.accountname,
        username: sharedProfile.username || sharedProfile.accountname,
        image: sharedProfile.image || '',
      },
    );
    navigate(`/chat/${dmChatId}`);
  };

  const renderSystemText = () => {
    const { text, metadata } = msg;
    if (!metadata) return text;

    if (metadata.type === 'leave' && metadata.target) {
      const { username, accountname } = metadata.target;
      return (
        <>
          <UserNameLink onClick={() => navigate(`/profile/${accountname}`)}>{username}</UserNameLink>
          님이 채팅방을 나갔습니다.
        </>
      );
    }

    if (metadata.type === 'invite' && metadata.inviter && metadata.invited) {
      const nodes = [];
      const { username: invName, accountname: invAcc } = metadata.inviter;

      nodes.push(
        <UserNameLink key="inviter" onClick={() => navigate(`/profile/${invAcc}`)}>
          {invName}
        </UserNameLink>,
      );
      nodes.push('님이 ');

      metadata.invited.forEach((target, idx) => {
        const { username: tarName, accountname: tarAcc } = target;
        nodes.push(
          <UserNameLink key={`invited-${idx}`} onClick={() => navigate(`/profile/${tarAcc}`)}>
            {tarName}
          </UserNameLink>,
        );
        if (idx < metadata.invited.length - 1) nodes.push(', ');
      });

      nodes.push('님을 초대했습니다.');
      return nodes;
    }

    return text;
  };

  if (msg.senderId === 'system') {
    return (
      <MessageItemContainer data-message-id={msg.id} $isSearchActive={isSearchActive}>
        {showDateDivider && (
          <DateDivider>
            <DateDividerText>{formatMsgDate(msg.createdAt)}</DateDividerText>
          </DateDivider>
        )}
        <SystemMessage>
          <SystemMessageText>{renderSystemText()}</SystemMessageText>
        </SystemMessage>
      </MessageItemContainer>
    );
  }

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
              src={chatInfo?.participantInfo?.[msg.senderId]?.image || ''}
              alt="상대방"
              size="32px"
              onClick={() => navigate(`/profile/${msg.senderId}`)}
            />
          )}
          {!isMine ? (
            <BubbleColumn>
              {showName && (
                <SenderName
                  $clickable={canOpenSenderProfile}
                  onClick={() => {
                    if (!canOpenSenderProfile) return;
                    navigate(`/profile/${msg.senderId}`);
                  }}
                >
                  {chatInfo?.nicknames?.[user?.accountname]?.[msg.senderId] ||
                    chatInfo?.participantInfo?.[msg.senderId]?.username ||
                    '(알 수 없음)'}
                </SenderName>
              )}
              <BubbleRow>
                {sharedProfile ? (
                  <SharedProfileCard onContextMenu={(e) => onContextMenu(e, msg, isMine)}>
                    <Avatar src={sharedProfile.image} alt={sharedProfile.username} size="56px" border />
                    <SharedName>{sharedProfile.username}</SharedName>
                    <SharedIntro>{sharedProfile.intro || '소개가 없습니다.'}</SharedIntro>
                    <SharedBtnRow>
                      <SharedActionBtn $primary onClick={handleStartDirectChat}>
                        1:1채팅
                      </SharedActionBtn>
                      <SharedActionBtn onClick={handleOpenSharedProfile}>프로필 보기</SharedActionBtn>
                    </SharedBtnRow>
                  </SharedProfileCard>
                ) : msg.stickerKey ? (
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
          ) : sharedProfile ? (
            <SharedProfileCard onContextMenu={(e) => onContextMenu(e, msg, isMine)}>
              <Avatar src={sharedProfile.image} alt={sharedProfile.username} size="56px" border />
              <SharedName>{sharedProfile.username}</SharedName>
              <SharedIntro>{sharedProfile.intro || '소개가 없습니다.'}</SharedIntro>
              <SharedBtnRow>
                <SharedActionBtn $primary onClick={handleStartDirectChat}>
                  1:1채팅
                </SharedActionBtn>
                <SharedActionBtn onClick={handleOpenSharedProfile}>프로필 보기</SharedActionBtn>
              </SharedBtnRow>
            </SharedProfileCard>
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
