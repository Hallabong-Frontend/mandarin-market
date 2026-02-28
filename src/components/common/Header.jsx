import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import SubmitButton from './SubmitButton';
import BackIconSvg from '../../assets/icons/icon-arrow-left.svg?react';
import MoreIconSvg from '../../assets/icons/icon-more-vertical.svg?react';
import SearchIconSvg from '../../assets/icons/icon-search.svg?react';
import HeartIconSvg from '../../assets/icons/icon-heart.svg?react';
import { useAuth } from '../../context/AuthContext';
import { getUserPosts } from '../../api/user';
import { getImageUrl, formatTimeAgo } from '../../utils/format';

const BackIcon = styled(BackIconSvg)`
  width: 22px;
  height: 22px;
  path {
    stroke: ${({ theme }) => theme.colors.black};
  }
`;

const HeartIcon = styled(HeartIconSvg)`
  width: 22px;
  height: 22px;
  path {
    stroke: ${({ theme }) => theme.colors.black};
  }
`;

const NotificationOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: ${({ theme }) => theme.colors.white};
  z-index: ${({ theme }) => theme.zIndex.overlay};
  display: flex;
  justify-content: center;
`;

const NotificationSheet = styled.div`
  width: 100%;
  max-width: 390px;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 20px 16px 24px;
  overflow-y: auto;
`;

const NotificationTopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const NotificationTitle = styled.h4`
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
  margin: 0;
`;

const NotificationCloseBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.circle};
  color: ${({ theme }) => theme.colors.gray400};
  font-size: 18px;
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

const MoreIcon = () => <MoreIconSvg width="24" height="24" />;

const SearchIcon = () => <SearchIconSvg width="24" height="24" />;

const HeaderWrapper = styled.header`
  position: fixed;
  top: 0;
  left: 50%;
  width: min(100%, 390px);
  z-index: ${({ theme }) => theme.zIndex.header};
  background-color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  transform: translateX(-50%) translateY(${({ $hidden }) => ($hidden ? '-100%' : '0')});
  transition: transform 0.25s ease;
`;

const HeaderSpacer = styled.div`
  height: 48px;
  flex-shrink: 0;
`;

const BackButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fonts.size.md};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
  flex: 1;
  text-align: ${({ $titleLeft }) => ($titleLeft ? 'left' : 'center')};
`;

const LogoText = styled.h1`
  font-size: ${({ theme }) => theme.fonts.size.lg};
  font-weight: ${({ theme }) => theme.fonts.weight.bold};
  color: ${({ theme }) => theme.colors.black};
  flex: 1;
`;

const RightButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TextButton = styled(SubmitButton)`
  width: auto;
  padding: 6px 30px;
`;

const UploadButton = styled(SubmitButton)`
  width: auto;
  padding: 6px 16px;
  font-size: ${({ theme }) => theme.fonts.size.sm};
  font-weight: ${({ theme }) => theme.fonts.weight.medium};
`;

const SearchInputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.gray100};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  padding: 8px 12px;
  gap: 8px;
  margin-left: 8px;
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  font-size: ${({ theme }) => theme.fonts.size.base};
  color: ${({ theme }) => theme.colors.black};
  border: none;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray300};
  }
`;

// type: 'back-only' | 'back-search' | 'back-more' | 'back-title' | 'back-title-more' | 'back-title-upload' | 'back-title-save' | 'back-title-text' | 'logo-search' | 'search-input'
const Header = ({
  type = 'back-title',
  title = '',
  logo = '',
  titleLeft = false,
  onBack,
  onMore,
  onSearch,
  rightText,
  onRightText,
  rightDisabled = false,
  uploadDisabled = true,
  uploadText = '업로드',
  onUpload,
  saveDisabled = true,
  onSave,
  keyword = '',
  onKeywordChange,
  searchPlaceholder = '계정을 검색해보세요',
  alwaysVisible = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifPosts, setNotifPosts] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;

      if (diff < 0) {
        setHidden(false);
      } else if (diff > 5 && currentY > 48) {
        setHidden(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  const handleOpenNotifications = async () => {
    setShowNotifications(true);
    if (!user?.accountname) return;

    setNotifLoading(true);
    try {
      const data = await getUserPosts(user.accountname);
      const allPosts = data.post || [];
      const posts = allPosts.filter((p) => p.heartCount > 0 || p.commentCount > 0);
      setNotifPosts(posts);
    } catch (err) {
      console.error('[알림] API 오류:', err);
    } finally {
      setNotifLoading(false);
    }
  };

  if (type === 'logo-search') {
    return (
      <>
        <HeaderWrapper $hidden={hidden}>
          <LogoText>{logo}</LogoText>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RightButton onClick={handleOpenNotifications} aria-label="알림">
              <HeartIcon />
            </RightButton>
            <RightButton onClick={onSearch} aria-label="검색">
              <SearchIcon />
            </RightButton>
          </div>
        </HeaderWrapper>
        <HeaderSpacer />

        {showNotifications && (
          <NotificationOverlay onClick={() => setShowNotifications(false)}>
            <NotificationSheet onClick={(e) => e.stopPropagation()}>
              <NotificationTopBar>
                <NotificationTitle>알림</NotificationTitle>
                <NotificationCloseBtn
                  type="button"
                  aria-label="알림 닫기"
                  onClick={() => setShowNotifications(false)}
                >
                  ×
                </NotificationCloseBtn>
              </NotificationTopBar>

              {notifLoading ? (
                <NotificationEmpty>불러오는 중...</NotificationEmpty>
              ) : notifPosts.length === 0 ? (
                <NotificationEmpty>새로운 알림이 없습니다.</NotificationEmpty>
              ) : (
                notifPosts.map((post) => {
                  const firstImage = post.image
                    ? post.image.split(',')[0].trim()
                    : null;
                  const preview = post.content
                    ? post.content.length > 20
                      ? post.content.slice(0, 20) + '...'
                      : post.content
                    : '게시물';
                  return (
                    <NotifItem key={post.id} onClick={() => { setShowNotifications(false); navigate(`/post/${post.id}`); }}>
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
                          {post.heartCount > 0 && (
                            <NotifBold>좋아요 {post.heartCount}개</NotifBold>
                          )}
                          {post.heartCount > 0 && post.commentCount > 0 && ', '}
                          {post.commentCount > 0 && (
                            <NotifBold>댓글 {post.commentCount}개</NotifBold>
                          )}
                          가 달렸어요.
                        </NotifText>
                        <NotifTime>{formatTimeAgo(post.updatedAt)}</NotifTime>
                      </NotifContent>
                    </NotifItem>
                  );
                })
              )}
            </NotificationSheet>
          </NotificationOverlay>
        )}
      </>
    );
  }

  if (type === 'search-input') {
    return (
      <>
        <HeaderWrapper $hidden={hidden}>
          <BackButton onClick={handleBack} aria-label="뒤로가기">
            <BackIcon />
          </BackButton>
          <SearchInputWrapper>
            <SearchIcon />
            <SearchInput
              type="text"
              value={keyword}
              onChange={onKeywordChange}
              placeholder={searchPlaceholder}
              autoFocus
            />
          </SearchInputWrapper>
        </HeaderWrapper>
        <HeaderSpacer />
      </>
    );
  }

  return (
    <>
    <HeaderWrapper $hidden={alwaysVisible ? false : hidden}>
      <BackButton onClick={handleBack} aria-label="뒤로가기">
        <BackIcon />
      </BackButton>

      {title && <Title $titleLeft={titleLeft}>{title}</Title>}
      {!title && <div style={{ flex: 1 }} />}

      {type === 'back-search' && (
        <RightButton onClick={onSearch} aria-label="검색">
          <SearchIcon />
        </RightButton>
      )}
      {(type === 'back-more' || type === 'back-title-more') && (
        <RightButton onClick={onMore} aria-label="더보기">
          <MoreIcon />
        </RightButton>
      )}
      {type === 'back-title-upload' && (
        <UploadButton disabled={uploadDisabled} onClick={onUpload}>
          {uploadText}
        </UploadButton>
      )}
      {type === 'back-title-save' && (
        <TextButton disabled={saveDisabled} onClick={onSave}>
          저장
        </TextButton>
      )}
      {type === 'back-title-text' && (
        <TextButton disabled={rightDisabled} onClick={onRightText}>
          {rightText}
        </TextButton>
      )}
      {![
        'back-search',
        'back-more',
        'back-title-more',
        'back-title-upload',
        'back-title-save',
        'back-title-text',
      ].includes(type) && <div style={{ width: 32 }} />}
    </HeaderWrapper>
    <HeaderSpacer />
    </>
  );
};

export default Header;
