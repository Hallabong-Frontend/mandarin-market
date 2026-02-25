import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { createPost, updatePost, getPost } from '../../api/post';
import { uploadImage } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl, DEFAULT_PROFILE_IMAGE } from '../../utils/format';
import { useEffect } from 'react';
import ImageUploadIcon from '../../assets/image_upload.svg';

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.white};
  padding-bottom: 80px;
  overflow-x: hidden;
`;

const PostHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.header};
  background-color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`;

const BackButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UploadButton = styled.button`
  background-color: ${({ disabled, theme }) => (disabled ? theme.colors.gray200 : theme.colors.primary)};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  padding: 6px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  transition: ${({ theme }) => theme.transitions.base};
  &:disabled {
    pointer-events: none;
  }
`;

const Content = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
`;

const AuthorAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors.gray100};
`;

const TextArea = styled.textarea`
  flex: 1;
  margin-top: 12px;
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.black};
  resize: none;
  line-height: 1.6;
  border: none;
  outline: none;
  overflow: hidden;

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray300};
  }
`;

const ImagePreviews = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  padding: 0 16px 16px 60px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  box-sizing: border-box;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ImagePreviewItem = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 300px;
  height: 200px;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const RemoveImageBtn = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
`;

/* 우측 하단 플로팅 카메라 버튼 */
const FloatingCameraBtn = styled.button`
  position: fixed;
  right: calc(50% - 195px + 16px);
  bottom: 24px;
  width: 48px;
  height: 48px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.base};
`;

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M15 18L9 12L15 6" stroke="#767676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MAX_IMAGES = 3;

const PostCreate = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const { user } = useAuth();
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [content]);

  useEffect(() => {
    if (isEdit && postId) {
      const loadPost = async () => {
        try {
          const data = await getPost(postId);
          const post = data.post;
          setContent(post.content);
          if (post.image) {
            const imgUrls = post.image
              .split(',')
              .filter(Boolean)
              .map((img) => ({
                url: getImageUrl(img.trim()),
                rawUrl: img.trim(),
                isNew: false,
              }));
            setImages(imgUrls);
          }
        } catch (err) {
          console.error(err);
        }
      };
      loadPost();
    }
  }, [isEdit, postId]);

  const isActive = content.trim() || images.length > 0;

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const remaining = MAX_IMAGES - images.length;
    const validFiles = files.slice(0, remaining);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, { url: reader.result, file, isNew: true }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!isActive || isLoading) return;
    setIsLoading(true);

    try {
      const imageUrls = [];
      for (const img of images) {
        if (img.isNew && img.file) {
          const data = await uploadImage(img.file);
          console.log(data);
          imageUrls.push(data.filename);
        } else if (img.rawUrl) {
          imageUrls.push(img.rawUrl);
        }
      }

      const imageString = imageUrls.join(',');
      console.log(imageUrls);

      if (isEdit) {
        await updatePost(postId, content, imageString);
      } else {
        await createPost(content, imageString);
      }

      navigate(-1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrapper>
      <PostHeader>
        <BackButton onClick={() => navigate(-1)}>
          <BackIcon />
        </BackButton>
        <UploadButton disabled={!isActive || isLoading} onClick={handleUpload}>
          {isLoading ? '업로드 중...' : isEdit ? '수정' : '업로드'}
        </UploadButton>
      </PostHeader>

      <Content>
        <AuthorAvatar
          src={getImageUrl(user?.image)}
          alt={user?.username}
          onError={(e) => {
            e.target.src = DEFAULT_PROFILE_IMAGE;
          }}
        />
        <TextArea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="게시글을 작성해주세요..."
          autoFocus
        />
      </Content>

      {images.length > 0 && (
        <ImagePreviews>
          {images.map((img, i) => (
            <ImagePreviewItem key={i}>
              <PreviewImage
                src={img.url}
                alt={`이미지 ${i + 1}`}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <RemoveImageBtn onClick={() => handleRemoveImage(i)}>✕</RemoveImageBtn>
            </ImagePreviewItem>
          ))}
        </ImagePreviews>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />

      {images.length < MAX_IMAGES && (
        <FloatingCameraBtn onClick={() => fileRef.current?.click()}>
          <img src={ImageUploadIcon} alt="이미지 업로드" width="28" height="28" />
        </FloatingCameraBtn>
      )}
    </Wrapper>
  );
};

export default PostCreate;
