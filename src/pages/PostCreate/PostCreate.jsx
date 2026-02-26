import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { createPost, updatePost, getPost } from '../../api/post';
import { uploadImage } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl, DEFAULT_PROFILE_IMAGE } from '../../utils/format';
import { useEffect } from 'react';
import ImageIcon from '../../assets/icons/icon-image.svg?react';
import AlertModal from '../../components/common/AlertModal';
import Header from '../../components/common/Header';

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.white};
  padding-bottom: 80px;
  overflow-x: hidden;
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
  max-height: 40vh;
  overflow-y: auto;

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
  const [removeTargetIndex, setRemoveTargetIndex] = useState(null);

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
    setRemoveTargetIndex(index);
  };

  const confirmRemoveImage = () => {
    setImages((prev) => prev.filter((_, i) => i !== removeTargetIndex));
    setRemoveTargetIndex(null);
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
      <Header
        type="back-title-upload"
        uploadDisabled={!isActive || isLoading}
        onUpload={handleUpload}
        uploadText={isLoading ? '업로드 중...' : isEdit ? '수정' : '업로드'}
      />

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
          <ImageIcon width="28" height="28" />
        </FloatingCameraBtn>
      )}

      <AlertModal
        isOpen={removeTargetIndex !== null}
        title="사진 삭제"
        description="사진을 삭제하시겠습니까?"
        confirmText="삭제"
        onCancel={() => setRemoveTargetIndex(null)}
        onConfirm={confirmRemoveImage}
        danger
      />
    </Wrapper>
  );
};

export default PostCreate;
