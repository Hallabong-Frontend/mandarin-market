import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserProfile, getUserPosts, followUser, unfollowUser } from '../../api/user';
import { getMyProducts, deleteProduct } from '../../api/product';
import { getMyInfo } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeModeContext';
import { useToast } from '../../context/ToastContext';
import { getChatId, getOrCreateChat, subscribeToChats, sendProfileMessage } from '../../firebase/chat';

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
import ProfileShareChatModal from '../../components/profile/ProfileShareChatModal';

import styled from 'styled-components';

const Wrapper = styled.div`
  padding-bottom: 70px;
`;

const Profile = () => {
  const navigate = useNavigate();
  const { accountname } = useParams();
  const { user: me, logout } = useAuth();
  const { isDark, toggleMode } = useThemeMode();
  const toast = useToast();

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
  const [showShareChatModal, setShowShareChatModal] = useState(false);
  const [shareChats, setShareChats] = useState([]);
  const [isShareChatsLoading, setIsShareChatsLoading] = useState(false);

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
      navigate('/not-found', { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [accountname]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!showShareChatModal || !me?.accountname) return;
    setIsShareChatsLoading(true);
    const unsub = subscribeToChats(me.accountname, (chats) => {
      setShareChats(chats || []);
      setIsShareChatsLoading(false);
    });
    return () => unsub();
  }, [showShareChatModal, me?.accountname]);

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
        toast.error('이메일 정보를 불러오지 못했습니다.');
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
      toast.error('팔로우 처리에 실패했습니다.');
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
      toast.error('상품 삭제에 실패했습니다.');
    }
  };

  const getChatPreview = (chat) => {
    if (chat.isGroupChat) {
      return {
        title: chat.groupTitle || '그룹 채팅',
        image: chat.groupImage || '',
      };
    }
    const otherAccountname = (chat.participants || []).find((p) => p !== me?.accountname);
    const info = chat.participantInfo?.[otherAccountname] || {};
    const nickname = chat.nicknames?.[me?.accountname]?.[otherAccountname];
    return {
      title: nickname || info.username || otherAccountname || '채팅',
      image: info.image || '',
    };
  };

  const shareTargets = shareChats.map((chat) => {
    const preview = getChatPreview(chat);
    return {
      id: chat.id,
      title: preview.title,
      image: preview.image,
    };
  });

  const handleShare = () => {
    setShowShareChatModal(true);
  };

  const handleShareToChat = async (chat) => {
    if (!chat?.id || !me?.accountname || !profile?.accountname) return;
    await sendProfileMessage(chat.id, me.accountname, {
      accountname: profile.accountname,
      username: profile.username,
      image: profile.image,
      intro: profile.intro || '',
    });
    setShowShareChatModal(false);
    navigate(`/chat/${chat.id}`);
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
          handleShare={handleShare}
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

      <ProfileShareChatModal
        isOpen={showShareChatModal}
        onClose={() => setShowShareChatModal(false)}
        chats={shareTargets}
        isLoading={isShareChatsLoading}
        onSelect={handleShareToChat}
      />
    </>
  );
};

export default Profile;
