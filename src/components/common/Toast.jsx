import styled, { keyframes } from 'styled-components';

const slideInDown = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
`;

const TYPE_COLORS = {
  success: 'success',
  error: 'error',
  info: 'primary',
};

const TYPE_ICONS = {
  success: '✓',
  error: '✕',
  info: '!',
};

const Container = styled.div`
  position: fixed;
  top: 56px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: 100%;
  max-width: 390px;
  padding: 0 16px;
  z-index: ${({ theme }) => theme.zIndex.toast};
  pointer-events: none;
`;

const ToastItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 5px solid ${({ theme, $type }) => theme.colors[TYPE_COLORS[$type]]};
  animation: ${slideInDown} ${({ theme }) => theme.transitions.base};
  pointer-events: auto;
  cursor: pointer;
`;

const Icon = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: ${({ theme, $type }) => theme.colors[TYPE_COLORS[$type]]};
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.4;
`;

const ToastContainer = ({ toasts, onRemove }) => {
  if (!toasts.length) return null;

  return (
    <Container>
      {toasts.map(({ id, message, type }) => (
        <ToastItem key={id} $type={type} onClick={() => onRemove(id, `${type}:${message}`)}>
          <Icon $type={type}>{TYPE_ICONS[type]}</Icon>
          <Message>{message}</Message>
        </ToastItem>
      ))}
    </Container>
  );
};

export default ToastContainer;
