import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { likePost, unlikePost, deletePost, reportPost } from '../../api/post';
import { getImageUrl, formatTimeAgo, DEFAULT_PROFILE_IMAGE } from '../../utils/format';
import BottomModal from '../common/BottomModal';
import AlertModal from '../common/AlertModal';
import HeartIconSvg from '../../assets/icons/icon-heart.svg';
import CommentIconSvg from '../../assets/icons/icon-message-circle.svg';
import MoreDotsIconSvg from '../../assets/icons/s-icon-more-vertical.svg';

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

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.gray100};
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
  margin-bottom: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  overflow: hidden;
`;

const PostImageWrapper = styled.div`
  position: relative;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const PostImage = styled.img`
  width: 100%;
  height: 230px;
  object-fit: cover;
  flex-shrink: 0;
  scroll-snap-align: start;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  background-color: ${({ theme }) => theme.colors.gray100};
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

const HeartIcon = () => <img src={HeartIconSvg} alt="" width="20" height="20" />;

const CommentIcon = () => <img src={CommentIconSvg} alt="" width="20" height="20" />;

const MoreDots = () => <img src={MoreDotsIconSvg} alt="" width="18" height="18" />;

const TimeText = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray300};
  margin-left: auto;
`;

const PostCard = ({ post, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.hearted);
  const [likeCount, setLikeCount] = useState(post.heartCount);
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('');

  const isMyPost = user?.accountname === post.author?.accountname;
  const images = post.image ? post.image.split(',').filter(Boolean) : [];

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
      }
    } else if (alertType === 'report') {
      try {
        await reportPost(post.id);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleGoProfile = () => {
    navigate(`/profile/${post.author?.accountname}`);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <Avatar
            src={getImageUrl(post.author?.image)}
            alt={post.author?.username}
            onClick={handleGoProfile}
            onError={(e) => {
              e.target.src = DEFAULT_PROFILE_IMAGE;
            }}
          />
          <UserInfo onClick={handleGoProfile}>
            <Username>{post.author?.username}</Username>
            <AccountId>@{post.author?.accountname}</AccountId>
          </UserInfo>
          <MoreButton onClick={handleMore} aria-label="더보기">
            <MoreDots />
          </MoreButton>
        </CardHeader>

        {post.content && <Content>{post.content}</Content>}

        {images.length > 0 && (
          <ImageContainer>
            <PostImageWrapper>
              {images.map((img, i) => (
                <PostImage
                  key={i}
                  src={getImageUrl(img.trim())}
                  alt={`게시글 이미지 ${i + 1}`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ))}
            </PostImageWrapper>
          </ImageContainer>
        )}

        <ActionBar>
          <ActionButton onClick={handleLike}>
            <HeartIcon liked={liked} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </ActionButton>
          <ActionButton onClick={() => navigate(`/post/${post.id}`)}>
            <CommentIcon />
            {post.commentCount > 0 && <span>{post.commentCount}</span>}
          </ActionButton>
          <TimeText>{formatTimeAgo(post.createdAt)}</TimeText>
        </ActionBar>
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
