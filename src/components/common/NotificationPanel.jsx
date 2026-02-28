import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserPosts } from '../../api/user';
import { getImageUrl, formatTimeAgo } from '../../utils/format';
import HeartIconSvg from '../../assets/icons/icon-heart.svg?react';
import FullPagePanel from './FullPagePanel';

const HeartIcon = styled(HeartIconSvg)`
  width: 22px;
  height: 22px;
  path {
    stroke: ${({ theme }) => theme.colors.black};
  }
`;

const NotificationEmpty = styled.p`
  text-align: center;
  margin-top: 60px;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray400};
`;

const NotifItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  text-align: left;
  cursor: pointer;
  &:hover {
    opacity: 0.75;
  }
`;

const NotifPostImg = styled.img`
  width: 46px;
  height: 46px;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  object-fit: cover;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors.gray100};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const NotifPostImgPlaceholder = styled.div`
  width: 46px;
  height: 46px;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  background-color: ${({ theme }) => theme.colors.gray100};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const NotifContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotifText = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.black};
  line-height: 1.4;
  word-break: keep-all;
`;

const NotifBold = styled.span`
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

const NotifTime = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray400};
  margin-top: 2px;
`;

const NotificationPanel = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user?.accountname) return;

    setLoading(true);
    getUserPosts(user.accountname)
      .then((data) => {
        const allPosts = data.post || [];
        setPosts(allPosts.filter((p) => p.heartCount > 0 || p.commentCount > 0));
      })
      .catch((err) => console.error('[알림] API 오류:', err))
      .finally(() => setLoading(false));
  }, [isOpen, user?.accountname]);

  return (
    <FullPagePanel isOpen={isOpen} onClose={onClose} title="알림">
      {loading ? (
        <NotificationEmpty>불러오는 중...</NotificationEmpty>
      ) : posts.length === 0 ? (
          <NotificationEmpty>새로운 알림이 없습니다.</NotificationEmpty>
        ) : (
          posts.map((post) => {
            const firstImage = post.image ? post.image.split(',')[0].trim() : null;
            const preview = post.content
              ? post.content.length > 20
                ? post.content.slice(0, 20) + '...'
                : post.content
              : '게시물';
            return (
              <NotifItem
                key={post.id}
                onClick={() => {
                  onClose();
                  navigate(`/post/${post.id}`);
                }}
              >
                {firstImage ? (
                  <NotifPostImg
                    src={getImageUrl(firstImage)}
                    alt="게시물 이미지"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <NotifPostImgPlaceholder>
                    <HeartIcon style={{ width: 20, height: 20, opacity: 0.3 }} />
                  </NotifPostImgPlaceholder>
                )}
                <NotifContent>
                  <NotifText>
                    &ldquo;{preview}&rdquo; 게시물에{' '}
                    {post.heartCount > 0 && <NotifBold>좋아요 {post.heartCount}개</NotifBold>}
                    {post.heartCount > 0 && post.commentCount > 0 && ', '}
                    {post.commentCount > 0 && <NotifBold>댓글 {post.commentCount}개</NotifBold>}
                    가 달렸어요.
                  </NotifText>
                  <NotifTime>{formatTimeAgo(post.updatedAt)}</NotifTime>
                </NotifContent>
              </NotifItem>
            );
          })
      )}
    </FullPagePanel>
  );
};

export default NotificationPanel;
