import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { createPost, updatePost, getPost } from '../../api/post';
import { uploadImage } from '../../api/auth';
import { getMyProducts } from '../../api/product';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl, formatPrice, DEFAULT_PROFILE_IMAGE } from '../../utils/format';
import { IMAGE_BASE_URL } from '../../constants/url';
import ImageIcon from '../../assets/icons/icon-image.svg?react';
import AlertModal from '../../components/common/AlertModal';
import Header from '../../components/common/Header';
import { POST_PRODUCT_SEPARATOR, AI_DESC_SEPARATOR } from '../../constants/common';

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.white};
  padding-bottom: 88px;
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
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const TextArea = styled.textarea`
  flex: 1;
  min-height: 120px;
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.black};
  resize: none;
  line-height: 1.6;
  border: none;
  outline: none;
  background: transparent;
  max-height: 44vh;
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
  height: ${({ $isProduct }) => ($isProduct ? 'auto' : '200px')};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  overflow: hidden;
  ${({ $isProduct, theme }) =>
    $isProduct &&
    `border: 1.5px solid ${theme.colors.primary};`}
`;

const PreviewImage = styled.img`
  width: 100%;
  height: ${({ $isProduct }) => ($isProduct ? '160px' : '100%')};
  object-fit: cover;
  border-radius: ${({ $isProduct, theme }) => ($isProduct ? '0' : theme.borderRadius.base)};
  border: ${({ $isProduct, theme }) => ($isProduct ? 'none' : `1px solid ${theme.colors.border}`)};
  display: block;
`;

const ProductBadge = styled.span`
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-size: 10px;
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  padding: 3px 8px;
  border-radius: 20px;
  letter-spacing: 0.3px;
`;

const ProductInfoBar = styled.div`
  padding: 8px 12px 10px;
  background-color: ${({ theme }) => theme.colors.white};
  border-top: 1px solid ${({ theme }) => theme.colors.primary}33;
`;

const ProductInfoName = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.black};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductInfoPrice = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  margin-top: 2px;
`;

const RemoveImageBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 14px;
`;

const FloatingBtnGroup = styled.div`
  position: fixed;
  right: calc(50% - 195px + 16px);
  bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`;

const FloatingBtn = styled.button`
  width: 52px;
  height: 52px;
  background-color: ${({ theme }) => theme.colors.primary};
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.base};
`;

const ProductBtnIcon = styled.span`
  font-size: 22px;
  line-height: 1;
`;

/* ── 상품 피커 모달 ── */

const PickerOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const PickerSheet = styled.div`
  width: 100%;
  max-width: 390px;
  max-height: 65vh;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
`;

const PickerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
`;

const PickerTitle = styled.h2`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
`;

const PickerCloseBtn = styled.button`
  font-size: 22px;
  color: ${({ theme }) => theme.colors.gray300};
  line-height: 1;
`;

const PickerBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const ProductPickerCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  background: none;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ProductPickerImg = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.gray100};
`;

const ProductPickerInfo = styled.div`
  padding: 8px 10px;
  width: 100%;
`;

const ProductPickerName = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.black};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductPickerPrice = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  margin-top: 2px;
`;

const PickerMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.gray300};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  padding: 40px 0;
`;

const MAX_IMAGES = 3;

/* content에서 텍스트와 상품 메타 배열을 분리 */
const parsePostContent = (content) => {
  if (!content) return ['', []];
  const sepIdx = content.indexOf(POST_PRODUCT_SEPARATOR);
  if (sepIdx === -1) return [content, []];
  try {
    return [
      content.slice(0, sepIdx),
      JSON.parse(content.slice(sepIdx + POST_PRODUCT_SEPARATOR.length)),
    ];
  } catch {
    return [content, []];
  }
};

/* 절대 URL에서 상대 경로를 추출해 API에 저장 가능한 rawUrl을 반환 */
const toRawUrl = (url) => {
  if (!url) return '';
  const prefix = IMAGE_BASE_URL + '/';
  if (url.startsWith(prefix)) return url.slice(prefix.length);
  return url;
};

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

  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [myProducts, setMyProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

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
          const [textContent, productMeta] = parsePostContent(post.content);
          setContent(textContent);
          if (post.image) {
            const imgUrls = post.image
              .split(',')
              .filter(Boolean)
              .slice(0, MAX_IMAGES)
              .map((img, i) => {
                const productInfo = productMeta.find((p) => p.i === i);
                return {
                  url: getImageUrl(img.trim()),
                  rawUrl: img.trim(),
                  isNew: false,
                  ...(productInfo
                    ? { isProduct: true, productName: productInfo.name, productPrice: productInfo.price, productLink: productInfo.link || '' }
                    : {}),
                };
              });
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
    if (remaining <= 0) {
      e.target.value = '';
      return;
    }

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

  const handleOpenProductPicker = async () => {
    setIsProductPickerOpen(true);
    if (myProducts.length > 0) return;
    setIsLoadingProducts(true);
    try {
      const data = await getMyProducts(user.accountname);
      setMyProducts(data?.product ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSelectProduct = (product) => {
    if (images.length >= MAX_IMAGES) return;
    const rawUrl = toRawUrl(product.itemImage);
    setImages((prev) => [
      ...prev,
      {
        url: getImageUrl(product.itemImage),
        rawUrl,
        isNew: false,
        isProduct: true,
        productName: product.itemName.split(AI_DESC_SEPARATOR)[0].trim(),
        productPrice: product.price,
        productLink: product.link || '',
      },
    ]);
    setIsProductPickerOpen(false);
  };

  const handleUpload = async () => {
    if (!isActive || isLoading) return;
    setIsLoading(true);

    try {
      const imageUrls = [];
      for (const img of images.slice(0, MAX_IMAGES)) {
        if (img.isNew && img.file) {
          const data = await uploadImage(img.file);
          imageUrls.push(data.filename);
        } else if (img.rawUrl) {
          imageUrls.push(img.rawUrl);
        }
      }

      const imageString = imageUrls.join(',');

      const productMeta = images.slice(0, MAX_IMAGES).reduce((acc, img, idx) => {
        if (img.isProduct) acc.push({ i: idx, name: img.productName, price: img.productPrice, link: img.productLink || '' });
        return acc;
      }, []);
      const finalContent =
        productMeta.length > 0
          ? content + POST_PRODUCT_SEPARATOR + JSON.stringify(productMeta)
          : content;

      if (isEdit) {
        await updatePost(postId, finalContent, imageString);
        navigate(`/post/${postId}`);
      } else {
        const data = await createPost(finalContent, imageString);
        const createdPostId = data?.post?.id;
        if (createdPostId) {
          navigate(`/post/${createdPostId}`);
        } else {
          navigate('/feed');
        }
      }
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
          placeholder="게시글 입력하기..."
          autoFocus
        />
      </Content>

      {images.length > 0 && (
        <ImagePreviews>
          {images.map((img, i) => (
            <ImagePreviewItem key={i} $isProduct={!!img.isProduct}>
              <PreviewImage
                $isProduct={!!img.isProduct}
                src={img.url}
                alt={img.isProduct ? img.productName : `이미지 ${i + 1}`}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              {img.isProduct && (
                <>
                  <ProductBadge>상품</ProductBadge>
                  <ProductInfoBar>
                    <ProductInfoName>{img.productName}</ProductInfoName>
                    <ProductInfoPrice>{formatPrice(img.productPrice)}원</ProductInfoPrice>
                  </ProductInfoBar>
                </>
              )}
              <RemoveImageBtn type="button" onClick={() => handleRemoveImage(i)}>
                ×
              </RemoveImageBtn>
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
        <FloatingBtnGroup>
          <FloatingBtn type="button" onClick={handleOpenProductPicker} aria-label="내 상품 불러오기">
            <ProductBtnIcon>🛍️</ProductBtnIcon>
          </FloatingBtn>
          <FloatingBtn type="button" onClick={() => fileRef.current?.click()} aria-label="사진 추가">
            <ImageIcon width="28" height="28" />
          </FloatingBtn>
        </FloatingBtnGroup>
      )}

      {isProductPickerOpen && (
        <PickerOverlay onClick={() => setIsProductPickerOpen(false)}>
          <PickerSheet onClick={(e) => e.stopPropagation()}>
            <PickerHeader>
              <PickerTitle>내 상품 불러오기</PickerTitle>
              <PickerCloseBtn type="button" onClick={() => setIsProductPickerOpen(false)}>
                ×
              </PickerCloseBtn>
            </PickerHeader>
            <PickerBody>
              {isLoadingProducts ? (
                <PickerMessage>불러오는 중...</PickerMessage>
              ) : myProducts.length === 0 ? (
                <PickerMessage>등록된 상품이 없습니다.</PickerMessage>
              ) : (
                <ProductGrid>
                  {myProducts.map((product) => (
                    <ProductPickerCard
                      key={product.id}
                      type="button"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <ProductPickerImg
                        src={getImageUrl(product.itemImage)}
                        alt={product.itemName}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/140?text=No+Image';
                        }}
                      />
                      <ProductPickerInfo>
                        <ProductPickerName>{product.itemName.split(AI_DESC_SEPARATOR)[0].trim()}</ProductPickerName>
                        <ProductPickerPrice>{formatPrice(product.price)}원</ProductPickerPrice>
                      </ProductPickerInfo>
                    </ProductPickerCard>
                  ))}
                </ProductGrid>
              )}
            </PickerBody>
          </PickerSheet>
        </PickerOverlay>
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
