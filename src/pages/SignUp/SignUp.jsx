import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { checkEmailValid } from '../../api/auth';
import { validateEmail, validatePassword } from '../../utils/format';
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

const SignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isChecking, setIsChecking] = useState(false);

  const isValid = !errors.email && !errors.password && form.email && form.password;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEmailBlur = async () => {
    if (!form.email) return;

    if (!validateEmail(form.email)) {
      setErrors((prev) => ({ ...prev, email: '*이메일 형식이 올바르지 않습니다.' }));
      return;
    }

    setIsChecking(true);
    try {
      const data = await checkEmailValid(form.email);
      if (data.message.includes('사용 가능한')) {
        setErrors((prev) => ({ ...prev, email: '' }));
      } else {
        setErrors((prev) => ({ ...prev, email: data.message }));
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, email: err.response?.data?.message || '*이미 가입된 이메일 주소입니다.' }));
    } finally {
      setIsChecking(false);
    }
  };

  const handlePasswordBlur = () => {
    if (!form.password) return;
    if (!validatePassword(form.password)) {
      setErrors((prev) => ({ ...prev, password: '*비밀번호는 6자 이상이어야 합니다.' }));
    } else {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || isChecking) return;

    if (!validateEmail(form.email)) {
      setErrors((prev) => ({ ...prev, email: '*이메일 형식이 올바르지 않습니다.' }));
      return;
    }

    setIsChecking(true);
    try {
      const data = await checkEmailValid(form.email);
      if (data.message.includes('사용 가능한')) {
        setErrors((prev) => ({ ...prev, email: '' }));
        navigate('/signup/profile', { state: { email: form.email, password: form.password } });
      } else {
        setErrors((prev) => ({ ...prev, email: '*이미 가입된 이메일 주소입니다.' }));
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, email: '*이미 가입된 이메일 주소입니다.' }));
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Wrapper>
      <Title>이메일로 회원가입</Title>
      <Form onSubmit={handleSubmit}>
        <AuthInput
          label="이메일"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleEmailBlur}
          placeholder="이메일 주소를 입력해 주세요."
          errorText={errors.email}
        />
        <AuthInput
          label="비밀번호"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          onBlur={handlePasswordBlur}
          placeholder="비밀번호를 설정해 주세요."
          errorText={errors.password}
        />
        <ButtonWrapper>
          <SubmitButton disabled={!isValid || isChecking}>다음</SubmitButton>
        </ButtonWrapper>
      </Form>
    </Wrapper>
  );
};

export default SignUp;
