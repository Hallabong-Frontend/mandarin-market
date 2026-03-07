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
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import EmptyLogoSvg from '../../assets/icons/icon-logo-gray.svg?react';
const Wrapper = styled.div`
  padding-bottom: 70px;
`;

const SearchButton = styled.button`
  width: 120px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
`;

/* 빈 피드 상태용 연한 감귤 로고 */
const EmptyLogo = () => <EmptyLogoSvg width="100" height="100" />;

const Feed = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toast = useToast();
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
      toast.error('피드를 불러오지 못했습니다.');
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
          <EmptyState text="유저를 검색해 팔로우 해보세요!" height="calc(100vh - 130px)">
            <EmptyLogo />
            <SearchButton onClick={() => navigate('/search')}>검색하기</SearchButton>
          </EmptyState>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} onDelete={handleDelete} />)
        )}
      </Wrapper>

      <BottomTabNav />

      <BottomModal isOpen={showHeaderModal} onClose={() => setShowHeaderModal(false)} items={headerModalItems} />

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
