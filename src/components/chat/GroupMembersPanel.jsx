import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getChatId, getOrCreateChat, setNickname } from '../../firebase/chat';
import FullPagePanel from '../common/FullPagePanel';
import Avatar from '../common/Avatar';
import NicknameModal from './NicknameModal';

const MemberList = styled.ul`
  display: flex;
  flex-direction: column;
`;

const MemberRow = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const MemberInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Username = styled.button.attrs({ type: 'button' })`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.black};
  text-align: left;
  cursor: pointer;
`;

const AccountId = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray400};
`;

const MeBadge = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  padding: 2px 8px;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
`;

const DmButton = styled.button`
  padding: 6px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NicknameBtn = styled.button`
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.gray500};
  font-size: ${({ theme }) => theme.fonts.size.xs};
  cursor: pointer;
  white-space: nowrap;
  background: none;
`;

const CountLabel = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray500};
  margin-bottom: 12px;
`;

const GroupMembersPanel = ({ isOpen, onClose, chatInfo, currentUser, chatId }) => {
  const navigate = useNavigate();
  const [loadingAccountname, setLoadingAccountname] = useState(null);
  const [nicknameTarget, setNicknameTarget] = useState(null);

  const participants = chatInfo?.participants || [];
  const participantInfo = chatInfo?.participantInfo || {};

  const handleDm = async (otherAccountname) => {
    if (loadingAccountname) return;
    setLoadingAccountname(otherAccountname);
    try {
      const other = participantInfo[otherAccountname] || {};
      const dmChatId = getChatId(currentUser.accountname, otherAccountname);
      await getOrCreateChat(dmChatId, currentUser, { accountname: otherAccountname, ...other });
      onClose();
      navigate(`/chat/${dmChatId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAccountname(null);
    }
  };

  const handleProfileOpen = (accountname) => {
    if (!accountname) return;
    onClose();
    navigate(`/profile/${accountname}`);
  };

  return (
    <>
      <FullPagePanel isOpen={isOpen} onClose={onClose} title="대화 상대">
        <CountLabel>참여자 {participants.length}명</CountLabel>
        <MemberList>
          {participants.map((accountname) => {
            const info = participantInfo[accountname] || {};
            const isMe = accountname === currentUser?.accountname;
            const isLoading = loadingAccountname === accountname;
            const nickname = chatInfo?.nicknames?.[currentUser?.accountname]?.[accountname];
            const displayName = nickname || info.username || accountname;

            return (
              <MemberRow key={accountname}>
                <Avatar src={info.image} size="44px" />
                <MemberInfo>
                  <Username onClick={() => handleProfileOpen(accountname)}>{displayName}</Username>
                  <AccountId>@{accountname}</AccountId>
                </MemberInfo>
                {isMe ? (
                  <MeBadge>나</MeBadge>
                ) : (
                  <ActionButtons>
                    <DmButton disabled={!!loadingAccountname} onClick={() => handleDm(accountname)}>
                      {isLoading ? '이동 중...' : '1:1 메시지'}
                    </DmButton>
                    <NicknameBtn
                      onClick={() => setNicknameTarget({ accountname, displayName: info.username || accountname, nickname })}
                    >
                      {nickname ? '별명 수정' : '별명 설정'}
                    </NicknameBtn>
                  </ActionButtons>
                )}
              </MemberRow>
            );
          })}
        </MemberList>
      </FullPagePanel>

      <NicknameModal
        key={nicknameTarget?.accountname || 'none'}
        isOpen={!!nicknameTarget}
        onClose={() => setNicknameTarget(null)}
        targetName={nicknameTarget?.displayName || ''}
        currentNickname={nicknameTarget?.nickname || ''}
        onSave={(nickname) => setNickname(chatId, currentUser.accountname, nicknameTarget.accountname, nickname)}
      />
    </>
  );
};

export default GroupMembersPanel;

