import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getFeedPosts } from '../../api/post';
import PostCard from '../../components/post/PostCard';
import BottomTabNav from '../../components/common/BottomTabNav';
import BottomModal from '../../components/common/BottomModal';
import AlertModal from '../../components/common/AlertModal';
import Spinner from '../../components/common/Spinner';
import Header from '../../components/common/Header';
import { useAuth } from '../../context/AuthContext';

const Wrapper = styled.div`
  padding-bottom: 70px;
`;

const EmptyFeed = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 32px 40px;
  gap: 16px;
`;

const EmptyText = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.gray400};
  text-align: center;
`;

const SearchButton = styled.button`
  padding: 12px 36px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
`;

/* 빈 피드 상태용 연한 감귤 로고 */
const EmptyLogo = () => (
  <svg width="80" height="92" viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 16 C50 16 40 4 28 9 C28 9 38 7 44 20 Z" fill="#DBDBDB" />
    <path d="M50 16 C50 16 60 4 72 9 C72 9 62 7 56 20 Z" fill="#DBDBDB" />
    <circle cx="50" cy="62" r="36" fill="#DBDBDB" />
    <ellipse cx="50" cy="60" rx="24" ry="22" fill="white" />
    <path d="M38 78 L32 92 L50 82 Z" fill="white" />
    <circle cx="42" cy="60" r="3" fill="#DBDBDB" />
    <circle cx="50" cy="60" r="3" fill="#DBDBDB" />
    <circle cx="58" cy="60" r="3" fill="#DBDBDB" />
  </svg>
);

const Feed = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHeaderModal, setShowHeaderModal] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const loadPosts = useCallback(async () => {
    try {
      const data = await getFeedPosts();
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const headerModalItems = [
    { label: '설정 및 개인정보', onClick: () => {} },
    { label: '로그아웃', danger: true, onClick: () => setShowLogoutAlert(true) },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <Wrapper>
        <Header type="logo-search" logo="감귤마켓 피드" onSearch={() => navigate('/search')} />

        {isLoading ? (
          <Spinner />
        ) : posts.length === 0 ? (
          <EmptyFeed>
            <EmptyLogo />
            <EmptyText>유저를 검색해 팔로우 해보세요!</EmptyText>
            <SearchButton onClick={() => navigate('/search')}>검색하기</SearchButton>
          </EmptyFeed>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} />
          ))
        )}
      </Wrapper>

      <BottomTabNav />

      <BottomModal
        isOpen={showHeaderModal}
        onClose={() => setShowHeaderModal(false)}
        items={headerModalItems}
      />

      <AlertModal
        isOpen={showLogoutAlert}
        title="로그아웃"
        description="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        danger
        onCancel={() => setShowLogoutAlert(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default Feed;
