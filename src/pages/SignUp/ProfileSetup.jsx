import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { register, uploadImage, checkAccountValid } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { validateAccountname, getImageUrl } from '../../utils/format';
import AuthInput from '../../components/common/AuthInput';
import SubmitButton from '../../components/common/SubmitButton';

const Wrapper = styled.div`
  min-height: 100vh;
  padding: 40px 34px;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fonts.size.xxl};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
  text-align: center;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray400};
  text-align: center;
  margin-bottom: 32px;
`;

const AvatarWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.gray100};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const AvatarEditBtn = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SuccessText = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.success};
`;

const ErrorText = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
`;

const ButtonWrapper = styled.div`
  margin-top: 8px;
`;

const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2"/>
  </svg>
);

const ProfileSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const fileRef = useRef(null);

  const { email, password } = location.state || {};

  const [form, setForm] = useState({ username: '', accountname: '', intro: '' });
  const [errors, setErrors] = useState({});
  const [accountValid, setAccountValid] = useState(false);
  const [previewImage, setPreviewImage] = useState('https://dev.wenivops.co.kr/services/mandarin/Ellipse.png');
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValid =
    form.username.length >= 2 &&
    form.username.length <= 10 &&
    accountValid &&
    !errors.username &&
    !errors.accountname;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'accountname') setAccountValid(false);
  };

  const handleUsernameBlur = () => {
    if (!form.username) return;
    if (form.username.length < 2 || form.username.length > 10) {
      setErrors({ ...errors, username: '*사용자 이름은 2~10자 이내여야 합니다.' });
    } else {
      setErrors({ ...errors, username: '' });
    }
  };

  const handleAccountBlur = async () => {
    if (!form.accountname) return;

    if (!validateAccountname(form.accountname)) {
      setErrors({ ...errors, accountname: '*영문, 숫자, 밑줄 및 마침표만 사용할 수 있습니다.' });
      return;
    }

    try {
      const data = await checkAccountValid(form.accountname);
      if (data.message === '*이미 사용 중인 ID 입니다.') {
        setErrors({ ...errors, accountname: '' });
        setAccountValid(true);
      } else {
        setErrors({ ...errors, accountname: data.message });
        setAccountValid(false);
      }
    } catch (err) {
      setErrors({ ...errors, accountname: err.response?.data?.message || '*이미 사용 중인 ID 입니다.' });
      setAccountValid(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setIsLoading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        const imgData = await uploadImage(imageFile);
        imageUrl = imgData.filename;
      }

      const data = await register({
        email,
        password,
        username: form.username,
        accountname: form.accountname,
        intro: form.intro,
        image: imageUrl || 'https://dev.wenivops.co.kr/services/mandarin/Ellipse.png',
      });

      if (data.user?.token) {
        authLogin(data.user.token, data.user);
        navigate('/feed', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.includes('계정')) {
        setErrors({ ...errors, accountname: msg });
      } else {
        setErrors({ ...errors, general: msg || '회원가입에 실패했습니다.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !password) {
    navigate('/signup');
    return null;
  }

  return (
    <Wrapper>
      <Title>프로필 설정</Title>
      <Subtitle>나중에 언제든지 변경할 수 있습니다.</Subtitle>

      <AvatarWrapper>
        <AvatarContainer>
          <Avatar src={previewImage} alt="프로필 이미지" onError={(e) => { e.target.src = 'https://dev.wenivops.co.kr/services/mandarin/Ellipse.png'; }} />
          <AvatarEditBtn type="button" onClick={() => fileRef.current?.click()}>
            <CameraIcon />
          </AvatarEditBtn>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
        </AvatarContainer>
      </AvatarWrapper>

      <Form onSubmit={handleSubmit}>
        <AuthInput
          label="사용자 이름"
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          onBlur={handleUsernameBlur}
          placeholder="2~10자 이내여야 합니다."
          errorText={errors.username}
        />

        <FieldGroup>
          <AuthInput
            label="계정 ID"
            type="text"
            name="accountname"
            value={form.accountname}
            onChange={handleChange}
            onBlur={handleAccountBlur}
            placeholder="영문, 숫자, 특수문자(.),(_)만 사용 가능합니다."
            errorText={errors.accountname}
          />
          {accountValid && !errors.accountname && <SuccessText>사용 가능한 계정ID입니다.</SuccessText>}
        </FieldGroup>

        <AuthInput
          label="소개"
          type="text"
          name="intro"
          value={form.intro}
          onChange={handleChange}
          placeholder="자신과 판매할 상품에 대해 소개해 주세요!"
        />

        {errors.general && <ErrorText>{errors.general}</ErrorText>}

        <ButtonWrapper>
          <SubmitButton disabled={!isValid || isLoading}>
            {isLoading ? '가입 중...' : '감귤마켓 시작하기'}
          </SubmitButton>
        </ButtonWrapper>
      </Form>
    </Wrapper>
  );
};

export default ProfileSetup;
