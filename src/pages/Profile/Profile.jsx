import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getUserProfile } from '../../api/user';
import { getMyProducts, deleteProduct } from '../../api/product';
import { getUserPosts } from '../../api/user';
import { followUser, unfollowUser } from '../../api/user';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl, formatPrice } from '../../utils/format';
import { getChatId, getOrCreateChat } from '../../firebase/chat';
import BottomTabNav from '../../components/common/BottomTabNav';
import BottomModal from '../../components/common/BottomModal';
import AlertModal from '../../components/common/AlertModal';
import PostCard from '../../components/post/PostCard';
import Spinner from '../../components/common/Spinner';
import Header from '../../components/common/Header';
import ListIconSvg from '../../assets/icons/icon-post-list-on.svg?react';
import AlbumIconSvg from '../../assets/icons/icon-post-album-on.svg?react';
import ChatIcon from '../../assets/icons/icon-message-circle.svg?react';
import ShareIcon from '../../assets/icons/icon-share.svg?react';

const Wrapper = styled.div`
  padding-bottom: 70px;
`;

/* 프로필 상단 영역 */
const ProfileSection = styled.div`
  padding: 24px 16px 16px;
`;

/* 팔로워/이미지/팔로잉 가로 배치 */
const UserInfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-bottom: 16px;
`;

const StatItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
`;

const StatNumber = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
`;

const StatLabel = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.gray400};
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors.gray100};
  border: 2px solid ${({ theme }) => theme.colors.border};
`;

const UserDetails = styled.div`
  text-align: center;
  margin-bottom: 16px;
`;

const Username = styled.h2`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 4px;
`;

const AccountId = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray400};
  margin-bottom: 8px;
`;

const Intro = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.gray500};
  line-height: 1.5;
`;

/* 버튼 영역: 채팅 | 팔로우 | 공유 */
const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
`;

const IconActionBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.white};
  transition: background-color 0.2s;
  &:hover {
    background-color: ${({ theme }) => theme.colors.gray100};
  }
`;

const FollowButton = styled.button`
  padding: 8px 28px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  transition: ${({ theme }) => theme.transitions.base};

  ${({ $following, theme }) =>
    $following
      ? `
      background-color: ${theme.colors.white};
      color: ${theme.colors.gray400};
      border: 1px solid ${theme.colors.gray200};
    `
      : `
      background-color: ${theme.colors.primary};
      color: ${theme.colors.white};
      border: 1px solid ${theme.colors.primary};
    `}
`;

const EditButton = styled.button`
  padding: 8px 24px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  color: ${({ theme }) => theme.colors.gray500};
  background: ${({ theme }) => theme.colors.white};
  transition: ${({ theme }) => theme.transitions.base};
  &:hover {
    background-color: ${({ theme }) => theme.colors.gray100};
  }
`;

const Divider = styled.div`
  height: 8px;
  background-color: ${({ theme }) => theme.colors.gray100};
`;

const Section = styled.section`
  padding: 16px;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 12px;
`;

const ProductList = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ProductCard = styled.div`
  flex-shrink: 0;
  width: 130px;
  cursor: pointer;
`;

const ProductImage = styled.img`
  width: 130px;
  height: 130px;
  border-radius: ${({ theme }) => theme.borderRadius.base};
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.gray100};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ProductName = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.sm};
  color: ${({ theme }) => theme.colors.black};
  margin-top: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductPrice = styled.p`
  font-size: ${({ theme }) => theme.fonts.size.xs};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
  margin-top: 2px;
`;

const PostToggle = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 8px;
`;

const ToggleBtn = styled.button`
  flex: 1;
  padding: 10px;
  display: flex;
  justify-content: center;
  border-bottom: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  transition: ${({ theme }) => theme.transitions.base};
`;

const AlbumGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
`;

const AlbumItem = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.gray100};
  cursor: pointer;
`;

const ListIcon = styled(ListIconSvg)`
  width: 26px;
  height: 26px;
  path {
    stroke: ${({ $viewMode }) => ($viewMode === 'list' ? '#F26E22' : '#FFC7A7')};
    fill: ${({ $viewMode }) => ($viewMode === 'list' ? '#F26E22' : '#FFC7A7')};
  }
`;

const AlbumIcon = styled(AlbumIconSvg)`
  width: 26px;
  height: 26px;
  path {
    stroke: ${({ $viewMode }) => ($viewMode === 'album' ? '#F26E22' : '#FFC7A7')};
    fill: ${({ $viewMode }) => ($viewMode === 'album' ? '#F26E22' : '#FFC7A7')};
  }
`;

const Profile = () => {
  const navigate = useNavigate();
  const { accountname } = useParams();
  const { user: me, logout } = useAuth();

  const isMyProfile = me?.accountname === accountname;

  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [following, setFollowing] = useState(false);
  const [showHeaderModal, setShowHeaderModal] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteProductAlert, setShowDeleteProductAlert] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [profileData, postsData, productsData] = await Promise.all([
        getUserProfile(accountname),
        getUserPosts(accountname),
        getMyProducts(accountname),
      ]);

      setProfile(profileData.profile);
      setFollowing(profileData.profile.isfollow);
      setPosts(postsData.post || []);
      setProducts(productsData.product || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [accountname]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFollow = async () => {
    try {
      if (following) {
        await unfollowUser(accountname);
        setFollowing(false);
        setProfile((p) => ({ ...p, followerCount: p.followerCount - 1 }));
      } else {
        await followUser(accountname);
        setFollowing(true);
        setProfile((p) => ({ ...p, followerCount: p.followerCount + 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductClick = (product) => {
    if (isMyProfile) {
      setSelectedProduct(product);
      setShowProductModal(true);
    } else {
      window.open(product.link, '_blank');
    }
  };

  const handleChat = async () => {
    const chatId = getChatId(me.accountname, profile.accountname);
    await getOrCreateChat(
      chatId,
      { accountname: me.accountname, username: me.username, image: me.image },
      { accountname: profile.accountname, username: profile.username, image: profile.image },
    );
    navigate(`/chat/${chatId}`);
  };

  const handleDeleteProduct = async () => {
    setShowDeleteProductAlert(false);
    try {
      await deleteProduct(selectedProduct.id);
      setProducts((p) => p.filter((item) => item.id !== selectedProduct.id));
    } catch (err) {
      console.error(err);
    }
  };

  const productModalItems = [
    {
      label: '삭제',
      danger: true,
      onClick: () => {
        setShowProductModal(false);
        setShowDeleteProductAlert(true);
      },
    },
    {
      label: '수정',
      onClick: () => navigate(`/product/edit/${selectedProduct?.id}`),
    },
    {
      label: '웹사이트에서 상품 보기',
      onClick: () => window.open(selectedProduct?.link, '_blank'),
    },
  ];

  const headerModalItems = isMyProfile
    ? [
        { label: '설정 및 개인정보', onClick: () => {} },
        { label: '로그아웃', danger: true, onClick: () => setShowLogoutAlert(true) },
      ]
    : [];

  if (isLoading) return <Spinner />;
  if (!profile) return null;

  const postsWithImages = posts.filter((p) => p.image);

  return (
    <>
      <Wrapper>
        <Header type="back-more" onMore={isMyProfile ? () => setShowHeaderModal(true) : undefined} />

        <ProfileSection>
          {/* 팔로워 | 프로필 이미지 | 팔로잉 */}
          <UserInfoRow>
            <StatItem onClick={() => navigate(`/profile/${accountname}/follower`)}>
              <StatNumber>{profile.followerCount}</StatNumber>
              <StatLabel>followers</StatLabel>
            </StatItem>

            <Avatar
              src={getImageUrl(profile.image)}
              alt={profile.username}
              onError={(e) => {
                e.target.src = 'https://dev.wenivops.co.kr/services/mandarin/Ellipse.png';
              }}
            />

            <StatItem onClick={() => navigate(`/profile/${accountname}/following`)}>
              <StatNumber>{profile.followingCount}</StatNumber>
              <StatLabel>followings</StatLabel>
            </StatItem>
          </UserInfoRow>

          {/* 이름 / 계정ID / 소개 */}
          <UserDetails>
            <Username>{profile.username}</Username>
            <AccountId>@ {profile.accountname}</AccountId>
            {profile.intro && <Intro>{profile.intro}</Intro>}
          </UserDetails>

          {/* 액션 버튼 */}
          {isMyProfile ? (
            <ActionButtons>
              <EditButton onClick={() => navigate('/profile/edit')}>프로필 수정</EditButton>
              <EditButton onClick={() => navigate('/product/register')}>상품 등록</EditButton>
            </ActionButtons>
          ) : (
            <ActionButtons>
              <IconActionBtn onClick={handleChat}>
                <ChatIcon />
              </IconActionBtn>
              <FollowButton $following={following} onClick={handleFollow}>
                {following ? '언팔로우' : '팔로우'}
              </FollowButton>
              <IconActionBtn>
                <ShareIcon />
              </IconActionBtn>
            </ActionButtons>
          )}
        </ProfileSection>

        {products.length > 0 && (
          <>
            <Divider />
            <Section>
              <SectionTitle>판매 중인 상품</SectionTitle>
              <ProductList>
                {products.map((product) => (
                  <ProductCard key={product.id} onClick={() => handleProductClick(product)}>
                    <ProductImage
                      src={getImageUrl(product.itemImage)}
                      alt={product.itemName}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/130?text=No+Image';
                      }}
                    />
                    <ProductName>{product.itemName}</ProductName>
                    <ProductPrice>{formatPrice(product.price)}원</ProductPrice>
                  </ProductCard>
                ))}
              </ProductList>
            </Section>
          </>
        )}

        <Divider />

        <Section>
          <PostToggle>
            <ToggleBtn $active={viewMode === 'list'} onClick={() => setViewMode('list')}>
              <ListIcon $viewMode={viewMode} />
            </ToggleBtn>
            <ToggleBtn $active={viewMode === 'album'} onClick={() => setViewMode('album')}>
              <AlbumIcon $viewMode={viewMode} />
            </ToggleBtn>
          </PostToggle>

          {viewMode === 'list' ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={(id) => setPosts((p) => p.filter((item) => item.id !== id))}
              />
            ))
          ) : (
            <AlbumGrid>
              {postsWithImages.map((post) => {
                const firstImage = post.image.split(',')[0].trim();
                return (
                  <AlbumItem
                    key={post.id}
                    src={getImageUrl(firstImage)}
                    alt="게시글 이미지"
                    onClick={() => navigate(`/post/${post.id}`)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                );
              })}
            </AlbumGrid>
          )}
        </Section>
      </Wrapper>

      <BottomTabNav />

      <BottomModal isOpen={showHeaderModal} onClose={() => setShowHeaderModal(false)} items={headerModalItems} />

      <BottomModal isOpen={showProductModal} onClose={() => setShowProductModal(false)} items={productModalItems} />

      <AlertModal
        isOpen={showLogoutAlert}
        title="로그아웃"
        description="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        danger
        onCancel={() => setShowLogoutAlert(false)}
        onConfirm={() => {
          logout();
          navigate('/login', { replace: true });
        }}
      />

      <AlertModal
        isOpen={showDeleteProductAlert}
        title="상품을 삭제할까요?"
        description="삭제된 상품은 복구할 수 없습니다."
        confirmText="삭제"
        danger
        onCancel={() => setShowDeleteProductAlert(false)}
        onConfirm={handleDeleteProduct}
      />
    </>
  );
};

export default Profile;
