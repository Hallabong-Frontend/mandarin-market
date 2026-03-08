import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: ${({ theme }) => theme.colors.white};
  z-index: ${({ theme }) => theme.zIndex.overlay};
  display: flex;
  justify-content: center;
`;

const Sheet = styled.div`
  width: 100%;
  max-width: 390px;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 20px 16px 24px;
  overflow-y: auto;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const Title = styled.h4`
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
  margin: 0;
`;

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.circle};
  color: ${({ theme }) => theme.colors.gray400};
  font-size: 18px;
`;

/**
 * 전체 화면을 덮는 슬라이드 패널. 오버레이 클릭 또는 닫기 버튼으로 닫힌다.
 *
 * @param {{ isOpen: boolean, onClose: Function, title: string, children: React.ReactNode }} props
 * @returns {JSX.Element|null}
 */
const FullPagePanel = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Sheet onClick={(e) => e.stopPropagation()}>
        <TopBar>
          <Title>{title}</Title>
          <CloseBtn type="button" aria-label={`${title} 닫기`} onClick={onClose}>
            ×
          </CloseBtn>
        </TopBar>
        {children}
      </Sheet>
    </Overlay>
  );
};

export default FullPagePanel;
