import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import fullLogo from '../../assets/images/full-logo.png';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const SplashWrapper = styled.div`
  position: fixed;
  inset: 0;
  max-width: 390px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Logo = styled.img`
  width: 180px;
  animation: ${fadeIn} 0.7s ease;
`;

const Splash = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate('/feed', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <SplashWrapper>
      <Logo src={fullLogo} alt="감귤마켓 로고" />
    </SplashWrapper>
  );
};

export default Splash;