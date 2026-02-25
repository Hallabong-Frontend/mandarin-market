import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const SpinnerRing = styled.div`
  width: ${({ size }) => size || '40px'};
  height: ${({ size }) => size || '40px'};
  border: 3px solid ${({ theme }) => theme.colors.gray200};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ padding }) => padding || '40px 0'};
`;

const Spinner = ({ size, padding }) => (
  <SpinnerWrapper padding={padding}>
    <SpinnerRing size={size} />
  </SpinnerWrapper>
);

export default Spinner;
