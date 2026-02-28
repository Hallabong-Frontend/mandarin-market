import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserProfile, getUserPosts, followUser, unfollowUser } from '../../api/user';
import { getMyProducts, deleteProduct } from '../../api/product';
import { getMyInfo } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeModeContext';
import { getChatId, getOrCreateChat } from '../../firebase/chat';

import BottomTabNav from '../../components/common/BottomTabNav';
import BottomModal from '../../components/common/BottomModal';
import AlertModal from '../../components/common/AlertModal';
import Spinner from '../../components/common/Spinner';
import Header from '../../components/common/Header';
import Divider from '../../components/common/Divider';

import ProfileInfo from '../../components/profile/ProfileInfo';
import ProfileProductList from '../../components/profile/ProfileProductList';
import ProfilePostSection from '../../components/profile/ProfilePostSection';
import ProfileSettingsModal from '../../components/profile/ProfileSettingsModal';

import styled from 'styled-components';
import ImageLayersIconSvg from '../../assets/icons/iccon-img-layers.svg?react';
import ListIconSvg from '../../assets/icons/icon-post-list-on.svg?react';
import AlbumIconSvg from '../../assets/icons/icon-post-album-on.svg?react';

const Wrapper = styled.div`
  padding-bottom: 70px;
`;

const ProfileSection = styled.div`
  padding: 24px 16px 16px;
`;

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

const Section = styled.section`
  padding: 16px;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fonts.size.base};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  font-family: 'GangwonEducationTteontteon';
  color: ${({ theme }) => theme.colors.black};
  margin-top: 10px;
  line-height: 1;
`;

const ProductSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ProductNavButtons = styled.div`
  display: flex;
  gap: 6px;
`;

const ProductNavButton = styled.button`
  position: relative;
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray500};
  display: block;
  & > svg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 5px;
    height: 8px;
  }
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

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const SettingLabel = styled.span`
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.text};
`;

const ThemeToggle = styled.button`
  position: relative;
  width: 52px;
  height: 30px;
  border-radius: 999px;
  background-color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.gray300)};
  transition: ${({ theme }) => theme.transitions.base};
`;

const ThemeToggleKnob = styled.span`
  position: absolute;
  top: 3px;
  left: ${({ $active }) => ($active ? '25px' : '3px')};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #fff;
  transition: ${({ theme }) => theme.transitions.base};
`;

const PrivacyToggleRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fonts.size.base};
`;

const PrivacyChevron = styled.span`
  color: ${({ theme }) => theme.colors.gray400};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const PrivacyDetails = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 12px 0 4px;
`;

const PrivacyItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
`;

const PrivacyKey = styled.span`
  color: ${({ theme }) => theme.colors.gray400};
  font-size: ${({ theme }) => theme.fonts.size.sm};
`;

const PrivacyValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fonts.size.sm};
  word-break: break-all;
  text-align: right;
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

const AlbumItemWrap = styled.button`
  position: relative;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
`;

const AlbumItem = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.gray100};
`;

const AlbumLayersBadge = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  line-height: 0;
`;

const AlbumLayersIcon = styled(ImageLayersIconSvg)`
  width: 16px;
  height: 16px;
`;

const ListIcon = styled(ListIconSvg)`
  width: 22px;
  height: 22px;
  path {
    stroke: ${({ $viewMode }) => ($viewMode === 'list' ? '#F26E22' : '#FFC7A7')};
    fill: ${({ $viewMode }) => ($viewMode === 'list' ? '#F26E22' : '#FFC7A7')};
  }
`;

const AlbumIcon = styled(AlbumIconSvg)`
  width: 22px;
  height: 22px;
  path {
    stroke: ${({ $viewMode }) => ($viewMode === 'album' ? '#F26E22' : '#FFC7A7')};
    fill: ${({ $viewMode }) => ($viewMode === 'album' ? '#F26E22' : '#FFC7A7')};
  }
`;

const Profile = () => {
  const navigate = useNavigate();
  const { accountname } = useParams();
  const { user: me, logout } = useAuth();
  const { isDark, toggleMode } = useThemeMode();

  const isMyProfile = me?.accountname === accountname;

  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [following, setFollowing] = useState(false);

  // Modals state
  const [showHeaderModal, setShowHeaderModal] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [privacyEmail, setPrivacyEmail] = useState('');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteProductAlert, setShowDeleteProductAlert] = useState(false);

  const productListRef = useRef(null);

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

  useEffect(() => {
    if (!showPrivacyInfo) return;

    const loadPrivacyEmail = async () => {
      const savedEmail = localStorage.getItem('user_email') || '';
      if (savedEmail) {
        setPrivacyEmail(savedEmail);
      }
      if (me?.email) {
        setPrivacyEmail(me.email);
      }
      try {
        const data = await getMyInfo();
        const fetchedUser = data.user ?? data;
        const fetchedEmail = fetchedUser?.email || '';
        if (fetchedEmail) {
          setPrivacyEmail(fetchedEmail);
          localStorage.setItem('user_email', fetchedEmail);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadPrivacyEmail();
  }, [showPrivacyInfo, me?.email]);

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

  const scrollProductList = (direction) => {
    const listEl = productListRef.current;
    if (!listEl) return;
    const cardWidthWithGap = 142;
    listEl.scrollBy({
      left: direction * cardWidthWithGap * 2,
      behavior: 'smooth',
    });
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

  const headerModalItems = [
    { label: '설정 및 개인정보', onClick: () => setShowSettingsModal(true) },
    { label: '로그아웃', danger: true, onClick: () => setShowLogoutAlert(true) },
  ];

  if (isLoading) return <Spinner />;
  if (!profile) return null;

  return (
    <>
      <Wrapper>
        <Header type="back-more" onMore={() => setShowHeaderModal(true)} />

        <ProfileInfo
          profile={profile}
          isMyProfile={isMyProfile}
          following={following}
          handleFollow={handleFollow}
          handleChat={handleChat}
        />

        {products.length > 0 && (
          <>
            <Divider />
            <ProfileProductList
              products={products}
              productListRef={productListRef}
              handleProductClick={handleProductClick}
              scrollProductList={scrollProductList}
            />
          </>
        )}

        <Divider />

        <ProfilePostSection posts={posts} viewMode={viewMode} setViewMode={setViewMode} setPosts={setPosts} />
      </Wrapper>

      <BottomTabNav />

      <BottomModal isOpen={showHeaderModal} onClose={() => setShowHeaderModal(false)} items={headerModalItems} />

      <ProfileSettingsModal
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        isDark={isDark}
        toggleMode={toggleMode}
        showPrivacyInfo={showPrivacyInfo}
        setShowPrivacyInfo={setShowPrivacyInfo}
        privacyEmail={privacyEmail}
        me={me}
      />

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

export {
  Wrapper,
  ProfileSection,
  UserInfoRow,
  StatItem,
  StatNumber,
  StatLabel,
  UserDetails,
  Username,
  AccountId,
  Intro,
  ActionButtons,
  IconActionBtn,
  FollowButton,
  EditButton,
  Section,
  SectionTitle,
  ProductSectionHeader,
  ProductNavButtons,
  ProductNavButton,
  ProductList,
  ProductCard,
  ProductImage,
  ProductName,
  ProductPrice,
  SettingRow,
  SettingLabel,
  ThemeToggle,
  ThemeToggleKnob,
  PrivacyToggleRow,
  PrivacyChevron,
  PrivacyDetails,
  PrivacyItem,
  PrivacyKey,
  PrivacyValue,
  PostToggle,
  ToggleBtn,
  AlbumGrid,
  AlbumItemWrap,
  AlbumItem,
  AlbumLayersBadge,
  AlbumLayersIcon,
  ListIcon,
  AlbumIcon,
};
export default Profile;
