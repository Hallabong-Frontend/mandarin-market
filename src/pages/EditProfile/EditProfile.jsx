import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { updateMyProfile, uploadImage, checkAccountValid } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { validateAccountname, getImageUrl } from '../../utils/format';
import Header from '../../components/common/Header';
import AuthInput from '../../components/common/AuthInput';

const Wrapper = styled.div`
  min-height: 100vh;
  padding-top: 0;
`;

const Content = styled.div`
  padding: 24px 34px;
`;

const AvatarWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 88px;
  height: 88px;
`;

const Avatar = styled.img`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.gray100};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const AvatarEditBtn = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
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

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SuccessText = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.success};
`;

const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2" />
  </svg>
);

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    username: user?.username || '',
    accountname: user?.accountname || '',
    intro: user?.intro || '',
  });
  const [errors, setErrors] = useState({});
  const [accountValid, setAccountValid] = useState(true);
  const [previewImage, setPreviewImage] = useState(
    getImageUrl(user?.image) || 'https://dev.wenivops.co.kr/services/mandarin/Ellipse.png',
  );
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isChanged =
    form.username !== user?.username ||
    form.accountname !== user?.accountname ||
    form.intro !== user?.intro ||
    imageFile;

  const isValid =
    form.username.length >= 2 &&
    form.username.length <= 10 &&
    (form.accountname === user?.accountname || accountValid) &&
    !errors.username &&
    !errors.accountname &&
    isChanged;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'accountname' && value !== user?.accountname) setAccountValid(false);
  };

  const handleUsernameBlur = () => {
    if (!form.username) return;
    if (form.username.length < 2 || form.username.length > 10) {
      setErrors({ ...errors, username: '사용자 이름은 2~10자 이내여야 합니다.' });
    } else {
      setErrors({ ...errors, username: '' });
    }
  };

  const handleAccountBlur = async () => {
    if (!form.accountname || form.accountname === user?.accountname) return;

    if (!validateAccountname(form.accountname)) {
      setErrors({ ...errors, accountname: '영문, 숫자, 밑줄, 마침표만 사용 가능합니다.' });
      return;
    }

    try {
      const data = await checkAccountValid(form.accountname);
      if (data.message === '사용 가능한 계정ID 입니다.') {
        setErrors({ ...errors, accountname: '' });
        setAccountValid(true);
      } else {
        setErrors({ ...errors, accountname: data.message });
        setAccountValid(false);
      }
    } catch (err) {
      setErrors({ ...errors, accountname: err.response?.data?.message || '이미 사용 중인 계정ID입니다.' });
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setIsLoading(true);
    try {
      let imageUrl = user?.image;
      if (imageFile) {
        const imgData = await uploadImage(imageFile);
        imageUrl = imgData.filename;
      }

      const data = await updateMyProfile({
        username: form.username,
        accountname: form.accountname,
        intro: form.intro,
        image: imageUrl,
      });

      updateUser(data.user);
      navigate(-1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrapper>
      <Header type="back-title-save" title="프로필 수정" saveDisabled={!isValid || isLoading} onSave={handleSave} />

      <Content>
        <AvatarWrapper>
          <AvatarContainer>
            <Avatar
              src={previewImage}
              alt="프로필 이미지"
              onError={(e) => {
                e.target.src = 'https://dev.wenivops.co.kr/services/mandarin/Ellipse.png';
              }}
            />
            <AvatarEditBtn type="button" onClick={() => fileRef.current?.click()}>
              <CameraIcon />
            </AvatarEditBtn>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
          </AvatarContainer>
        </AvatarWrapper>

        <Form onSubmit={handleSave}>
          <AuthInput
            label="사용자 이름 (2~10자)"
            type="text"
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            onBlur={handleUsernameBlur}
            errorText={errors.username}
            placeholder="2~10자 이내여야 합니다."
          />

          <InputGroup>
            <AuthInput
              label="계정 ID"
              type="text"
              id="accountname"
              name="accountname"
              value={form.accountname}
              onChange={handleChange}
              onBlur={handleAccountBlur}
              errorText={errors.accountname}
              placeholder="영문, 숫자, 특수문자(.,_)만 사용 가능합니다."
            />
            {accountValid && form.accountname !== user?.accountname && !errors.accountname && (
              <SuccessText>사용 가능한 계정ID입니다.</SuccessText>
            )}
          </InputGroup>

          <AuthInput
            label="소개"
            type="text"
            id="intro"
            name="intro"
            value={form.intro}
            onChange={handleChange}
            placeholder="자신과 판매할 상품에 대해 소개해 주세요!"
          />
        </Form>
      </Content>
    </Wrapper>
  );
};

export default EditProfile;
