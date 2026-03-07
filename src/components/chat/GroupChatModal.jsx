import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { searchUser } from '../../api/user';
import { uploadImage } from '../../api/auth';
import { getImageUrl } from '../../utils/format';
import { createGroupChat } from '../../firebase/chat';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FullPagePanel from '../common/FullPagePanel';
import Avatar from '../common/Avatar';
import Spinner from '../common/Spinner';
import UploadIcon from '../../assets/icons/icon-image.svg?react';

const TopActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
`;

const CreateButton = styled.button`
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  background-color: ${({ theme, $disabled }) => ($disabled ? theme.colors.gray300 : theme.colors.primary)};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
`;

const ImageSection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`;

const ImageLabel = styled.label`
  position: relative;
  width: 110px;
  height: 110px;
  cursor: pointer;
`;

const GroupImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.gray100};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const DefaultImagePlaceHolder = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.gray200};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.gray500};
  font-size: 14px;
`;

const UploadBtnIcon = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 20px;
    height: 20px;
    path {
      stroke: white;
      fill: none;
    }
  }
`;

const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray500};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
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

const SelectedSection = styled.div`
  margin-bottom: 24px;
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

const ResultList = styled.ul`
  display: flex;
  flex-direction: column;
`;

const UserRow = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
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
  border: 2px solid ${({ theme, $checked }) => ($checked ? theme.colors.primary : theme.colors.gray300)};
  background-color: ${({ theme, $checked }) => ($checked ? theme.colors.primary : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    display: ${({ $checked }) => ($checked ? 'block' : 'none')};
    width: 10px;
    height: 5px;
    border-left: 2px solid white;
    border-bottom: 2px solid white;
    transform: rotate(-45deg) translateY(-1px);
  }
`;

const GroupChatModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const toast = useToast();

  const [groupTitle, setGroupTitle] = useState('');
  const [groupImage, setGroupImage] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // 검색 키워드 하이라이트
  const renderHighlight = (text) => {
    if (!searchKeyword || !text) return text;
    const parts = text.split(new RegExp(`(${searchKeyword})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchKeyword.toLowerCase() ? <SearchKeyword key={i}>{part}</SearchKeyword> : part,
    );
  };

  // 디바운스 처리
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
        // 본인은 검색 결과에서 제외
        setResults((data || []).filter((u) => u.accountname !== me.accountname));
      } catch (err) {
        console.error(err);
        toast.error('사용자 검색에 실패했습니다.');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400),
    [me.accountname],
  );

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      const url = getImageUrl(res.filename);
      setGroupImage(url);
    } catch (err) {
      console.error(err);
      toast.error('이미지 업로드에 실패했습니다.');
    }
  };

  const toggleUser = (user) => {
    if (selectedUsers.some((u) => u.accountname === user.accountname)) {
      setSelectedUsers((prev) => prev.filter((u) => u.accountname !== user.accountname));
    } else {
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0 || isCreating) return;
    setIsCreating(true);
    try {
      const chatId = await createGroupChat(me, selectedUsers, groupTitle, groupImage);
      onClose(); // 모달 닫기
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error(err);
      toast.error('그룹 채팅방 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <FullPagePanel isOpen={isOpen} onClose={onClose} title="그룹채팅 만들기">
      <TopActions>
        <CreateButton $disabled={selectedUsers.length === 0 || isCreating} onClick={handleCreate}>
          {isCreating ? '생성 중...' : '만들기'}
        </CreateButton>
      </TopActions>

      <Form>
        <ImageSection>
          <ImageLabel htmlFor="groupImageUpload">
            {groupImage ? (
              <GroupImage src={groupImage} alt="Group Profile" />
            ) : (
              <DefaultImagePlaceHolder>기본</DefaultImagePlaceHolder>
            )}
            <UploadBtnIcon>
              <UploadIcon />
            </UploadBtnIcon>
          </ImageLabel>
          <input type="file" id="groupImageUpload" accept="image/*" onChange={handleImageChange} hidden />
        </ImageSection>

        <InputSection>
          <Label>채팅방 이름</Label>
          <Input
            placeholder="입력하지 않으면 참여자 이름으로 저장됩니다."
            value={groupTitle}
            onChange={(e) => setGroupTitle(e.target.value)}
          />
        </InputSection>
      </Form>

      {selectedUsers.length > 0 && (
        <SelectedSection>
          <Label>선택된 대화 상대 ({selectedUsers.length})</Label>
          <SelectedList>
            {selectedUsers.map((u) => (
              <SelectedChip key={u.accountname} onClick={() => toggleUser(u)}>
                <Avatar src={u.image} size="24px" />
                <span>{u.username}</span>
                <RemoveBtn>×</RemoveBtn>
              </SelectedChip>
            ))}
          </SelectedList>
        </SelectedSection>
      )}

      <SearchSection>
        <Label>대화 상대 초대</Label>
        <Input
          placeholder="계정 검색"
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
            {results.map((u) => (
              <UserRow key={u.accountname} onClick={() => toggleUser(u)}>
                <Avatar src={u.image} size="40px" />
                <UserInfo>
                  <Username>{renderHighlight(u.username)}</Username>
                  <AccountId>@{renderHighlight(u.accountname)}</AccountId>
                </UserInfo>
                <Checkbox $checked={selectedUsers.some((su) => su.accountname === u.accountname)} />
              </UserRow>
            ))}
          </ResultList>
        )}
      </SearchSection>
    </FullPagePanel>
  );
};

export default GroupChatModal;
