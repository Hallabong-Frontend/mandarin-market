import { useState } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const Modal = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 24px 20px 20px;
  width: calc(100% - 48px);
  max-width: 342px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.black};
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray400};
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;

const Btn = styled.button`
  flex: 1;
  padding: 11px 0;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  cursor: pointer;
  border: none;
  transition: opacity 0.15s;
  &:active {
    opacity: 0.8;
  }
`;

const CancelBtn = styled(Btn)`
  background-color: ${({ theme }) => theme.colors.gray100};
  color: ${({ theme }) => theme.colors.gray500};
`;

const SaveBtn = styled(Btn)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
`;

const ClearBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.gray400};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  text-decoration: underline;
  cursor: pointer;
  text-align: center;
  padding: 0;
`;

const NicknameModal = ({ isOpen, onClose, targetName, currentNickname, onSave }) => {
  const [value, setValue] = useState(currentNickname || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  const handleClear = () => {
    onSave('');
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title>{targetName}의 별명 설정</Title>
        <Input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="별명을 입력하세요 (최대 20자)"
          maxLength={20}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') onClose();
          }}
        />
        <ButtonRow>
          <CancelBtn onClick={onClose}>취소</CancelBtn>
          <SaveBtn onClick={handleSave}>저장</SaveBtn>
        </ButtonRow>
        {currentNickname && (
          <ClearBtn onClick={handleClear}>별명 삭제</ClearBtn>
        )}
      </Modal>
    </Overlay>
  );
};

export default NicknameModal;
