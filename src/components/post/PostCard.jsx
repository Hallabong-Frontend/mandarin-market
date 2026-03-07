import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { likePost, unlikePost, deletePost, reportPost } from '../../api/post';
import { getImageUrl, formatDate, formatPrice } from '../../utils/format';
import { POST_PRODUCT_SEPARATOR } from '../../constants/common';
import Avatar from '../common/Avatar';
import BottomModal from '../common/BottomModal';
import AlertModal from '../common/AlertModal';
import HeartIconSvg from '../../assets/icons/icon-heart.svg?react';
import CommentIconSvg from '../../assets/icons/icon-message-circle.svg?react';
import MoreDotsIconSvg from '../../assets/icons/s-icon-more-vertical.svg?react';

const Card = styled.article`
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const UserInfo = styled.div`
  flex: 1;
  cursor: pointer;
`;

const Username = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.black};
`;

const AccountId = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray400};
  margin-top: 2px;
`;

const MoreButton = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
  margin-bottom: 12px;
  word-break: break-word;
  white-space: pre-wrap;
`;

const ImageContainer = styled.div`
  position: relative;
  margin-bottom: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  overflow: hidden;
`;

const PostImageWrapper = styled.div`
  position: relative;
  display: flex;
  gap: 0;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const PostImageSlide = styled.div`
  position: relative;
  width: 100%;
  height: 230px;
  flex-shrink: 0;
  scroll-snap-align: start;
`;

const PostImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  background-color: ${({ theme }) => theme.colors.gray100};
  cursor: pointer;
  display: block;
`;

const ProductBadge = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-size: 10px;
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  padding: 3px 8px;
  border-radius: 20px;
  letter-spacing: 0.3px;
  pointer-events: none;
`;

const ProductOverlay = styled.a`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 28px 12px 10px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.base} ${({ theme }) => theme.borderRadius.base};
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  text-decoration: none;
  cursor: ${({ $hasLink }) => ($hasLink ? 'pointer' : 'default')};
  pointer-events: ${({ $hasLink }) => ($hasLink ? 'auto' : 'none')};
`;

const ProductOverlayText = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProductOverlayArrow = styled.span`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
  flex-shrink: 0;
  margin-left: 8px;
  margin-bottom: 1px;
`;

const ProductOverlayName = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: #fff;
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductOverlayPrice = styled.p`
  font-size: 11px;
  color: #ffd8b8;
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  margin-top: 2px;
`;

const PaginationDots = styled.div`
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  justify-content: center;
  gap: 6px;
`;

const DotButton = styled.button`
  width: 6px;
  height: 6px;
  padding: 0;
  display: block;
  border-radius: 50%;
  background-color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.gray200)};
`;

const ActionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray400};
`;

const HeartIcon = styled(HeartIconSvg)`
  width: 20px;
  height: 20px;
  path {
    stroke: ${({ $liked }) => ($liked ? '#f26e22' : '#767676')};
    fill: ${({ $liked }) => ($liked ? '#f26e22' : 'none')};
  }
`;

const CommentIcon = () => <CommentIconSvg width="20" height="20" />;

const MoreDots = () => <MoreDotsIconSvg width="18" height="18" />;

const TimeText = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray300};
  margin-top: 16px;
`;

const PostCard = ({ post, onDelete }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const toast = useToast();
  const isDetailPage = location.pathname === `/post/${post.id}`;
  const [liked, setLiked] = useState(post.hearted);
  const [likeCount, setLikeCount] = useState(post.heartCount);
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageWrapperRef = useRef(null);
  const scrollEndTimerRef = useRef(null);

  const isMyPost = user?.accountname === post.author?.accountname;
  const images = post.image ? post.image.split(',').filter(Boolean).slice(0, 3) : [];

  const sepIdx = (post.content || '').indexOf(POST_PRODUCT_SEPARATOR);
  const displayContent = sepIdx === -1 ? post.content : post.content.slice(0, sepIdx);
  const productMeta = (() => {
    if (sepIdx === -1) return [];
    try { return JSON.parse(post.content.slice(sepIdx + POST_PRODUCT_SEPARATOR.length)); }
    catch { return []; }
  })();

  useEffect(() => {
    setCurrentImageIndex(0);
    if (imageWrapperRef.current) {
      imageWrapperRef.current.scrollTo({ left: 0 });
    }
  }, [post.id]);

  useEffect(() => {
    return () => {
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, []);

  const handleLike = async () => {
    try {
      if (liked) {
        await unlikePost(post.id);
        setLiked(false);
        setLikeCount((c) => c - 1);
      } else {
        await likePost(post.id);
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } catch (e) {
      console.error(e);
      toast.error('좋아요 처리에 실패했습니다.');
    }
  };

  const handleMore = () => setShowModal(true);

  const modalItems = isMyPost
    ? [
        {
          label: '삭제',
          danger: true,
          onClick: () => {
            setAlertType('delete');
            setShowAlert(true);
          },
        },
        {
          label: '수정',
          onClick: () => navigate(`/post/edit/${post.id}`),
        },
      ]
    : [
        {
          label: '신고하기',
          danger: true,
          onClick: () => {
            setAlertType('report');
            setShowAlert(true);
          },
        },
      ];

  const handleAlertConfirm = async () => {
    setShowAlert(false);
    if (alertType === 'delete') {
      try {
        await deletePost(post.id);
        onDelete?.(post.id);
      } catch (e) {
        console.error(e);
        toast.error('게시물 삭제에 실패했습니다.');
      }
    } else if (alertType === 'report') {
      try {
        await reportPost(post.id);
      } catch (e) {
        console.error(e);
        toast.error('신고에 실패했습니다.');
      }
    }
  };

  const handleGoProfile = () => {
    navigate(`/profile/${post.author?.accountname}`);
  };

  const handleGoDetail = () => {
    navigate(`/post/${post.id}`);
  };

  const handleImageScroll = () => {
    const wrapper = imageWrapperRef.current;
    if (!wrapper) return;
    if (scrollEndTimerRef.current) {
      clearTimeout(scrollEndTimerRef.current);
    }
    scrollEndTimerRef.current = setTimeout(() => {
      const imageWidth = wrapper.clientWidth;
      if (!imageWidth) return;
      const nextIndex = Math.round(wrapper.scrollLeft / imageWidth);
      const clampedIndex = Math.max(0, Math.min(images.length - 1, nextIndex));
      setCurrentImageIndex(clampedIndex);
    }, 90);
  };

  const handleDotClick = (index) => {
    const wrapper = imageWrapperRef.current;
    if (!wrapper) return;
    wrapper.scrollTo({
      left: wrapper.clientWidth * index,
      behavior: 'smooth',
    });
    setCurrentImageIndex(index);
  };

  return (
    <>
      <Card onClick={isDetailPage ? undefined : handleGoDetail}>
        <CardHeader>
          <Avatar
            src={post.author?.image}
            alt={post.author?.username}
            size="40px"
            onClick={(e) => {
              e.stopPropagation();
              handleGoProfile();
            }}
          />
          <UserInfo
            onClick={(e) => {
              e.stopPropagation();
              handleGoProfile();
            }}
          >
            <Username>{post.author?.username}</Username>
            <AccountId>@{post.author?.accountname}</AccountId>
          </UserInfo>
          <MoreButton
            onClick={(e) => {
              e.stopPropagation();
              handleMore();
            }}
            aria-label="more options">
            <MoreDots />
          </MoreButton>
        </CardHeader>

        {displayContent && <Content>{displayContent}</Content>}

        {images.length > 0 && (
          <ImageContainer>
            <PostImageWrapper ref={imageWrapperRef} onScroll={handleImageScroll}>
              {images.map((img, i) => {
                const productInfo = productMeta.find((p) => p.i === i);
                return (
                  <PostImageSlide key={i}>
                    <PostImage
                      src={getImageUrl(img.trim())}
                      alt={productInfo ? productInfo.name : `게시글 이미지 ${i + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDetailPage) handleGoDetail();
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    {productInfo && (
                      <>
                        <ProductBadge>상품</ProductBadge>
                        <ProductOverlay
                          href={productInfo.link || undefined}
                          target={productInfo.link ? '_blank' : undefined}
                          rel={productInfo.link ? 'noopener noreferrer' : undefined}
                          $hasLink={!!productInfo.link}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ProductOverlayText>
                            <ProductOverlayName>{productInfo.name}</ProductOverlayName>
                            <ProductOverlayPrice>{formatPrice(productInfo.price)}원</ProductOverlayPrice>
                          </ProductOverlayText>
                          {productInfo.link && <ProductOverlayArrow>↗</ProductOverlayArrow>}
                        </ProductOverlay>
                      </>
                    )}
                  </PostImageSlide>
                );
              })}
            </PostImageWrapper>
            {images.length > 1 && (
              <PaginationDots>
                {images.map((_, i) => (
                  <DotButton
                    key={i}
                    type="button"
                    $active={currentImageIndex === i}
                    aria-label={`go-to-image-${i + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDotClick(i);
                    }}
                  />
                ))}
              </PaginationDots>
            )}
          </ImageContainer>
        )}

        <ActionBar>
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
          >
            <HeartIcon $liked={liked} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </ActionButton>
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              if (!isDetailPage) handleGoDetail();
            }}
          >
            <CommentIcon />
            {post.commentCount > 0 && <span>{post.commentCount}</span>}
          </ActionButton>
        </ActionBar>
        <TimeText>{formatDate(post.createdAt)}</TimeText>
      </Card>

      <BottomModal isOpen={showModal} onClose={() => setShowModal(false)} items={modalItems} />

      <AlertModal
        isOpen={showAlert}
        title={alertType === 'delete' ? '게시글을 삭제할까요?' : '게시글을 신고할까요?'}
        description={
          alertType === 'delete' ? '삭제된 게시글은 복구할 수 없습니다.' : '신고된 게시글은 관리자가 검토합니다.'
        }
        confirmText={alertType === 'delete' ? '삭제' : '신고'}
        danger={true}
        onCancel={() => setShowAlert(false)}
        onConfirm={handleAlertConfirm}
      />
    </>
  );
};

export default PostCard;
