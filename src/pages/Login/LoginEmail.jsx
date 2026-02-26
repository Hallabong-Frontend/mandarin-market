import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { login } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import AuthInput from '../../components/common/AuthInput';
import SubmitButton from '../../components/common/SubmitButton';

const Wrapper = styled.div`
  min-height: 100vh;
  padding: 60px 34px 40px;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fonts.size.xxl};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 40px;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ButtonWrapper = styled.div`
  margin-top: 14px;
`;

const SignUpLink = styled.p`
  text-align: center;
  margin-top: 20px;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray400};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const LoginEmail = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isActive = form.email.trim() && form.password.trim();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isActive || isLoading) return;

    setIsLoading(true);
    try {
      const data = await login(form.email, form.password);
      // 새 API: flat 구조 { token, ... } / 구 API: { user: { token, ... } }
      const token = data.token ?? data.user?.token;
      const userData = data.token ? data : data.user;
      if (token) {
        authLogin(token, userData);
        navigate('/feed', { replace: true });
      } else {
        console.error('[Login] token 없음:', data);
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('[Login Failed]', err.response?.status, err.response?.data);
      setError(err.response?.data?.message || '이메일 또는 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>로그인</Title>
      <Form onSubmit={handleSubmit}>
        <AuthInput
          label="이메일"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
        />
        <AuthInput
          label="비밀번호"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          errorText={error}
        />
        <ButtonWrapper>
          <SubmitButton disabled={!isActive || isLoading}>{isLoading ? '로그인 중...' : '로그인'}</SubmitButton>
        </ButtonWrapper>
      </Form>
      <SignUpLink onClick={() => navigate('/signup')}>이메일로 회원가입</SignUpLink>
    </Wrapper>
  );
};

export default LoginEmail;
