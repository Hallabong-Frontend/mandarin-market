import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { searchUser } from '../../api/user';
import { inviteUsersToChat } from '../../firebase/chat';
import { useAuth } from '../../context/AuthContext';
import FullPagePanel from '../common/FullPagePanel';
import Avatar from '../common/Avatar';
import Spinner from '../common/Spinner';

const TopActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
`;

const InviteButton = styled.button`
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  background-color: ${({ theme, $disabled }) => ($disabled ? theme.colors.gray300 : theme.colors.primary)};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
`;

const SelectedSection = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray500};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
`;

const SelectedList = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const SelectedChip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px 4px 4px;
  background-color: ${({ theme }) => theme.colors.gray100};
  border-radius: 20px;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  white-space: nowrap;
`;

const RemoveBtn = styled.button`
  color: ${({ theme }) => theme.colors.gray500};
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.gray300};
  color: white;
  margin-left: 2px;
`;

const SearchSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Input = styled.input`
  width: 100%;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px 0;
  font-size: ${({ theme }) => theme.fonts.size.base};
  outline: none;
  &:focus {
    border-bottom: 1px solid ${({ theme }) => theme.colors.primary};
  }
`;

const ResultList = styled.ul`
  display: flex;
  flex-direction: column;
`;

const UserRow = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Username = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.black};
`;

const AccountId = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray400};
`;

const SearchKeyword = styled.span`
  color: ${({ theme }) => theme.colors.primary};
`;

const Checkbox = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid
    ${({ theme, $checked, $disabled }) => ($checked || $disabled ? theme.colors.primary : theme.colors.gray300)};
  background-color: ${({ theme, $checked, $disabled }) =>
    $checked || $disabled ? theme.colors.primary : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    display: ${({ $checked, $disabled }) => ($checked || $disabled ? 'block' : 'none')};
    width: 10px;
    height: 5px;
    border-left: 2px solid white;
    border-bottom: 2px solid white;
    transform: rotate(-45deg) translateY(-1px);
  }
`;

const InviteUserModal = ({ isOpen, onClose, chatId, existingParticipants = [] }) => {
  const { user: me } = useAuth();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const renderHighlight = (text) => {
    if (!searchKeyword || !text) return text;
    const parts = text.split(new RegExp(`(${searchKeyword})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchKeyword.toLowerCase() ? <SearchKeyword key={i}>{part}</SearchKeyword> : part,
    );
  };

  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const handleSearch = useCallback(
    debounce(async (value) => {
      if (!value.trim()) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const data = await searchUser(value);
        setResults((data || []).filter((u) => u.accountname !== me.accountname));
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400),
    [me.accountname],
  );

  const toggleUser = (user, isExisting) => {
    if (isExisting) return;
    if (selectedUsers.some((u) => u.accountname === user.accountname)) {
      setSelectedUsers((prev) => prev.filter((u) => u.accountname !== user.accountname));
    } else {
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  const handleInvite = async () => {
    if (selectedUsers.length === 0 || isInviting) return;
    setIsInviting(true);
    try {
      await inviteUsersToChat(chatId, selectedUsers, me.accountname);
      onClose();
      // Optional: show a toast or alert that users are invited
    } catch (err) {
      console.error(err);
    } finally {
      setIsInviting(false);
      setSelectedUsers([]);
      setSearchKeyword('');
      setResults([]);
    }
  };

  // 모달 닫힐 때 초기화
  const handleClose = () => {
    setSelectedUsers([]);
    setSearchKeyword('');
    setResults([]);
    onClose();
  };

  return (
    <FullPagePanel isOpen={isOpen} onClose={handleClose} title="대화 상대 초대하기">
      <TopActions>
        <InviteButton $disabled={selectedUsers.length === 0 || isInviting} onClick={handleInvite}>
          {isInviting ? '초대 중...' : '초대'}
        </InviteButton>
      </TopActions>

      {selectedUsers.length > 0 && (
        <SelectedSection>
          <Label>초대할 상대 ({selectedUsers.length})</Label>
          <SelectedList>
            {selectedUsers.map((u) => (
              <SelectedChip key={u.accountname} onClick={() => toggleUser(u, false)}>
                <Avatar src={u.image} size="24px" />
                <span>{u.username}</span>
                <RemoveBtn>×</RemoveBtn>
              </SelectedChip>
            ))}
          </SelectedList>
        </SelectedSection>
      )}

      <SearchSection>
        <Label>계정 검색</Label>
        <Input
          placeholder="인물 검색"
          value={searchKeyword}
          onChange={(e) => {
            setSearchKeyword(e.target.value);
            handleSearch(e.target.value);
          }}
        />
        {isSearching ? (
          <Spinner />
        ) : (
          <ResultList>
            {results.map((u) => {
              const isExisting = existingParticipants.includes(u.accountname);
              const isChecked = selectedUsers.some((su) => su.accountname === u.accountname);

              return (
                <UserRow key={u.accountname} onClick={() => toggleUser(u, isExisting)} $disabled={isExisting}>
                  <Avatar src={u.image} size="40px" />
                  <UserInfo>
                    <Username>{renderHighlight(u.username)}</Username>
                    <AccountId>@{renderHighlight(u.accountname)}</AccountId>
                  </UserInfo>
                  <Checkbox $checked={isChecked} $disabled={isExisting} />
                </UserRow>
              );
            })}
          </ResultList>
        )}
      </SearchSection>
    </FullPagePanel>
  );
};

export default InviteUserModal;
