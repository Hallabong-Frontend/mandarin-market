import styled, { keyframes } from 'styled-components';

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${({ theme }) => theme.zIndex.overlay};
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const ModalSheet = styled.div`
  width: 100%;
  max-width: 390px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 16px 16px 0 0;
  padding: 8px 0 32px;
  animation: ${slideUp} 0.25s ease;
`;

const Handle = styled.div`
  width: 48px;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.gray200};
  border-radius: 2px;
  margin: 8px auto 16px;
`;

const ModalItem = styled.button`
  width: 100%;
  padding: 14px 24px;
  text-align: center;
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ $danger, theme }) => $danger ? theme.colors.error : theme.colors.black};
  transition: background-color ${({ theme }) => theme.transitions.base};

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray100};
  }
`;

/**
 * 하단에서 슬라이드 업으로 열리는 액션 시트. 오버레이 클릭 시 닫힌다.
 *
 * @param {{ isOpen: boolean, onClose: Function, items: Array<{ label: string, onClick: Function, danger?: boolean }> }} props
 * @returns {JSX.Element|null}
 */
const BottomModal = ({ isOpen, onClose, items = [] }) => {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalSheet onClick={(e) => e.stopPropagation()}>
        <Handle />
        {items.map((item, index) => (
          <ModalItem
            key={index}
            $danger={item.danger}
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
          >
            {item.label}
          </ModalItem>
        ))}
      </ModalSheet>
    </Overlay>
  );
};

export default BottomModal;
