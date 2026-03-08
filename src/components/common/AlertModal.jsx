import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const ModalBox = styled.div`
  width: 100%;
  max-width: 320px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const ModalContent = styled.div`
  padding: 24px 16px 16px;
  text-align: center;
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 8px;
`;

const ModalDesc = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray400};
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 14px;
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ $primary, $danger, theme }) =>
    $danger ? theme.colors.error : $primary ? theme.colors.primary : theme.colors.gray400};
  border-right: ${({ $hasBorder, theme }) => $hasBorder ? `1px solid ${theme.colors.border}` : 'none'};

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray100};
  }
`;

/**
 * 중앙 확인 다이얼로그. 취소/확인 버튼과 danger 스타일을 지원한다.
 *
 * @param {{ isOpen: boolean, title: string, description: string, cancelText: string, confirmText: string, onCancel: Function, onConfirm: Function, danger: boolean }} props
 * @returns {JSX.Element|null}
 */
const AlertModal = ({
  isOpen,
  title,
  description,
  cancelText = '취소',
  confirmText = '확인',
  onCancel,
  onConfirm,
  danger = false,
}) => {
  if (!isOpen) return null;

  return (
    <Overlay>
      <ModalBox>
        <ModalContent>
          {title && <ModalTitle>{title}</ModalTitle>}
          {description && <ModalDesc>{description}</ModalDesc>}
        </ModalContent>
        <ButtonGroup>
          <ModalButton $hasBorder onClick={onCancel}>
            {cancelText}
          </ModalButton>
          <ModalButton $primary={!danger} $danger={danger} onClick={onConfirm}>
            {confirmText}
          </ModalButton>
        </ButtonGroup>
      </ModalBox>
    </Overlay>
  );
};

export default AlertModal;
