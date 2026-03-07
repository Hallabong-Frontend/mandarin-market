import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { updateMyProfile, uploadImage, checkAccountValid } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { validateAccountname, getImageUrl } from '../../utils/format';
import { syncParticipantProfileInChats, syncSharedProfileMessagesInChats } from '../../firebase/chat';
import useForm from '../../hooks/useForm';
import Header from '../../components/common/Header';
import AuthInput from '../../components/common/AuthInput';
import Avatar from '../../components/common/Avatar';
import ImageIconSvg from '../../assets/icons/icon-image.svg?react';

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

const InfoText = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray400};
`;

const ImageIcon = () => <ImageIconSvg width="18" height="18" />;

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const fileRef = useRef(null);
  const accountCheckSeqRef = useRef(0);

  const [accountValid, setAccountValid] = useState(true);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);
  const [previewImage, setPreviewImage] = useState(
    getImageUrl(user?.image) || 'https://dev.wenivops.co.kr/services/mandarin/Ellipse.png',
  );
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    values: form,
    errors,
    setFieldError,
    handleChange,
    handleBlur,
    validateField,
    isValid,
  } = useForm({
    initialValues: {
      username: user?.username || '',
      accountname: user?.accountname || '',
      intro: user?.intro || '',
    },
    validators: {
      username: (value) => {
        if (!value) return '';
        if (value.length < 2 || value.length > 10) {
          return '사용자 이름은 2~10자 이내여야 합니다.';
        }
        return '';
      },
      accountname: (value) => {
        if (!value || value === user?.accountname) return '';
        if (!validateAccountname(value)) {
          return '영문, 숫자, 특수문자(.,_)만 사용할 수 있습니다.';
        }
        return '';
      },
    },
    getIsChanged: (values) =>
      values.username !== user?.username ||
      values.accountname !== user?.accountname ||
      values.intro !== user?.intro ||
      !!imageFile,
    getIsValid: ({ values, errors: formErrors }) =>
      values.username.length >= 2 &&
      values.username.length <= 10 &&
      (values.accountname === user?.accountname || validateAccountname(values.accountname)) &&
      !formErrors.username &&
      !formErrors.accountname &&
      (values.username !== user?.username ||
        values.accountname !== user?.accountname ||
        values.intro !== user?.intro ||
        !!imageFile),
  });

  const checkAccountAvailability = useCallback(
    async (accountname, options = {}) => {
      const { showChecking = true } = options;
      const seq = ++accountCheckSeqRef.current;
      if (showChecking) setIsCheckingAccount(true);

      try {
        const data = await checkAccountValid(accountname);
        if (seq !== accountCheckSeqRef.current) return false;

        if (data?.message?.includes('사용 가능')) {
          setFieldError('accountname', '');
          setAccountValid(true);
          return true;
        }

        setFieldError('accountname', data?.message || '이미 사용 중인 계정ID입니다.');
        setAccountValid(false);
        return false;
      } catch (err) {
        if (seq !== accountCheckSeqRef.current) return false;
        setFieldError('accountname', err.response?.data?.message || '이미 사용 중인 계정ID입니다.');
        setAccountValid(false);
        return false;
      } finally {
        if (showChecking && seq === accountCheckSeqRef.current) {
          setIsCheckingAccount(false);
        }
      }
    },
    [setFieldError],
  );

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    handleChange(e);
    if (name !== 'accountname') return;

    if (value === user?.accountname) {
      setAccountValid(true);
      setFieldError('accountname', '');
      setIsCheckingAccount(false);
      return;
    }

    if (value && !validateAccountname(value)) {
      setFieldError('accountname', '영문, 숫자, 특수문자(.,_)만 사용할 수 있습니다.');
      setIsCheckingAccount(false);
    } else {
      setFieldError('accountname', '');
    }

    setAccountValid(false);
  };

  const handleAccountBlur = async () => {
    if (!form.accountname || form.accountname === user?.accountname) return;

    if (!validateField('accountname')) {
      return;
    }

    await checkAccountAvailability(form.accountname);
  };

  useEffect(() => {
    if (!form.accountname || form.accountname === user?.accountname) {
      setIsCheckingAccount(false);
      return;
    }

    if (!validateAccountname(form.accountname)) {
      setIsCheckingAccount(false);
      return;
    }

    const timer = setTimeout(() => {
      checkAccountAvailability(form.accountname);
    }, 300);

    return () => clearTimeout(timer);
  }, [form.accountname, user?.accountname, checkAccountAvailability]);

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
    if (!isValid || isLoading || isCheckingAccount) return;

    if (!validateField('username')) return;

    if (form.accountname !== user?.accountname) {
      if (!validateField('accountname')) return;
      const available = await checkAccountAvailability(form.accountname, { showChecking: false });
      if (!available) return;
    }

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

      await syncParticipantProfileInChats(data.user.accountname, {
        username: data.user.username,
        image: data.user.image,
      });
      await syncSharedProfileMessagesInChats(data.user.accountname, {
        username: data.user.username,
        image: data.user.image,
        intro: data.user.intro || '',
      });

      updateUser(data.user);
      navigate(`/profile/${data.user.accountname}`, { replace: true });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrapper>
      <Header
        type="back-title-save"
        saveDisabled={!isValid || isLoading || isCheckingAccount}
        onSave={handleSave}
      />

      <Content>
        <AvatarWrapper>
          <AvatarContainer>
            <Avatar src={previewImage} alt="프로필 이미지" size="88px" border />
            <AvatarEditBtn type="button" onClick={() => fileRef.current?.click()}>
              <ImageIcon />
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
            onChange={handleFormChange}
            onBlur={() => handleBlur('username')}
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
              onChange={handleFormChange}
              onBlur={handleAccountBlur}
              errorText={errors.accountname}
              placeholder="영문, 숫자, 특수문자(.,_)만 사용 가능합니다."
            />
            {isCheckingAccount && form.accountname !== user?.accountname && !errors.accountname && (
              <InfoText>계정ID 확인 중...</InfoText>
            )}
            {accountValid && form.accountname !== user?.accountname && !errors.accountname && !isCheckingAccount && (
              <SuccessText>사용 가능한 계정ID입니다.</SuccessText>
            )}
          </InputGroup>

          <AuthInput
            label="소개"
            type="text"
            id="intro"
            name="intro"
            value={form.intro}
            onChange={handleFormChange}
            placeholder="자신과 판매할 상품에 대해 소개해 주세요."
          />
        </Form>
      </Content>
    </Wrapper>
  );
};

export { EditProfile };
export default EditProfile;

