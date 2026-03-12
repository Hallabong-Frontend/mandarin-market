import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import symbolLogoW from '../../assets/images/symbol-logo-W.png';
import messagecircle from '../../assets/icons/message-circle.png';
import googleLogo from '../../assets/icons/Google_G_Logo 1.png';
import facebookIcon from '../../assets/icons/facebook.png';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #EA7F42;
`;

const LogoSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BottomSheet = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 40px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SocialButton = styled.button`
  width: 100%;
  padding: 14px 20px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  border: 1.5px solid ${({ $borderColor }) => $borderColor};
  background-color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.base};

  &:hover {
    opacity: 0.85;
  }
`;

const IconWrap = styled.span`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0;
`;

const ButtonLabel = styled.span`
  flex: 1;
  text-align: center;
`;


const TextLinks = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 4px;
`;

const TextLink = styled.button`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray400};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    text-decoration: underline;
  }
`;

const TextDivider = styled.span`
  color: ${({ theme }) => theme.colors.gray300};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const LoginMain = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <LogoSection>
        <img src={symbolLogoW} alt="감귤마켓 심볼" width="120" height="120" />
      </LogoSection>

      <BottomSheet>
        <SocialButton $borderColor="#FEE500">
          <IconWrap>
            <img src={messagecircle} alt="카카오" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
          </IconWrap>
          <ButtonLabel>카카오톡 계정으로 로그인</ButtonLabel>
        </SocialButton>

        <SocialButton $borderColor="#767676">
          <IconWrap>
            <img src={googleLogo} alt="구글" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
          </IconWrap>
          <ButtonLabel>구글 계정으로 로그인</ButtonLabel>
        </SocialButton>

        <SocialButton $borderColor="#1877F2">
          <IconWrap>
            <img src={facebookIcon} alt="페이스북" style={{ width: '11px', height: '20px', objectFit: 'contain' }} />
          </IconWrap>
          <ButtonLabel>페이스북 계정으로 로그인</ButtonLabel>
        </SocialButton>

        <TextLinks>
          <TextLink onClick={() => navigate('/login/email')}>이메일로 로그인</TextLink>
          <TextDivider>|</TextDivider>
          <TextLink onClick={() => navigate('/signup')}>회원가입</TextLink>
        </TextLinks>
      </BottomSheet>
    </PageWrapper>
  );
};

export default LoginMain;